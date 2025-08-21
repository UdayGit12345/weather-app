const API_KEY = "9e4d8aae5349fb8456e032b5f6db91e5";
const BASE = "https://api.openweathermap.org/data/2.5";

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

// --- Fetch by city name ---
async function fetchWeather(city) {
  try {
    clearError();
    const current = await fetchJson(
      `${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    const forecast = await fetchJson(
      `${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    renderWeather(current, forecast);
  } catch (err) {
    showError(err.message);
  }
}

// --- Fetch by latitude/longitude ---
async function fetchWeatherByCoords(lat, lon) {
  try {
    clearError();
    const current = await fetchJson(
      `${BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const forecast = await fetchJson(
      `${BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    renderWeather(current, forecast);
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
  els.weatherDesc.textContent = current.weather[0].description;
  els.humidity.textContent = current.main.humidity;
  els.wind.textContent = Math.round(current.wind.speed * 3.6);
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
        Math.round(item.main.temp) + "°C";
      card.querySelector("[data-hum]").textContent = item.main.humidity + "%";
      card.querySelector("[data-wind]").textContent =
        Math.round(item.wind.speed * 3.6) + " km/h";
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

// --- Reminder ---
if (API_KEY === "YOUR_REAL_API_KEY_HERE") {
  console.warn("⚠ Please replace API_KEY with your OpenWeatherMap key");
}