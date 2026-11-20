const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) { return res.status(400).send('Invalid JSON'); }
  }

  const { items } = body || {};
  if (!items || !items.length) return res.status(400).send('No items provided');

  const dropsPath = path.join(__dirname, '..', 'drops.json');
  let drops;
  try {
    drops = JSON.parse(fs.readFileSync(dropsPath, 'utf8'));
  } catch(e) {
    return res.status(500).send('Could not load product data');
  }

  const lineItems = [];
  let total = 0;

  for (const { dropNumber, itemIndex } of items) {
    const drop = drops.find(d => d.dropNumber === dropNumber || d.id === 'drop-' + dropNumber);
    if (!drop) continue;
    const item = drop.items && drop.items[parseInt(itemIndex, 10)];
    if (!item || !item.price || item.sold) continue;

    const rawImg = (item.images && item.images[0]) || item.image || null;
    const imageUrl = rawImg
      ? 'https://www.eatyourveggiesplease.com/' + rawImg.replace(/^\/?/, '')
      : null;

    const descParts = [item.brand, item.size ? 'Size ' + item.size : null, item.condition].filter(Boolean);

    lineItems.push({
      price_data: {
        currency: 'aud',
        product_data: {
          name: item.name,
          description: descParts.join(' \u00b7 ') || undefined,
          ...(imageUrl ? { images: [imageUrl] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    });
    total += item.price;
  }

  if (!lineItems.length) return res.status(400).send('No valid items found');

  const shippingAmount = total >= 100 ? 0 : 499;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://www.eatyourveggiesplease.com/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.eatyourveggiesplease.com/',
      shipping_address_collection: { allowed_countries: ['AU'] },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: shippingAmount, currency: 'aud' },
          display_name: shippingAmount === 0 ? 'Free Shipping' : 'Standard Shipping',
        },
      }],
    });
    return res.json({ url: session.url });
  } catch(err) {
    console.error('Stripe error:', err.message);
    return res.status(500).send('Could not create checkout session');
  }
};