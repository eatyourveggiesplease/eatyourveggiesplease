# How to Update Drops — Eat Your Veggies Please

Everything that controls what appears on the site lives in one file: **drops.json** on GitHub.
You can edit it directly in your browser — no code knowledge needed.

---

## Getting there

1. Go to [github.com](https://github.com) and sign in
2. Open your **eat-your-veggies** repository
3. Click on **drops.json**
4. Click the **pencil icon** (top right of the file) to edit

---

## The structure of a drop

Each drop looks like this:

```json
{
  "id": "drop-004",
  "dropNumber": "004",
  "dropLabel": "Four",
  "dropName": "The name of this drop",
  "dropSubtitle": "A short tagline for the drop.",
  "veggie": "veggies/carrot.png",
  "price": 85,
  "sold": false,
  "soldDate": null,
  "draft": true,
  "items": [
    { "name": "Item name", "brand": "Brand", "size": "4-5Y", "price": 20, "image": "https://..." },
    { "name": "Item name", "brand": "Brand", "size": "6Y", "price": 15, "image": "https://..." }
  ]
}
```

---

## Common tasks

### Add a new drop (in draft — not visible yet)

Copy the block above, paste it after the last drop (inside the `[` `]`, separated by a comma), and fill in the details. Set `"draft": true` so it doesn't go live until you're ready.

> ⚠️ Make sure every drop except the last one has a comma after its closing `}`.

### Publish a draft drop

Find the drop and change:
```
"draft": true
```
to:
```
"draft": false
```

### Mark a drop as sold

Find the drop and change:
```
"sold": false,
"soldDate": null,
```
to:
```
"sold": true,
"soldDate": "September 2026",
```

### Change an item's price

Find the item inside the drop and update the `"price"` number. Prices are in AUD, whole dollars only (no $ sign).

### Add an item to a drop

Inside the drop's `"items": [ ]` section, add a new line:
```json
{ "name": "Item name", "brand": "Brand", "size": "5-6Y", "price": 18, "image": "https://..." }
```
Make sure the previous item's line ends with a comma.

### Remove an item

Delete the entire line for that item. Make sure there's no trailing comma on the last remaining item.

---

## Adding photos

For real product photos (not placeholder images):

1. Go to the repository on GitHub
2. Click on the **images** folder
3. Click **Add file → Upload files**
4. Upload your photo (JPG or PNG — run it through [Photoroom](https://photoroom.com) first to remove the background)
5. Note the filename exactly (e.g. `drop004-jacket.jpg`)
6. In drops.json, set the item's image to: `"images/drop004-jacket.jpg"`

---

## Veggie characters

Each drop uses a veggie character. Options:
- `"veggies/carrot.png"`
- `"veggies/eggplant.png"`
- `"veggies/turnip.png"`
- `"veggies/tomato.png"`
- `"veggies/onion.png"`
- `"veggies/cucumber.png"`

---

## Saving your changes

When you're done editing:
1. Scroll to the bottom of the GitHub editor
2. Click **Commit changes**
3. Leave the default message and click **Commit changes** again

The site will update automatically within about 30 seconds. 🥕
