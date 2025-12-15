# Easilon Bank - Banking Page

A modern, enhanced banking page with beautiful UI and interactive features.

## How to Test

### Option 1: Direct Browser Opening (Quick Test)
1. Simply double-click `index.html` file
2. It will open in your default browser
3. All features should work immediately

### Option 2: Using a Local Server (Recommended)
For the best testing experience, use a local server:

#### Using Python (if installed):
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open: `http://localhost:8000`

#### Using Node.js (if installed):
```bash
npx http-server -p 8000
```
Then open: `http://localhost:8000`

#### Using PHP (if installed):
```bash
php -S localhost:8000
```
Then open: `http://localhost:8000`

## Features to Test

### ✅ Navigation
- Click navigation links to scroll smoothly to sections
- Test mobile menu (hamburger icon) on smaller screens
- Verify active link highlighting on scroll

### ✅ Hero Section
- Check animated background shapes
- Verify statistics counter animations
- Test CTA buttons

### ✅ Loan Calculator
- Adjust loan amount slider/number input
- Change interest rate
- Modify loan term
- Verify real-time calculation updates
- Check "Apply Now" button

### ✅ Services Section
- Hover over service cards to see elevation effect
- Click "Learn More" links
- Verify smooth animations on scroll

### ✅ Responsive Design
- Resize browser window to test mobile/tablet views
- Test hamburger menu on mobile
- Verify all sections adapt properly

### ✅ Interactive Elements
- Button click ripple effects
- Smooth scrolling
- Card hover animations
- Parallax effects on scroll

## Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure
```
bfsi/
├── index.html      # Main HTML file
├── styles.css      # All styling and animations
├── script.js       # Interactive features and calculator
└── README.md       # This file
```

## Notes
- All fonts are loaded from Google Fonts (requires internet)
- Font Awesome icons loaded from CDN (requires internet)
- No backend required - pure frontend implementation

