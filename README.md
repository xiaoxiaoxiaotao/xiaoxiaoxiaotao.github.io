# Personal Resume & Portfolio Website Template

This project is a clean, responsive, and data-driven personal website template designed for researchers, students, and developers. It features a Single Page Application (SPA) experience using vanilla JavaScript, making it lightweight and easy to deploy on any static hosting service like GitHub Pages.

## Features

- **Single Page Application (SPA)**: Smooth page transitions without full reloads using the History API.
- **Data-Driven Publications**: Manage your publications list easily via a JSON file.
- **Component-Based Architecture**: Separation of concerns with HTML fragments for Navbar, Home, About, etc.
- **Responsive Design**: Mobile-friendly layout using standard CSS.
- **SEO Friendly**: Includes `application/ld+json` structured data for search engines.
- **Zero Dependencies**: Pure HTML, CSS, and JavaScript. No build step or frameworks required.

## Project Structure

```
├── components/          # HTML fragments for different pages/sections
│   ├── about.html       # "About" section content
│   ├── home.html        # Homepage content
│   ├── navbar.html      # Navigation bar structure
│   └── publications.html# Container for the publications list
├── css/
│   └── styles.css       # Global styles
├── images/              # Images and icons (favicon, etc.)
├── js/
│   └── scripts.js       # Main logic for routing and data loading
├── posts/
│   └── publications.json # Data file for publications
├── index.html           # Main entry point and SEO metadata
└── README.md            # This file
```

## How to Run Locally

Since this project fetches HTML components using JavaScript, it requires a local web server to avoid CORS (Cross-Origin Resource Sharing) errors specific to the `file://` protocol.

### Option 1: VS Code Live Server (Recommended)
1. Install the "Live Server" extension in VS Code.
2. Right-click `index.html` and select "Open with Live Server".

### Option 2: Python HTTP Server
If you have Python installed, run one of the following commands in the project root:

```bash
# Python 3
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

## Customization Guide

Follow these steps to make this website your own.

### 1. Basic Information & SEO
Open `index.html` and update the following:
- `<title>` tag.
- `<meta name="description">` and `<meta name="keywords">`.
- The `application/ld+json` script block. Update the `name`, `url`, `alumniOf`, and other personal details to match your profile.

### 2. Website Content
Edit the HTML files in the `components/` folder to change what is displayed on each page:
- **Home**: Edit `components/home.html`.
- **About**: Edit `components/about.html`.
- **Navigation Links**: if you want to add pages, update `components/navbar.html` and update the routing logic in `js/scripts.js` if necessary.

### 3. Publications
You don't need to write HTML for each publication. Just edit `posts/publications.json`.
Add or Modify entries in the `publications` array:

```json
{
    "id": "unique-id",
    "title": "Your Paper Title",
    "authors": "Your Name, Co-authors...",
    "venue": "Conference/Journal Name",
    "year": "2024",
    "status": "published", // or "accepted"
    "doi": "10.xxxx/xxxxx",
    "url": "https://link-to-paper",
    "abstract": "Brief summary...",
    "tags": ["Tag1", "Tag2"]
}
```
The website will automatically render these cards on the Publications page.

### 4. Images
- Replace `images/favicon.ico` with your own favicon.
- Add your profile picture or other assets to `images/` and reference them in your HTML components.

### 5. Styles
Modify `css/styles.css` to change colors, fonts, or layout behaviors to match your personal brand.

## Deployment

### GitHub Pages
1. Push this repository to GitHub.
2. Go to repository **Settings** > **Pages**.
3. Select the branch (e.g., `main`) and folder (usually `/` root).
4. Save. Your site will be live at `https://yourusername.github.io/repo-name/`.

**Note:** If you are using a custom domain (like `lisongtao.eu.org`), update the `CNAME` file with your domain name. If not, you can delete the `CNAME` file.
