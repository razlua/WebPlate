# WebPlate

Copy-paste website components: buttons, 18 button animations, cards, pricing tables, layouts, forms, alerts, modals, tabs, tables and more. Plain HTML and CSS, with light and dark mode built in.

**See everything live:** https://razlua.github.io/WebPlate/

## Use it

1. Copy `css/webplate.css` into your site. Copy `js/webplate.js` too if you want the click effects, tabs, toasts and modals.
2. Link them and add `class="wp"` to your `<body>`:

```html
<link rel="stylesheet" href="css/webplate.css">
<script src="js/webplate.js" defer></script>

<body class="wp">
  <button class="wp-btn wp-btn--primary wp-fx-lift">Hello</button>
</body>
```

3. On the showcase page, open **Show code** under any example and press **Copy**.

## Button animations

Add one class to any `wp-btn`:

| Class | Effect | Needs JS |
|---|---|---|
| `wp-fx-lift` | Rises with a shadow on hover | |
| `wp-fx-shine` | A light sweep crosses it | |
| `wp-fx-fill` | Colour slides in from the left | |
| `wp-fx-draw` | The border draws itself | |
| `wp-fx-nudge` | The trailing icon slides forward | |
| `wp-fx-swap` | Label rolls to `data-swap` text | |
| `wp-fx-halo` | Soft ring on hover | |
| `wp-fx-underline` | Underline grows (links) | |
| `wp-fx-ripple` | Ink spreads from the click | yes |
| `wp-fx-ring` | One ring on click | yes |
| `wp-fx-jelly` | Squishes on click | yes |
| `wp-fx-pop` | Small bounce on click | yes |
| `wp-fx-shake` | Shakes, for errors | yes |
| `wp-fx-tilt` | Leans toward the cursor | yes |
| `wp-fx-magnet` | Drifts toward the cursor | yes |
| `wp-fx-hold` | Press and hold to confirm, fires `wp:held` | yes |
| `wp-fx-letters` | Letters rise one by one | yes |
| `data-wp-load="Done"` | Spinner, then a done state | yes |

Everything respects the visitor's reduced-motion setting.

## Theming

All colours, corners and motion are CSS variables at the top of `webplate.css`:

```css
:root {
  --wp-accent: #2f6fdf;
  --wp-accent-hover: #2560c8;
  --wp-r: 6px;
}
```

Dark mode follows the visitor's system. Force it with `<html data-theme="dark">`, or let people switch with `wpTheme('dark' | 'light' | 'system')`.

## JavaScript helpers

- `wpToast('Saved')`, or `<button data-wp-toast="Saved">`
- `<button data-wp-open="my-modal">` opens `<dialog class="wp-modal" id="my-modal">`; `data-wp-close` closes it
- Tabs: `.wp-tabs` with `role="tab"` buttons and `aria-controls`
- `data-wp-copy="text"` copies text to the clipboard

## Licence

MIT. Use it in anything, personal or commercial.
