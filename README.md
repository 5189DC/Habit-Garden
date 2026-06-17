# Habit Garden

Version: `v0.2.2`

Open the app: [https://5189dc.github.io/Habit-Garden/](https://5189dc.github.io/Habit-Garden/)

For iPhone, open that link in Safari, then use **Share** -> **Add to Home Screen** if you want Habit Garden to appear like an app.

Habit Garden is a small habit-tracking app where completing habits grows plants in a garden bed.

You can add a habit, choose which plant it should grow, choose how often you want to water it, then press **Water** when you complete that habit for the day. The first watering starts the plant and records that it was watered, but it does not count toward growth yet, so monthly or 14-day habits do not grow immediately on the day they are planted. After that, each plant can only be watered once per local calendar day, so the same habit cannot be counted twice by accident. The app stores a local day key for each plant, which keeps the once-per-day lock reliable on mobile browsers. Plant choice controls the visual style:

- Sprout
- Daisy
- Fern
- Violet
- Cactus
- Sunflower
- Bonsai
- Orchid
- Lavender
- Sakura

Watering schedule controls how quickly the plant grows:

- Every 1, 2, or 3 days: grows every 5 waterings.
- Every 4 days: grows every 3 waterings.
- Every 5 or 7 days: grows every 2 waterings.
- Every 14 days or monthly: grows every watering.

The app shows your total waterings, how many plants have fully grown, each habit's current plant stage, the last time each plant was watered, the current streak, whether the plant is due, and how many more waterings are needed before the next growth stage. After a plant is watered, its water button changes to **Done today** until the next local day. You can edit a habit, reset a single plant back to a seed, or remove one plant from the garden.

The garden bed has 10 plots for now. Planted habits appear in the bed, and empty plots stay ready for future habits. You can water a plant from the garden bed or from the habit detail card.

The garden view also shows quick insight cards for this week's waterings, plants due today, and best streak. Reward badges unlock as the garden reaches milestones such as the first sprout, 10 waterings, first bloom, a 7 day streak, and a full garden. Starter habit chips make it faster to plant common habits such as reading, drinking water, exercise, and stretching.

The garden panel has two tabs: **Your garden** and **Calendar**. The calendar lets you choose a year and month, then shows a clean day summary with plant icons plus started/watered counts. Selecting a day shows the full event details with action badges, plant icons, habit names, and plant names. On phone-sized screens, the calendar changes into a row-based agenda so the events are easier to read.

The garden uses staged hand-drawn plant sprites, staggered plots, soil texture, dry/freshly-watered states, stronger weather overlays, and small watering effects so plants feel more alive as habits progress. Plant motion is layered so the base stays planted while the upper leaves and flowers move gently in the breeze, with a calmer bonsai animation so the pot does not wobble. The plant artwork is stored in `assets/plants/`, with five growth-stage images for each plant.

The app can animate the garden sky from local weather using Open-Meteo current conditions. It uses a saved browser location if one already exists, otherwise it tries an approximate IP-based location, then falls back to a default garden sky. Your garden is saved in the browser with `localStorage`.

You can export your garden data to a JSON file and import it later on the same or another device. Version `v0.2.2` also includes a web app manifest, icon, and service worker so the app can be added to an iPhone Home Screen and cached for a more app-like experience.

The local development version can show a **Test watering** checkbox for quickly checking plant growth. That test control is completely hidden and forced off on the published GitHub Pages app, so friends using the public link get the normal once-per-day habit flow.

## How To Open

### From GitHub Pages

Open the published app here:

[https://5189dc.github.io/Habit-Garden/](https://5189dc.github.io/Habit-Garden/)

On iPhone, open the link in Safari and use **Share** -> **Add to Home Screen** to keep it like an app icon.

If an iPhone still shows old behavior after an update, refresh the Safari page or remove and re-add the Home Screen shortcut. The app uses versioned file links and a versioned service-worker cache to help Safari fetch the current release.

Weather animation works best over HTTPS, which GitHub Pages provides.

### Directly From The Files

You can open the app directly:

1. Open `index.html` in your browser.

### With A Local Server

You can also run it with a local server:

1. Open a terminal in this folder.
2. Run:

```bash
python3 -m http.server 8765
```

3. Visit:

```text
http://127.0.0.1:8765/
```

## Notes

Habit data is saved in the browser on the device you use. A garden saved on your computer will not automatically sync to your iPhone unless you use the export/import buttons or a cloud database is added later.
