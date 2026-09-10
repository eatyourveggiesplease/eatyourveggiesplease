# Eat Your Veggies (please) — Launch Guide

## What's in this folder

| File | What it does |
|------|-------------|
| `index.html` | The full website |
| `products.json` | Your product inventory — edit this to add/remove items |
| `LAUNCH-GUIDE.md` | This file |

---

## Step 1 — Preview it locally

Double-click `index.html` to open it in your browser. You'll see the site immediately.

> Note: The cart works, but products won't load until you serve it from a proper server or deploy it (browsers block local file fetches). Use Step 2 to fix this.

---

## Step 2 — Put it on GitHub (free, required for Netlify)

1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Click **New repository** → name it `eat-your-veggies` → set to **Public** → click Create
3. Upload all files in this folder to the repo (drag and drop works)

---

## Step 3 — Deploy to Netlify (free)

1. Go to [netlify.com](https://netlify.com) → Sign up free (use your GitHub account)
2. Click **Add new site → Import an existing project → GitHub**
3. Select your `eat-your-veggies` repo
4. Leave all settings as default → click **Deploy site**
5. In ~60 seconds your site is live at a URL like `https://eat-your-veggies-abc123.netlify.app`

**Every time you push a change to GitHub, Netlify redeploys automatically. Zero effort.**

---

## Step 4 — Connect a custom domain (~$15–20/year)

1. Buy a domain — recommended: [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (at-cost pricing, no markup)
   - Suggested: `eatyourveggiesplease.com.au` (~$20/year)
2. In Netlify: **Site settings → Domain management → Add custom domain**
3. Follow the DNS instructions Netlify gives you (takes ~24hrs to propagate)

---

## Step 5 — Add your Stripe keys (to take payments)

Stripe has no monthly fee — you only pay ~1.75% + 30¢ per successful sale.

1. Create a free account at [stripe.com](https://stripe.com)
2. Go to **Developers → API keys** → copy your **Publishable key**
3. In `index.html`, find this line near the top of the `<script>` section:
   ```
   const STRIPE_PUBLISHABLE_KEY = 'pk_test_REPLACE_WITH_YOUR_KEY';
   ```
   Replace the value with your key.
4. For full checkout (taking real payments), you'll also need a **Netlify Function** for the server-side session — ask Claude to build that when you're ready.

---

## Managing your products

Edit `products.json` in any text editor (or ask Claude to do it). Each product looks like:

```json
{
  "id": "eyv-001",
  "name": "Striped Cotton Tee",
  "description": "Soft cotton stripe tee, barely worn.",
  "price": 12,
  "size": "3–4Y",
  "gender": "unisex",
  "brand": "Seed Heritage",
  "condition": "Excellent",
  "category": "Tops",
  "image": "https://your-image-url.jpg"
}
```

To mark an item as **sold**, add `"sold": true` — it stays on the site with a sold overlay.

To **remove** it entirely, delete its block from the file.

### Image hosting (free)
Upload product photos to [Cloudinary](https://cloudinary.com) free tier or just drop them in your GitHub repo in an `images/` folder and reference them as `"image": "images/my-photo.jpg"`.

---

## Ongoing costs summary

| Item | Cost |
|------|------|
| Netlify hosting | **Free** |
| GitHub | **Free** |
| Domain (optional but recommended) | ~$20/year |
| Stripe | 1.75% + 30¢ per sale (no monthly fee) |
| **Total fixed costs** | **~$20/year** |

---

## What's next (when you're ready)

- [ ] Swap placeholder product images for real photos
- [ ] Upload Hannah's logo and update brand colours in `index.html`
- [ ] Add Stripe keys and build the payment function
- [ ] Add a contact/Instagram link in the footer
- [ ] Set up a free Netlify CMS so Hannah can manage products via a browser admin panel
