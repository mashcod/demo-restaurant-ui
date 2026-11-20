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
- `js/script.js` — modal behavior, live menu placeholder, and EmailJS form submission
- `css/photos/` — reserved for local images (currently uses Unsplash URLs)

## Run locally
Open `index.html` in a browser, or serve the project folder with any static web server. The site loads Google Fonts, Font Awesome, and EmailJS from their hosted CDNs.

Using Python, run from the project folder:

```bash
python -m http.server 5173
```

Then open http://localhost:8000

## Admin Panel
The header Admin Panel button redirects to:
https://restaurant-demo-eight-omega.vercel.app

## EmailJS configuration
The reservation form is configured in `js/script.js` with an EmailJS public key, service ID, and template ID. Update these with your own EmailJS credentials for live delivery.
