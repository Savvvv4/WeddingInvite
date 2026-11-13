# Vanshika & Swastik — Engagement Invitation

Static digital engagement invitation. Built with HTML, CSS and vanilla JavaScript.

## Event
- Wednesday, 2 December 2026, 6 PM
- Myst by The Zora, Lodhi Road, New Delhi

## Screens
1. Cover: Ganesh ji, the mantra (ॐ श्री गणेशाय नमः, with its English spelling), "You are invited" and the Open Invitation button
2. The Khandelwal family's invitation, with a "Scroll down" prompt
3. Save the date, with the 6 PM time, countdown and the Add Reminder button
4. Venue and directions
5. Closing note from Sunita & Vikrant

## Files
- `index.html`: page structure and invitation wording
- `style.css`: layout, colours and responsive sizing
- `config.js`: event date, time, venue and calendar text
- `reminder.js`: Google Calendar link and .ics download with two alerts
- `viewport.js`: viewport sizing and rotation handling
- `script.js`: opening animation, sound, scroll progress and countdown

## Responsive behaviour
Each screen is one visible screen tall. Artwork scales uniformly without stretching. On short screens under 560px tall, pages keep a 560px minimum height and scroll freely.

## Assets
Artwork lives in `assets/`:
- `arch-teal.webp`: cover and save-the-date background
- `frame-swans.webp`: venue background
- `lake-swans.webp`: screens 2 and 5
- `ganesha.svg`: Ganesh ji illustration

## Sound
The background sound and opening chime are synthesised in the browser using the Web Audio API. Sound starts only after Open Invitation is pressed. The speaker button toggles it on and off.

## Deploy
Import the repository into Vercel as a static site. Use the repository root, with no build command and no output directory.
