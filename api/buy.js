const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  const { dropId, itemIndex } = req.query;

  // Load drops.json
  const dropsPath = path.join(__dirname, '../drops.json');
  let drops;
  try {
    drops = JSON.parse(fs.readFileSync(dropsPath, 'utf8'));
  } catch (err) {
    return res.status(500).send('Could not load drops data.');
  }

  // Find the drop
  const drop = drops.find(d => d.dropNumber === dropId || d.id === 'drop-' + dropId);
  if (!drop) {
    return res.status(404).send('Drop not found.');
  }

  // Find the item
  const idx = parseInt(itemIndex, 10);
  const item = drop.items && drop.items[idx];
  if (!item) {
    return res.status(404).send('Item not found.');
  }

  if (!item.price) {
    return res.status(400).send('This item has no price set.');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'aud',
          product_data: {
            name: item.name,
            description: [item.brand, item.size ? `Size ${item.size}` : null, item.condition]
              .filter(Boolean).join(' · '),
            images: item.images
              ? [`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/${item.images[0]}`]
              : item.image
              ? [`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/${item.image}`]
              : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/`,
      shipping_address_collection: { allowed_countries: ['AU'] },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 995, currency: 'aud' },
          display_name: 'Standard Shipping',
        },
      }],
      metadata: {
        drop_id: drop.id,
        item_index: String(idx),
        item_name: item.name,
      },
    });

    return res.redirect(303, session.url);
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).send('Could not create checkout session.');
  }
};
