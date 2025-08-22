const API_KEY = "9e4d8aae5349fb8456e032b5f6db91e5";
const BASE = "https://api.openweathermap.org/data/2.5";

let currentUnit = "metric"; // default Celsius

const els = {
  cityName: document.getElementById("cityName"),
  currentTemp: document.getElementById("currentTemp"),
  currentUnit: document.getElementById("currentUnit"),
  weatherDesc: document.getElementById("weatherDesc"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  forecastGrid: document.getElementById("forecastGrid"),
  forecastTpl: document.getElementById("forecastCardTpl"),
  searchForm: document.getElementById("searchForm"),
  cityInput: document.getElementById("cityInput"),
  geoBtn: document.getElementById("geoBtn"),
  errorBox: document.getElementById("errorBox"),
  recentCities: document.getElementById("recentCities"),
  unitToggle: document.getElementById("unitToggle"),
};

// --- Event listeners ---
els.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = els.cityInput.value.trim();
  if (!city) return showError("Please enter a city name");
  fetchWeather(city);
});

els.geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation not supported");
    return;
  }
  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude, longitude } = pos.coords;
    fetchWeatherByCoords(latitude, longitude);
  });
});

els.recentCities.addEventListener("change", (e) => {
  if (e.target.value) {
    fetchWeather(e.target.value);
  }
});

els.unitToggle.addEventListener("change", (e) => {
  currentUnit = e.target.value;
  const city = els.cityName.textContent;
  if (city && city !== "—") fetchWeather(city);
});

// --- Fetch by city name ---
async function fetchWeather(city) {
  try {
    clearError();
    const current = await fetchJson(
      `${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`
    );
    const forecast = await fetchJson(
      `${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`
    );
    renderWeather(current, forecast);
    saveCity(current.name);
  } catch (err) {
    showError(err.message);
  }
}

// --- Fetch by latitude/longitude ---
async function fetchWeatherByCoords(lat, lon) {
  try {
    clearError();
    const current = await fetchJson(
      `${BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`
    );
    const forecast = await fetchJson(
      `${BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`
    );
    renderWeather(current, forecast);
    saveCity(current.name);
  } catch (err) {
    showError(err.message);
  }
}

// --- Helpers ---
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function renderWeather(current, forecast) {
  els.cityName.textContent = current.name;
  els.currentTemp.textContent = Math.round(current.main.temp);
  els.currentUnit.textContent = currentUnit === "metric" ? "°C" : "°F";
  els.weatherDesc.textContent = current.weather[0].description;
  els.humidity.textContent = current.main.humidity;
  els.wind.textContent =
    currentUnit === "metric"
      ? Math.round(current.wind.speed * 3.6)
      : Math.round(current.wind.speed);

  // ⚠ Alert if temp > 40°C (104°F)
  if (
    (currentUnit === "metric" && current.main.temp > 40) ||
    (currentUnit === "imperial" && current.main.temp > 104)
  ) {
    alert("⚠ High temperature warning! Stay safe.");
  }

  renderForecast(forecast.list);
}

function renderForecast(list) {
  els.forecastGrid.innerHTML = "";
  const days = {};
  list.forEach((item) => {
    const date = item.dt_txt.slice(0, 10);
    if (!days[date] && item.dt_txt.includes("12:00:00")) {
      days[date] = item;
    }
  });
  Object.keys(days)
    .slice(0, 5)
    .forEach((date) => {
      const item = days[date];
      const card = els.forecastTpl.content.cloneNode(true);
      card.querySelector("[data-date]").textContent = date;
      card.querySelector("[data-emoji]").textContent = "☁";
      card.querySelector("[data-temp]").textContent =
        Math.round(item.main.temp) + (currentUnit === "metric" ? "°C" : "°F");
      card.querySelector("[data-hum]").textContent = item.main.humidity + "%";
      card.querySelector("[data-wind]").textContent =
        currentUnit === "metric"
          ? Math.round(item.wind.speed * 3.6) + " km/h"
          : Math.round(item.wind.speed) + " mph";
      els.forecastGrid.appendChild(card);
    });
}

function showError(msg) {
  els.errorBox.textContent = msg;
  els.errorBox.classList.remove("hidden");
}
function clearError() {
  els.errorBox.textContent = "";
  els.errorBox.classList.add("hidden");
}

// --- Recent Cities ---
function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  if (!cities.includes(city)) {
    cities.push(city);
    if (cities.length > 5) cities.shift();
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
  loadRecentCities();
}

function loadRecentCities() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (cities.length > 0) {
    els.recentCities.classList.remove("hidden");
    els.recentCities.innerHTML = `<option value="">-- Recent Cities --</option>`;
    cities.forEach((city) => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      els.recentCities.appendChild(opt);
    });
  }
}
loadRecentCities();