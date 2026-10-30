# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## AtrioNovo booking widget

The widget shows the booking form that fits the type of the business: a
table reservation for restaurants and a massage appointment (massage with
price, day, free time, details and an optional note) for massage businesses.
The business is identified by its public slug.

Embed on a website:

```html
<script src="https://booking.atrionovo.com/widget.js" data-business="your-slug"></script>
```

- `data-business` is the slug of the business (`data-restaurant` still works).
- `data-label` (optional) sets the text of the floating button, for example
  `data-label="Boek een massage"`. Without it the button says "Reserveer".

Or open the booking page directly: `https://booking.atrionovo.com/?business=your-slug`
(`?restaurant=your-slug` still works).
