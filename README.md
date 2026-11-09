# OrbitFood

OrbitFood is a restaurant website for Web Technologies I, continued from midterm to endterm. The idea is to help visitors browse a small seasonal menu, read about a dish, plan a visit and try a pickup order.

[Open the website](https://ramin293.github.io/web_endterm/)

The layout is based on our [Figma wireframes](https://www.figma.com/design/33DjxGXbiNhiNw5JFCWh98/Task-5-StudyFlow-Wireframes?node-id=0-1). The file is named StudyFlow, but the restaurant project inside it is OrbitFood.

## Pages

- Home: introduction and featured dishes.
- Menu: starters, mains and desserts.
- Dish details: pumpkin risotto, ingredients and related dishes.
- Reservation: date, time, guest count and name.
- About: the restaurant story, opening hours, location and team.
- Order: choose one dish, the number of portions and a pickup time.

There are also two informational pages for the reservation and order demos. The same navigation and footer are used throughout the site.

## How to open it

Download the project and open `index.html` in a browser. No installation or build command is needed. Bootstrap, jQuery and the photographs are stored locally, so the pages work without an internet connection. The external Figma and map links need internet access. For reliable favorites storage across pages, use the published website or serve the project over local HTTP.

## What we used

The site uses HTML, CSS, Bootstrap 5.3.8, vanilla JavaScript and jQuery 3.7.1. The endterm adds an interactive menu, custom form validation, an order estimate and jQuery interactions. There is no backend.

- Semantic HTML for the header, navigation, main content, sections, articles, forms and footer.
- Flexbox for the navigation, buttons and order rows.
- CSS Grid for the food cards.
- Relative and absolute positioning for the label on the home page photograph.
- Bootstrap containers, rows and columns for page layouts.
- Bootstrap spacing, text, button and form classes.
- Media queries at 991px and 767px for tablet and phone layouts.
- An HTML table for opening hours on the About page.
- Accessible field labels and JavaScript validation with field-specific feedback.

All custom styles are in `css/style.css`. Vendor licences are in `bootstrap/LICENSE` and `jquery/LICENSE.txt`.

## About the forms

This is a fictional restaurant and a static student project. With JavaScript enabled, each form validates on the same page and displays a demo success message. It focuses the first invalid field and updates feedback as values are corrected. Without JavaScript, native HTML validation leads to an informational page.

Both forms use Astana date and time and reject past slots. The order form estimates the cost of one dish with 1 to 6 portions using prices from the shared menu array.

Use sample details when testing. The forms do not send bookings, accept payments or save orders. The address is fictional, and the map link opens Astana. Prices are shown in USD to match the wireframes.

## GitHub Pages

The repository is [Ramin293/web_endterm](https://github.com/Ramin293/web_endterm).

GitHub Pages publishes the `main` branch from `/ (root)`. Pushing changes to `main` updates the website after the deployment finishes.

## Before the defence

Open each page and try the navigation and forms. Resize the browser to check the tablet and phone layouts. Be ready to show the table, explain the semantic tags, and point out where Flexbox, Grid, positioning, Bootstrap and media queries are used.

## Sources

- [Bootstrap](https://getbootstrap.com/docs/5.3/) for the CSS framework.
- [Restaurant interior](https://images.unsplash.com/photo-1517248135467-4c7edcad34c4) from Unsplash.
- [Restaurant table](https://images.unsplash.com/photo-1414235077428-338989a2e8c0) from Unsplash.
- [Risotto](https://unsplash.com/photos/7TaFlRyAhSQ) by Luna Hu on Unsplash.
- [Sea bass](https://unsplash.com/photos/jMwvJ5aj5eA) by Patrick Browne on Unsplash.
- [Fruit tart](https://unsplash.com/photos/UcYoEO5nSNE) by Toa Heftiba on Unsplash.
- [Mushroom toast](https://unsplash.com/photos/83Lq4rDrx_o) by Sofia Holmberg on Unsplash.

## Endterm team and work split

The contributors are identified here by their GitHub accounts. Detailed responsibilities and acceptance checks are in [ENDTERM_PLAN.md](ENDTERM_PLAN.md).

- [Ramin293](https://github.com/Ramin293): interactive menu, shared dish data, DOM manipulation, menu events and favorites.
- [arnur-kozhabergen](https://github.com/arnur-kozhabergen): reservation and order validation, live order estimate, jQuery interactions and endterm documentation.

## New interactive menu

Open `menu.html` with JavaScript enabled. No packages or build step are required.

1. Initially all four dishes appear under the original categories.
2. Type `pumpkin` or `sage`: only risotto remains. Search `xyz`: an empty-state message appears. Reset filters restores all dishes.
3. Select Mains: two dishes remain. Sort high to low: sea bass ($26) precedes risotto ($18); low to high reverses them. Sorting applies within each category.
4. Save two favorites and enable Show favorites only. Remove one favorite: its card disappears and the count updates. Reset filters preserves saved favorites.
5. Reload: saved favorites remain for the same browser origin. Clear favorites removes all; the favorites-only view then shows the empty state.
6. Combine search, category and favorites filters; all conditions apply together.
7. Use Tab, Enter and Space to operate controls. Check at phone and desktop widths. Open `menu.html#fish` to test existing deep links.
8. If storage is blocked, favorites still work for the current visit and a notice explains that they cannot persist. Without JavaScript a link leads to the static order list.

`js/menu-data.js` exposes `window.OrbitFood.dishes` and `.categories`. `js/menu.js` renders cards using DOM methods and textContent, handles events, and stores only favorite dish IDs under `orbitfood.favorites.v1`. No personal details are stored. Both scripts are deferred; load the data script first.

## How to test forms and jQuery

1. Open Reserve and submit with empty fields. Check that individual errors appear and keyboard focus moves to the date field. Try a date in the past, a time that already passed today in Astana and a name containing only spaces.
2. Enter a future date, a listed time, 2 guests and a sample name. Submit again and check the demo success message. Change a field and check that the old success message clears.
3. Open Order and try submitting without a dish or pickup slot. Select the $18 risotto and enter 2 portions. The total should be $36. Try 0, 7 or a fractional quantity, then restore a valid quantity and submit with a future pickup date and time.
4. Open About. Click a FAQ question or use Enter to reveal its answer. Activate the same question again to close it. On Reserve, use Tab to focus the optional note and then move away. The example should fade in and out.
5. Open both result pages directly. They should display information about the demos. Repeat the main interactions on a phone-width screen.

`js/forms.js` uses native event listeners and `preventDefault()`. `js/enhancements.js` uses ID and class selectors, `closest()` and `find()`, and jQuery slide and fade effects.

## Repository migration

The complete project was copied from `web1_endterm/web1_midterm-main` into this repository root. The source directory was preserved. This repository starts with a new Git history. GitHub Pages serves `main` from `/` at https://ramin293.github.io/web_endterm/.
