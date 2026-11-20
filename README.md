# Spice Garden Demo Restaurant Website

Responsive restaurant website for Spice Garden Demo Restaurant, built with HTML, CSS, and vanilla JavaScript.

## Website sections
- Hero panels for reservations and live menu
- About Us and chef profiles
- Menu highlights and live menu button
- Featured spaces and gallery
- Guest review, contact options, and reservation form
- Admin Panel button redirecting to the restaurant admin app

## Project files
- `index.html` — page content and structure
- `css/style.css` — theme, layout, and responsive styles
- js/live-menu.js — live menu loading, filtering, cart, and order submission
- `js/script.js` — reservation/contact modal behavior and EmailJS form submission
- `css/photos/` — reserved for local images (currently uses Unsplash URLs)

## Run locally
Open `index.html` in a browser, or serve the project folder with any static web server. The site loads Google Fonts, Font Awesome, and EmailJS from their hosted CDNs.

Using Python, run from the project folder:

```bash
python -m http.server 5173
```

Then open http://localhost:5173

## Live Menu and Orders
The two **Get Live Menu** buttons load the current customer-facing menu from the Restaurant Demo backend. Visitors can filter by category and subcategory, search dishes, select full or half portions, view offer pricing, add items to a cart, and send an order. The public menu does not include menu editing, offer management, source labels, or an orders list.

The backend API base URL is configured at the top of js/live-menu.js:

~~~js
const API_BASE = 'https://restaurant-demo-5m96.onrender.com/api/v1';
~~~

The page reads GET /menu/current and submits orders to POST /orders. If the backend URL changes, update API_BASE. The backend's CORS_ALLOWED_ORIGINS environment variable must include this site's deployed origin (scheme and hostname only, with no path) or browsers will block API requests.

## Admin Panel
The header Admin Panel button redirects to:
https://restaurant-demo-eight-omega.vercel.app

## EmailJS configuration
The reservation form is configured in `js/script.js` with an EmailJS public key, service ID, and template ID. Update these with your own EmailJS credentials for live delivery.
