const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Disable Vercel's automatic body parsing — Stripe needs the raw body to verify the signature
module.exports.config = { api: { bodyParser: false } };

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Read raw body from stream
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);

  // Verify the request is genuinely from Stripe
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Only care about completed payments
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;
  const itemIds = (session.metadata?.item_ids || '').split(',').filter(Boolean);

  if (!itemIds.length) {
    console.log('No item_ids in session metadata — nothing to mark sold');
    return res.status(200).json({ received: true });
  }

  try {
    const ghToken = process.env.GITHUB_TOKEN;
    const apiBase = 'https://api.github.com/repos/eatyourveggiesplease/eatyourveggiesplease/contents';

    // Fetch current drops.json from GitHub
    const fileRes = await fetch(`${apiBase}/drops.json`, {
      headers: {
        'Authorization': `token ${ghToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    const fileData = await fileRes.json();
    const sha = fileData.sha;
    const drops = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));

    // Find and mark matching items as sold
    // Item IDs are built in create-checkout.js as: `${drop.id}-${item.name.toLowerCase().replace(/\s+/g, '-')}`
    let changed = false;
    const markedSold = [];

    for (const drop of drops) {
      for (const item of drop.items || []) {
        const itemSlug = `${drop.id}-${item.name.toLowerCase().replace(/\s+/g, '-')}`;
        if (itemIds.includes(itemSlug) && !item.sold) {
          item.sold = true;
          changed = true;
          markedSold.push(itemSlug);
        }
      }
    }

    if (!changed) {
      console.log('Items already marked sold or not found:', itemIds);
      return res.status(200).json({ received: true, note: 'No changes needed' });
    }

    // Commit updated drops.json back to GitHub
    const updatedContent = Buffer.from(JSON.stringify(drops, null, 2) + '\n').toString('base64');
    const putRes = await fetch(`${apiBase}/drops.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${ghToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Auto-mark sold: ${markedSold.join(', ')}`,
        content: updatedContent,
        sha,
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      console.error('GitHub commit error:', err);
      return res.status(500).json({ error: 'Failed to update drops.json' });
    }

    console.log('Marked as sold:', markedSold);
    return res.status(200).json({ received: true, marked_sold: markedSold });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: err.message });
  }
};
