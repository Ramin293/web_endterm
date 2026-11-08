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

There are also two simple result pages for the reservation and order forms. The same navigation and footer are used throughout the site.

## How to open it

Download the project and open `index.html` in a browser. No installation or build command is needed. Bootstrap and the photographs are stored locally, so the pages also work without an internet connection. The external Figma and map links need internet access.

## What we used

The site uses HTML, CSS, Bootstrap 5.3.8 and external vanilla JavaScript. Endterm part 1 adds the interactive menu; form validation and jQuery remain assigned to part 2. There is no backend.

- Semantic HTML for the header, navigation, main content, sections, articles, forms and footer.
- Flexbox for the navigation, buttons and order rows.
- CSS Grid for the food cards.
- Relative and absolute positioning for the label on the home page photograph.
- Bootstrap containers, rows and columns for page layouts.
- Bootstrap spacing, text, button and form classes.
- Media queries at 991px and 767px for tablet and phone layouts.
- An HTML table for opening hours on the About page.
- Labels and basic HTML validation for the forms.

All custom styles are in `css/style.css`. The original Bootstrap licence is in `bootstrap/LICENSE`.

## About the forms

This is a fictional restaurant and a static student project. The forms check required fields using the browser and open a demo result page. They do not check table availability, send bookings, accept payments or save orders.

The order form supports one dish with 1 to 6 portions. It does not calculate a live total or keep a shopping cart. The Menu page now supports category filtering, ingredient search, sorting and favorites. Existing category and dish anchors remain available when their items are visible.

Forms use GET, so the entered values appear in the result page URL. Use sample details when testing. The address is fictional, and the map link opens Astana. Prices are shown in USD to match the wireframes. The photographs illustrate the menu and restaurant concept.

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

There are two contributors. The repository does not state both students' full names: replace the role labels below with your real names before submission. Detailed responsibilities and acceptance checks are in [ENDTERM_PLAN.md](ENDTERM_PLAN.md).

- Ramin293 (you): interactive menu, JavaScript data and functions, DOM manipulation, events, favorites, documentation. Implemented in this commit.
- Student 2 (partner): custom reservation/order validation, jQuery interactions, final deployment verification and shared defence preparation. Pending.

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

Part 1 does not complete the endterm: the substantial form validation, jQuery requirements and final published-version checks are still pending.

## Repository migration

The complete project was copied from `web1_endterm/web1_midterm-main` into this repository root. The source directory was preserved. This repository starts with a new Git history. GitHub Pages serves `main` from `/` at https://ramin293.github.io/web_endterm/.
