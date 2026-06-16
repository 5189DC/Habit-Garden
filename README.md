# Habit Garden

Version: `v0.1.3`

Habit Garden is a small habit-tracking app where completing habits grows plants in a garden bed.

You can add a habit, choose which plant it should grow, choose how often you want to water it, then press **Water** when you complete that habit for the day. Each plant can only be watered once per local calendar day, so the same habit cannot be counted twice by accident. The app stores a local day key for each plant, which keeps the once-per-day lock reliable on mobile browsers. Plant choice controls the visual style:

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

The app shows your total waterings, how many plants have fully grown, each habit's current plant stage, the last time each plant was watered, and how many more waterings are needed before the next growth stage. After a plant is watered, its water button changes to **Done today** until the next local day. You can reset a single plant back to a seed or remove one plant from the garden.

The garden bed has 10 plots for now. Planted habits appear in the bed, and empty plots stay ready for future habits. You can water a plant from the garden bed or from the habit detail card.

The garden panel has two tabs: **Your garden** and **Calendar**. The calendar lets you choose a year and month, then shows plant icons with habit names on days when a habit was started or watered. New waterings are saved into a watering history so the calendar can show them going forward.

The garden uses staged hand-drawn plant sprites, staggered plots, soil texture, dry/freshly-watered states, stronger weather overlays, and small watering effects so plants feel more alive as habits progress. The plant artwork is stored in `assets/plants/`, with five growth-stage images for each plant.

The app can animate the garden sky from local weather using Open-Meteo current conditions. Use **Use my location** to let the browser share your location for the weather animation. If location is unavailable, the app falls back to a default garden sky. Your garden is saved in the browser with `localStorage`.

## How To Open

### From GitHub Pages

If GitHub Pages is enabled for this repository, open the published site URL in your browser. On iPhone, open the URL in Safari and use **Share** -> **Add to Home Screen** to keep it like an app icon.

If an iPhone still shows old behavior after an update, refresh the Safari page or remove and re-add the Home Screen shortcut. The app uses versioned file links to help Safari fetch the current release.

Location-based weather animation requires the site to be served over HTTPS, which GitHub Pages provides.

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

Habit data is saved in the browser on the device you use. A garden saved on your computer will not automatically sync to your iPhone unless a cloud database is added later.
