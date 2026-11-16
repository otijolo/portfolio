# Interactive Portfolio — The Idea Shop

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Aseprite](https://img.shields.io/badge/Aseprite-FFFFFF?style=for-the-badge&logo=aseprite&logoColor=7D929E)

My portfolio takes the form of an RPG shop, inspired by Undertale's interfaces. A merchant introduces my projects, experience, and contact information through dialogue and interactive pixel art.

The site started as an experiment built entirely with HTML and CSS. This version adds vanilla JavaScript to expand the interactions while preserving the original visual style.

[Visit the portfolio](https://otijolo.github.io/portfolio/)

## Inside the shop

- An entrance and exit door with custom artwork and sound effects.
- A merchant with talking animations, blinking eyes, and pupils that follow the mouse.
- Projects organized into categories, with previews and image galleries displayed on a TV.
- Tools and technologies hanging from animated ropes, with dialogue about my experience with each one.
- Mouse and keyboard navigation, plus a sound toggle.
- Scenery, character, doors, TV, hands, and pixel art icons drawn by me in Aseprite.

## Built with

HTML, CSS, and vanilla JavaScript, with no frameworks or build step. The site is static and can be hosted on GitHub Pages.

## Running locally

1. Clone the repository and open the folder in VS Code.
2. With the Live Server extension installed, right-click `index.html`.
3. Select **Open with Live Server**.

Alternatively, start a Python server from the project folder:

```bash
python -m http.server 5500
```

Then open http://localhost:5500. Use a local server to load the JavaScript modules and audio files.

## Controls

- **Arrow keys:** navigate between options.
- **Z or Enter:** confirm.
- **X:** reveal the full text while it is being typed, or go back.
- **Mouse:** select options, explore the icons, and browse project images.

## Project structure

- `index.html`: page and screen structure.
- `style.css`: styling, layout, and animations.
- `src/`: navigation, dialogue, project catalog, skills, and audio.
- `assets/`: sprites, project images, font, and sound effects.

## Authorship and credits

Experience concept, art direction, and pixel art by Juan Carlos.

The featured projects include collaborative work. The Determination font, sound effects, and other third-party assets belong to their respective creators.

The portfolio is still being improved.
