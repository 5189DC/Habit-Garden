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
  selectedView: "garden",
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
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
const habitCardTemplate = document.querySelector("#habitCardTemplate");
const useLocation = document.querySelector("#useLocation");
const weatherStatus = document.querySelector("#weatherStatus");
const gardenTabs = document.querySelectorAll(".garden-tab");
const gardenView = document.querySelector("#gardenView");
const calendarView = document.querySelector("#calendarView");
const calendarMonth = document.querySelector("#calendarMonth");
const calendarYear = document.querySelector("#calendarYear");
const calendarGrid = document.querySelector("#calendarGrid");
const calendarSummary = document.querySelector("#calendarSummary");
const previousMonth = document.querySelector("#previousMonth");
const nextMonth = document.querySelector("#nextMonth");

renderPlantPicker();
renderSchedulePicker();
renderCalendarControls();
renderActiveView();
renderGarden();
renderCalendar();
loadWeather();

habitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = habitName.value.trim();
  if (!name) return;
  if (state.habits.length >= maxGardenPlants) {
    window.alert("Your garden has 10 plants for now. Remove a plant before planting more.");
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
    lastWateredDay: null,
    waterLog: [],
  });

  habitName.value = "";
  saveState();
  renderGarden();
  renderCalendarControls();
  renderCalendar();
});

useLocation.addEventListener("click", () => {
  loadWeather({ requestLocation: true });
});

gardenTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.selectedView = tab.dataset.view;
    saveState();
    renderActiveView();
  });
});

calendarMonth.addEventListener("change", () => {
  state.calendarMonth = Number(calendarMonth.value);
  saveState();
  renderCalendar();
});

calendarYear.addEventListener("change", () => {
  state.calendarYear = Number(calendarYear.value);
  saveState();
  renderCalendar();
});

previousMonth.addEventListener("click", () => {
  moveCalendarMonth(-1);
});

nextMonth.addEventListener("click", () => {
  moveCalendarMonth(1);
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
    const waterButton = card.querySelector(".water-button");
    const wateredToday = wasWateredToday(habit);
    waterButton.disabled = wateredToday;
    waterButton.textContent = wateredToday ? "Done today" : "Water";
    waterButton.setAttribute(
      "aria-label",
      wateredToday
        ? `${habit.name} has already been watered today`
        : `Water ${habit.name}`,
    );
    waterButton.addEventListener("click", () => {
      waterHabit(habit);
    });
    card.querySelector(".reset-plant-button").addEventListener("click", () => {
      resetHabitPlant(habit);
    });
    card.querySelector(".remove-plant-button").addEventListener("click", () => {
      removeHabitPlant(habit);
    });

    gardenGrid.append(card);
  });
}

function renderActiveView() {
  const selectedView = state.selectedView === "calendar" ? "calendar" : "garden";

  gardenTabs.forEach((tab) => {
    const isSelected = tab.dataset.view === selectedView;
    tab.classList.toggle("is-active", isSelected);
    tab.setAttribute("aria-selected", String(isSelected));
  });

  gardenView.hidden = selectedView !== "garden";
  gardenView.classList.toggle("is-active", selectedView === "garden");
  calendarView.hidden = selectedView !== "calendar";
  calendarView.classList.toggle("is-active", selectedView === "calendar");

  if (selectedView === "calendar") {
    renderCalendar();
  }
}

function renderCalendarControls() {
  const monthNames = getMonthNames();
  calendarMonth.innerHTML = monthNames
    .map((month, index) => `<option value="${index}">${month}</option>`)
    .join("");

  const currentYear = new Date().getFullYear();
  const habitYears = state.habits
    .map((habit) => new Date(habit.createdAt).getFullYear())
    .filter((year) => !Number.isNaN(year));
  const firstYear = Math.min(currentYear - 1, state.calendarYear, ...habitYears);
  const lastYear = Math.max(currentYear + 2, state.calendarYear, ...habitYears);

  calendarYear.innerHTML = "";
  for (let year = firstYear; year <= lastYear; year += 1) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    calendarYear.append(option);
  }
}

function renderCalendar() {
  calendarMonth.value = String(state.calendarMonth);
  calendarYear.value = String(state.calendarYear);
  calendarGrid.innerHTML = "";

  const year = state.calendarYear;
  const month = state.calendarMonth;
  const monthNames = getMonthNames();
  const eventsByDay = getCalendarEvents(year, month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const totalEvents = [...eventsByDay.values()].reduce((sum, events) => sum + events.length, 0);

  calendarSummary.textContent = totalEvents
    ? `${totalEvents} garden event${totalEvents === 1 ? "" : "s"} in ${monthNames[month]} ${year}.`
    : `No garden events in ${monthNames[month]} ${year}.`;

  for (let index = 0; index < firstDay; index += 1) {
    const blank = document.createElement("div");
    blank.className = "calendar-day is-empty";
    calendarGrid.append(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayKey = getLocalDateKey(new Date(year, month, day));
    const events = eventsByDay.get(dayKey) || [];
    const dayCell = document.createElement("article");
    dayCell.className = "calendar-day";
    if (dayKey === getLocalDateKey()) dayCell.classList.add("is-today");
    if (events.length) dayCell.classList.add("has-events");

    dayCell.innerHTML = `
      <div class="calendar-date">
        <strong>${day}</strong>
        <span>${events.length ? `${events.length} event${events.length === 1 ? "" : "s"}` : ""}</span>
      </div>
      <div class="calendar-events">
        ${events.map(createCalendarEventMarkup).join("")}
      </div>
    `;
    calendarGrid.append(dayCell);
  }
}

function moveCalendarMonth(direction) {
  const date = new Date(state.calendarYear, state.calendarMonth + direction, 1);
  state.calendarYear = date.getFullYear();
  state.calendarMonth = date.getMonth();
  renderCalendarControls();
  saveState();
  renderCalendar();
}

function getCalendarEvents(year, month) {
  const eventsByDay = new Map();

  state.habits.forEach((habit) => {
    const plant = getPlant(habit.plantId);
    const createdAt = new Date(habit.createdAt);
    if (!Number.isNaN(createdAt.getTime())) {
      const createdDay = getLocalDateKey(createdAt);
      addCalendarEvent(eventsByDay, createdDay, {
        type: "started",
        habitName: habit.name,
        plant,
        time: createdAt,
      });
    }

    getHabitWaterLog(habit).forEach((entry) => {
      const wateredAt = new Date(entry.at || entry.day);
      const wateredDay = entry.day || (
        Number.isNaN(wateredAt.getTime()) ? null : getLocalDateKey(wateredAt)
      );
      if (!wateredDay) return;

      addCalendarEvent(eventsByDay, wateredDay, {
        type: "watered",
        habitName: habit.name,
        plant,
        time: wateredAt,
      });
    });
  });

  [...eventsByDay.keys()].forEach((dayKey) => {
    const date = parseDateKey(dayKey);
    if (!date || date.getFullYear() !== year || date.getMonth() !== month) {
      eventsByDay.delete(dayKey);
      return;
    }

    eventsByDay.get(dayKey).sort((first, second) => {
      const firstTime = Number.isNaN(first.time?.getTime?.()) ? 0 : first.time.getTime();
      const secondTime = Number.isNaN(second.time?.getTime?.()) ? 0 : second.time.getTime();
      return firstTime - secondTime;
    });
  });

  return eventsByDay;
}

function addCalendarEvent(eventsByDay, dayKey, event) {
  if (!eventsByDay.has(dayKey)) {
    eventsByDay.set(dayKey, []);
  }
  eventsByDay.get(dayKey).push(event);
}

function createCalendarEventMarkup(event) {
  const action = event.type === "started" ? "Started" : "Watered";
  const title = `${action} ${event.habitName} with ${event.plant.name}`;
  return `
    <div class="calendar-event ${event.type}" title="${escapeHtml(title)}">
      <img src="${getPlantSprite(event.plant, event.plant.stages - 1)}" alt="" loading="lazy">
      <span>
        <strong>${escapeHtml(event.habitName)}</strong>
      </span>
    </div>
  `;
}

function getHabitWaterLog(habit) {
  if (Array.isArray(habit.waterLog) && habit.waterLog.length) {
    return habit.waterLog;
  }

  if (!habit.lastWateredAt) return [];

  const lastWateredDate = new Date(habit.lastWateredAt);
  if (Number.isNaN(lastWateredDate.getTime())) return [];

  return [{
    at: habit.lastWateredAt,
    day: habit.lastWateredDay || getLocalDateKey(lastWateredDate),
    waterings: habit.waterings,
  }];
}

function getMonthNames() {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
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
  const wateredToday = wasWateredToday(habit);
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
    <button class="plot-water" type="button" aria-label="${
      wateredToday
        ? `${escapeHtml(habit.name)} has already been watered today`
        : `Water ${escapeHtml(habit.name)}`
    }"${wateredToday ? " disabled" : ""}>${wateredToday ? "Done today" : "Water"}</button>
  `;

  plot.querySelector(".plot-water").addEventListener("click", () => {
    waterHabit(habit);
  });

  return plot;
}

function waterHabit(habit) {
  if (wasWateredToday(habit)) return;

  const wateredAt = new Date();
  habit.waterings += 1;
  habit.lastWateredAt = wateredAt.toISOString();
  habit.lastWateredDay = getLocalDateKey(wateredAt);
  habit.waterLog = [
    ...getHabitWaterLog(habit),
    {
      at: habit.lastWateredAt,
      day: habit.lastWateredDay,
      waterings: habit.waterings,
    },
  ];
  saveState();
  renderGarden();
  renderCalendar();
}

function resetHabitPlant(habit) {
  const shouldReset = window.confirm(`Reset "${habit.name}" back to a seed?`);
  if (!shouldReset) return;

  habit.waterings = 0;
  habit.lastWateredAt = null;
  habit.lastWateredDay = null;
  habit.waterLog = [];
  saveState();
  renderGarden();
  renderCalendar();
}

function removeHabitPlant(habit) {
  const shouldRemove = window.confirm(`Remove "${habit.name}" from your garden?`);
  if (!shouldRemove) return;

  state.habits = state.habits.filter((existingHabit) => existingHabit.id !== habit.id);
  saveState();
  renderGarden();
  renderCalendarControls();
  renderCalendar();
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

function wasWateredToday(habit) {
  return getHabitWateredDay(habit) === getLocalDateKey();
}

function getHabitWateredDay(habit) {
  if (habit.lastWateredDay) return habit.lastWateredDay;
  if (!habit.lastWateredAt) return null;

  const lastWateredDate = new Date(habit.lastWateredAt);
  if (Number.isNaN(lastWateredDate.getTime())) return null;

  return getLocalDateKey(lastWateredDate);
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey || "");
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
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
    if (!["garden", "calendar"].includes(nextState.selectedView)) {
      nextState.selectedView = "garden";
    }
    if (!Number.isInteger(nextState.calendarYear)) {
      nextState.calendarYear = defaultState.calendarYear;
    }
    if (!Number.isInteger(nextState.calendarMonth) || nextState.calendarMonth < 0 || nextState.calendarMonth > 11) {
      nextState.calendarMonth = defaultState.calendarMonth;
    }
    nextState.habits = nextState.habits.map((habit) => ({
      ...habit,
      plantId: getMigratedPlantId(habit.plantId),
      scheduleId: schedules.some((schedule) => schedule.id === habit.scheduleId)
        ? habit.scheduleId
        : getInferredScheduleId(habit),
      lastWateredDay: getHabitWateredDay(habit),
      waterLog: getHabitWaterLog(habit),
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
