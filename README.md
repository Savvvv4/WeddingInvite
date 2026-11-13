# Vanshika & Swastik — Engagement Invitation

Static digital engagement invitation. Built with HTML, CSS and vanilla JavaScript.

## Event
- Wednesday, 2 December 2026, 6 PM
- MYST by The Zora, Jawahar Lal Nehru Stadium, Lodhi Road, New Delhi

## Screens
1. Cover: lotus Ganesh ji motif, ॥ श्री गणेशाय नमः ॥, "You are invited" and the Open Invitation button
2. The Khandelwal family's invitation, with a "Swipe up" prompt
3. Save the date, with the 6 PM time, countdown, Add to Calendar button (Apple Calendar on iPhone/Mac, Google Calendar elsewhere)
4. Venue and directions
5. Closing note from Sunita & Vikrant

## Files
- `index.html`: page structure and invitation wording
- `style.css`: layout, colours and responsive sizing
- `config.js`: event date, time, venue and calendar text
- `reminder.js`: Google Calendar link and .ics download with two alerts
- `viewport.js`: viewport sizing and rotation handling
- `script.js`: opening animation, music, scroll progress and countdown

## Responsive behaviour
Each screen is one visible screen tall. Artwork scales uniformly without stretching. On short screens under 560px tall, pages keep a 560px minimum height and scroll freely.

## Assets
Artwork lives in `assets/`:
- `arch-teal.webp`: cover and save-the-date background
- `frame-swans.webp`: venue background
- `lake-swans.webp`: screens 2 and 5
- `ganesha.webp`: lotus Ganesh ji motif (transparent)
- `music.mp3`: background song (Mangal Rang, 128 kbps)

## Music
`assets/music.mp3` plays on loop from the moment the page loads. Browsers that block sound until the guest interacts start it on the first tap, swipe, scroll or key press, and at the latest when Open Invitation is pressed. There is no mute button.

## Deploy
Import the repository into Vercel as a static site. Use the repository root, with no build command and no output directory.
