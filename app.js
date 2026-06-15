const plants = [
  {
    id: "sprout",
    name: "Sprout",
    stages: 5,
  },
  {
    id: "daisy",
    name: "Daisy",
    stages: 5,
  },
  {
    id: "fern",
    name: "Fern",
    stages: 5,
  },
  {
    id: "violet",
    name: "Violet",
    stages: 5,
  },
  {
    id: "cactus",
    name: "Cactus",
    stages: 5,
  },
  {
    id: "sunflower",
    name: "Sunflower",
    stages: 5,
  },
  {
    id: "bonsai",
    name: "Bonsai",
    stages: 5,
  },
  {
    id: "orchid",
    name: "Orchid",
    stages: 5,
  },
  {
    id: "lavender",
    name: "Lavender",
    stages: 5,
  },
  {
    id: "sakura",
    name: "Sakura",
    stages: 5,
  },
];

const legacyPlantIds = {
  "one-day": "sprout",
  "two-day": "daisy",
  "three-day": "fern",
  "four-day": "violet",
  "five-day": "cactus",
  "seven-day": "sunflower",
  "fourteen-day": "bonsai",
  monthly: "orchid",
};

const schedules = [
  { id: "one-day", label: "Every 1 day", days: 1, rhythm: 5 },
  { id: "two-day", label: "Every 2 days", days: 2, rhythm: 5 },
  { id: "three-day", label: "Every 3 days", days: 3, rhythm: 5 },
  { id: "four-day", label: "Every 4 days", days: 4, rhythm: 3 },
  { id: "five-day", label: "Every 5 days", days: 5, rhythm: 2 },
  { id: "seven-day", label: "Every 7 days", days: 7, rhythm: 2 },
  { id: "fourteen-day", label: "Every 14 days", days: 14, rhythm: 1 },
  { id: "monthly", label: "Monthly", days: 30, rhythm: 1 },
];

const storageKey = "habit-garden-state-v1";
const locationStorageKey = "habit-garden-weather-location-v1";
const plantAssetVersion = "2026-06-15-5";
const maxGardenPlants = 10;
const fallbackLocation = {
  latitude: 51.5072,
  longitude: -0.1276,
  label: "London fallback",
};

const defaultState = {
  selectedPlantId: plants[0].id,
  selectedScheduleId: schedules[0].id,
  habits: [],
};

const state = loadState();

const habitForm = document.querySelector("#habitForm");
const habitName = document.querySelector("#habitName");
const plantPicker = document.querySelector("#plantPicker");
const schedulePicker = document.querySelector("#schedulePicker");
const gardenBed = document.querySelector("#gardenBed");
const gardenGrid = document.querySelector("#gardenGrid");
const totalWatered = document.querySelector("#totalWatered");
const plantsBloomed = document.querySelector("#plantsBloomed");
const gardenSubtitle = document.querySelector("#gardenSubtitle");
const resetGarden = document.querySelector("#resetGarden");
const habitCardTemplate = document.querySelector("#habitCardTemplate");
const useLocation = document.querySelector("#useLocation");
const weatherStatus = document.querySelector("#weatherStatus");

renderPlantPicker();
renderSchedulePicker();
renderGarden();
loadWeather();

habitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = habitName.value.trim();
  if (!name) return;
  if (state.habits.length >= maxGardenPlants) {
    window.alert("Your garden has 10 plants for now. Reset or remove space before planting more.");
    return;
  }

  state.habits.unshift({
    id: crypto.randomUUID(),
    name,
    plantId: state.selectedPlantId,
    scheduleId: state.selectedScheduleId,
    waterings: 0,
    createdAt: new Date().toISOString(),
    lastWateredAt: null,
  });

  habitName.value = "";
  saveState();
  renderGarden();
});

resetGarden.addEventListener("click", () => {
  if (!state.habits.length) return;

  const shouldReset = window.confirm("Reset your whole garden?");
  if (!shouldReset) return;

  state.habits = [];
  saveState();
  renderGarden();
});

useLocation.addEventListener("click", () => {
  loadWeather({ requestLocation: true });
});

function renderPlantPicker() {
  plantPicker.innerHTML = "";

  plants.forEach((plant) => {
    const option = document.createElement("label");
    option.className = "plant-option";
    option.innerHTML = `
      <input type="radio" name="plant" value="${plant.id}" ${
        plant.id === state.selectedPlantId ? "checked" : ""
      }>
      <img class="mini-plant-art" src="${getPlantSprite(plant, plant.stages - 1)}" alt="" loading="lazy">
      <span>
        <strong>${plant.name}</strong>
        <small>${getPlantDescription(plant)}</small>
      </span>
    `;

    option.querySelector("input").addEventListener("change", () => {
      state.selectedPlantId = plant.id;
      saveState();
    });

    plantPicker.append(option);
  });
}

function renderSchedulePicker() {
  schedulePicker.innerHTML = "";

  schedules.forEach((schedule) => {
    const option = document.createElement("label");
    option.className = "schedule-option";
    option.innerHTML = `
      <input type="radio" name="schedule" value="${schedule.id}" ${
        schedule.id === state.selectedScheduleId ? "checked" : ""
      }>
      <span>
        <strong>${schedule.label}</strong>
        <small>${getScheduleGrowthText(schedule)}</small>
      </span>
    `;

    option.querySelector("input").addEventListener("change", () => {
      state.selectedScheduleId = schedule.id;
      saveState();
    });

    schedulePicker.append(option);
  });
}

function renderGarden() {
  gardenBed.innerHTML = "";
  gardenGrid.innerHTML = "";

  const waterCount = state.habits.reduce((sum, habit) => sum + habit.waterings, 0);
  const bloomCount = state.habits.filter((habit) => {
    const plant = getPlant(habit.plantId);
    const schedule = getSchedule(habit.scheduleId || habit.plantId);
    return getStage(habit, plant, schedule) === plant.stages - 1;
  }).length;

  totalWatered.textContent = waterCount;
  plantsBloomed.textContent = bloomCount;
  gardenSubtitle.textContent = state.habits.length
    ? `${state.habits.length} of ${maxGardenPlants} plots planted.`
    : "Each completion waters a plant once.";
  habitForm.querySelector(".primary-action").disabled = state.habits.length >= maxGardenPlants;

  for (let index = 0; index < maxGardenPlants; index += 1) {
    gardenBed.append(createGardenPlot(state.habits[index], index));
  }

  if (!state.habits.length) {
    const empty = document.createElement("div");
    empty.className = "empty-garden";
    empty.innerHTML = "<p><strong>No plants yet</strong>Add a habit to plant the first seed.</p>";
    gardenGrid.append(empty);
    return;
  }

  state.habits.forEach((habit) => {
    const plant = getPlant(habit.plantId);
    const schedule = getSchedule(habit.scheduleId || habit.plantId);
    const stage = getStage(habit, plant, schedule);
    const nextGrowthAt = Math.min(
      (stage + 1) * schedule.rhythm,
      schedule.rhythm * (plant.stages - 1),
    );
    const currentStageStart = stage * schedule.rhythm;
    const habitStatus = getHabitStatus(habit, schedule);
    const stageProgress = plant.stages - 1 === stage
      ? 1
      : (habit.waterings - currentStageStart) / schedule.rhythm;
    const card = habitCardTemplate.content.firstElementChild.cloneNode(true);

    card.classList.add(`stage-${stage + 1}`, habitStatus);
    card.querySelector(".plant-scene").innerHTML = createPlantMarkup(plant, stage);
    card.querySelector("h3").textContent = habit.name;
    card.querySelector(".plant-name").textContent = `${plant.name} - ${schedule.label} - stage ${
      stage + 1
    } of ${plant.stages}`;
    card.querySelector(".last-watered").textContent = getLastWateredText(habit);
    card.querySelector(".progress-copy").textContent =
      stage === plant.stages - 1
        ? `${habit.waterings} waterings - fully grown`
        : `${habit.waterings} waterings - ${nextGrowthAt - habit.waterings} until next growth`;
    card.querySelector(".progress-track").style.setProperty(
      "--progress",
      `${Math.max(0, Math.min(1, stageProgress)) * 100}%`,
    );
    card.querySelector(".water-button").addEventListener("click", () => {
      waterHabit(habit);
    });
    card.querySelector(".reset-plant-button").addEventListener("click", () => {
      resetHabitPlant(habit);
    });

    gardenGrid.append(card);
  });
}

function createGardenPlot(habit, index) {
  const plot = document.createElement("article");
  plot.className = "garden-plot";
  plot.style.setProperty("--plot-delay", `${index * 35}ms`);
  plot.style.setProperty("--plot-depth", index < 5 ? "0" : "1");

  if (!habit) {
    plot.classList.add("empty-plot");
    plot.innerHTML = `
      <div class="plot-soil" aria-hidden="true">
        <span class="soil-detail pebble-a"></span>
        <span class="soil-detail pebble-b"></span>
        <span class="soil-detail mulch-a"></span>
        <span class="plot-marker"></span>
      </div>
      <p>Open plot</p>
    `;
    return plot;
  }

  const plant = getPlant(habit.plantId);
  const schedule = getSchedule(habit.scheduleId || habit.plantId);
  const stage = getStage(habit, plant, schedule);
  const habitStatus = getHabitStatus(habit, schedule);
  plot.classList.add(`stage-${stage + 1}`, habitStatus);
  plot.innerHTML = `
    <div class="plot-soil" aria-hidden="true">
      <span class="soil-detail pebble-a"></span>
      <span class="soil-detail pebble-b"></span>
      <span class="soil-detail mulch-a"></span>
      <span class="soil-detail mulch-b"></span>
      <span class="water-ripple"></span>
      ${createPlantMarkup(plant, stage, "garden")}
    </div>
    <div class="plot-meta">
      <strong>${escapeHtml(habit.name)}</strong>
      <span>${schedule.label} - ${habit.waterings} waterings</span>
      <em>${getHabitStatusText(habitStatus)}</em>
    </div>
    <button class="plot-water" type="button" aria-label="Water ${escapeHtml(habit.name)}">Water</button>
  `;

  plot.querySelector(".plot-water").addEventListener("click", () => {
    waterHabit(habit);
  });

  return plot;
}

function waterHabit(habit) {
  habit.waterings += 1;
  habit.lastWateredAt = new Date().toISOString();
  saveState();
  renderGarden();
}

function resetHabitPlant(habit) {
  const shouldReset = window.confirm(`Reset "${habit.name}" back to a seed?`);
  if (!shouldReset) return;

  habit.waterings = 0;
  habit.lastWateredAt = null;
  saveState();
  renderGarden();
}

function createPlantMarkup(plant, stage, scale = "card") {
  return `
    <span class="plant sprite-plant plant-${plant.id} stage-${stage + 1} ${
      scale === "garden" ? "garden-plant" : ""
    }">
      <img src="${getPlantSprite(plant, stage)}" alt="" loading="lazy">
    </span>
  `;
}

function getPlantSprite(plant, stage) {
  return `assets/plants/${plant.id}-stage-${stage + 1}.png?v=${plantAssetVersion}`;
}

function getStage(habit, plant, schedule) {
  return Math.min(Math.floor(habit.waterings / schedule.rhythm), plant.stages - 1);
}

function getPlant(plantId) {
  return plants.find((plant) => plant.id === plantId) || plants[0];
}

function getSchedule(scheduleId) {
  return schedules.find((schedule) => schedule.id === scheduleId) || schedules[0];
}

function getHabitStatus(habit, schedule) {
  if (wasWateredRecently(habit)) return "recently-watered";
  if (!habit.lastWateredAt && !habit.waterings) return "new-plant";

  const lastCareDate = new Date(habit.lastWateredAt || habit.createdAt);
  if (Number.isNaN(lastCareDate.getTime())) return "ready-plant";

  const daysSinceCare = (Date.now() - lastCareDate.getTime()) / 86400000;
  if (daysSinceCare > schedule.days * 1.5) return "dry-plant";
  if (daysSinceCare >= schedule.days) return "ready-plant";

  return "happy-plant";
}

function wasWateredRecently(habit) {
  if (!habit.lastWateredAt) return false;

  const lastWateredDate = new Date(habit.lastWateredAt);
  if (Number.isNaN(lastWateredDate.getTime())) return false;

  return Date.now() - lastWateredDate.getTime() < 1000 * 90;
}

function getHabitStatusText(status) {
  const labels = {
    "recently-watered": "freshly watered",
    "new-plant": "new seed",
    "happy-plant": "settled",
    "ready-plant": "ready to water",
    "dry-plant": "soil is dry",
  };

  return labels[status] || "growing";
}

function getPlantDescription(plant) {
  const descriptions = {
    sprout: "Simple green seedling",
    daisy: "Bright daisy bloom",
    fern: "Layered fern fronds",
    violet: "Purple violet flower",
    cactus: "Ribbed cactus",
    sunflower: "Golden sunflower",
    bonsai: "Woody bonsai",
    orchid: "Soft orchid bloom",
    lavender: "Purple lavender spikes",
    sakura: "Pink cherry blossoms",
  };

  return descriptions[plant.id] || "Garden plant";
}

function getScheduleGrowthText(schedule) {
  return `Grows every ${schedule.rhythm} watering${schedule.rhythm === 1 ? "" : "s"}`;
}

function getLastWateredText(habit) {
  if (!habit.lastWateredAt) {
    return habit.waterings > 0
      ? "Last watered: saved before tracking"
      : "Last watered: not yet";
  }

  const lastWateredDate = new Date(habit.lastWateredAt);
  if (Number.isNaN(lastWateredDate.getTime())) return "Last watered: not yet";

  return `Last watered: ${lastWateredDate.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  })}`;
}

async function loadWeather({ requestLocation = false } = {}) {
  weatherStatus.textContent = requestLocation ? "Asking for your sky..." : "Garden sky is syncing...";

  try {
    const location = requestLocation
      ? await requestUserLocation()
      : await getWeatherLocation();
    const response = await fetch(createWeatherUrl(location));
    if (!response.ok) throw new Error("Weather request failed");

    const data = await response.json();
    const current = data.current;
    const condition = getWeatherDescription(current.weather_code);

    document.body.dataset.weather = condition.mood;
    document.body.dataset.daylight = current.is_day ? "day" : "night";
    weatherStatus.textContent = location.label === fallbackLocation.label
      ? "Using fallback sky"
      : "Using your local sky";
  } catch {
    document.body.dataset.weather = "clear";
    document.body.dataset.daylight = "day";
    weatherStatus.textContent = "Garden sky is offline";
  }
}

async function getWeatherLocation() {
  const savedLocation = loadSavedLocation();
  if (savedLocation) return savedLocation;

  return fallbackLocation;
}

function requestUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "Current location",
        };
        localStorage.setItem(locationStorageKey, JSON.stringify(location));
        resolve(location);
      },
      () => reject(new Error("Location permission was denied")),
      { enableHighAccuracy: false, maximumAge: 1000 * 60 * 30, timeout: 10000 },
    );
  });
}

function loadSavedLocation() {
  try {
    const savedLocation = JSON.parse(localStorage.getItem(locationStorageKey));
    if (
      typeof savedLocation?.latitude === "number" &&
      typeof savedLocation?.longitude === "number"
    ) {
      return { ...savedLocation, label: "Saved location" };
    }
  } catch {
    return null;
  }

  return null;
}

function createWeatherUrl(location) {
  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: "weather_code,is_day",
    timezone: "auto",
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function getWeatherDescription(code) {
  if ([0, 1].includes(code)) {
    return { mood: "sunny" };
  }
  if ([2, 3, 45, 48].includes(code)) {
    return { mood: "cloudy" };
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return { mood: "rainy" };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { mood: "snowy" };
  }
  if ([95, 96, 99].includes(code)) {
    return { mood: "stormy" };
  }

  return { mood: "clear" };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return replacements[character];
  });
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    const nextState = { ...defaultState, ...saved, habits: saved?.habits || [] };
    nextState.selectedPlantId = getMigratedPlantId(nextState.selectedPlantId);
    if (!plants.some((plant) => plant.id === nextState.selectedPlantId)) {
      nextState.selectedPlantId = plants[0].id;
    }
    if (!schedules.some((schedule) => schedule.id === nextState.selectedScheduleId)) {
      nextState.selectedScheduleId = schedules[0].id;
    }
    nextState.habits = nextState.habits.map((habit) => ({
      ...habit,
      plantId: getMigratedPlantId(habit.plantId),
      scheduleId: schedules.some((schedule) => schedule.id === habit.scheduleId)
        ? habit.scheduleId
        : getInferredScheduleId(habit),
    }));
    return nextState;
  } catch {
    return { ...defaultState };
  }
}

function getInferredScheduleId(habit) {
  return schedules.some((schedule) => schedule.id === habit.plantId)
    ? habit.plantId
    : schedules[0].id;
}

function getMigratedPlantId(plantId) {
  const migratedPlantId = legacyPlantIds[plantId] || plantId;
  return plants.some((plant) => plant.id === migratedPlantId)
    ? migratedPlantId
    : plants[0].id;
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}
