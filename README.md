# Vanshika & Swastik — Engagement Invitation

Static digital engagement invitation. Built with HTML, CSS and vanilla JavaScript.

## Event
- Wednesday, 2 December 2026, 6 PM
- Myst by The Zora, Lodhi Road, New Delhi

## Screens
1. Cover: Ganesh ji, the mantra, "You are invited" and the Open Invitation button
2. The Khandelwal family's invitation
3. Save the date, with the 6 PM time and countdown
4. Venue and directions
5. Closing note from Sunita & Vikrant

## Assets
Artwork lives in `assets/`:
- `arch-teal.webp`: cover and save-the-date background
- `frame-swans.webp`: venue background
- `lake-swans.webp`: background for screens 2 and 5
- `ganesha.svg`: Ganesh ji illustration on the cover

To change the background on screens 2 and 5, swap the file and edit the `.art-new` rule in `style.css` (see the comment above it).

## Sound
The background sound and the opening chime are synthesised in the browser (Web Audio API), so there are no audio files. Browsers only allow sound after a tap, so it starts when Open Invitation is pressed. A speaker button at the top right turns it off and on.

## Deploy
Import the repository into Vercel as a static site. Use the repository root, with no build command and no output directory.
