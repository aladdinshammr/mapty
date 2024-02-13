"use strict";

const overlay = document.querySelector(".overlay");
const model = document.querySelector(".modal");
const labelErroMsg = document.querySelector(".error-msg");
const btnCloseModal = document.querySelectorAll(
  ".btn--close-modal, .close-modal"
);

const form = document.querySelector(".form-item");
const typeSelector = document.getElementById("type");

const inputRunning = document.querySelector(".form-input--running");
const inputCycling = document.querySelector(".form-input--cycling");
const btnSubmit = document.querySelector(".btn-submit");

const inputDistance = document.querySelector("#distance");
const inputDuration = document.querySelector("#duration");
const inputCadence = document.querySelector("#cadence");
const inputElevation = document.querySelector("#elev");

const containerWorkout = document.querySelector(".workouts");

// class workout
class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);

  constructor(coords, duration, distance) {
    this.coords = coords;
    this.duration = duration;
    this.distance = distance;
  }
}

class Running extends Workout {
  type = "running";
  logo = "🏃‍♂️";
  constructor(coords, duration, distance, cadence) {
    super(coords, duration, distance);
    this.cadence = cadence;
    this.calcPace();
    this.getDescription();
  }

  calcPace() {
    this.pace = (this.duration / this.distance).toFixed(1);
  }

  getDescription() {
    const options = {
      month: "long",
      day: "numeric",
    };

    this.description = `${this.logo} ${
      this.type[0].toUpperCase() + this.type.slice(1)
    } on ${new Intl.DateTimeFormat("en-US", options).format(this.date)}`;
  }
}

// const running = new Running("dvd", 25, 52, 52);
// console.log(running);

class Cycling extends Workout {
  type = "cycling";
  logo = "🚴";

  constructor(coords, duration, distance, elevation) {
    super(coords, duration, distance);
    this.elevation = elevation;
    this.calcSpeed();
    this.getDescription();
  }

  calcSpeed() {
    this.speed = (this.distance / (this.duration / 60)).toFixed(1);
  }

  getDescription() {
    const options = {
      month: "long",
      day: "numeric",
    };

    this.description = `${this.logo} ${
      this.type[0].toUpperCase() + this.type.slice(1)
    } on ${new Intl.DateTimeFormat("en-US", options).format(this.date)}`;
  }
}

// Class App

class App {
  #zoom = 15;
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getLocation();
    // this._loadDate();

    btnCloseModal.forEach((btn) =>
      btn.addEventListener("click", this._closeModal.bind(this))
    );

    typeSelector.addEventListener("change", this._handelSelector);

    form.addEventListener("submit", this._onSubmit.bind(this));

    containerWorkout.addEventListener("click", this._moveToLocation.bind(this));
  }

  _isNum(values) {
    return values.every((value) => isFinite(value));
  }

  _isGreaterThan0(values) {
    return values.every((value) => value > 0);
  }

  _showWarning(msg) {
    labelErroMsg.textContent = msg;
    overlay.classList.remove("hidden");
    model.classList.remove("hidden");
  }

  _closeModal() {
    overlay.classList.add("hidden");
    model.classList.add("hidden");
  }

  _getLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        this._renderMap.bind(this),
        (error) => {
          this._showWarning(error.message);
        }
      );
    } else {
      this._showWarning("geolocation IS NOT available");
    }
  }

  _renderMap(position) {
    const { latitude: lat, longitude: lng } = position.coords;

    const coords = [lat, lng];

    this.#map = L.map("map");
    this._goToPopup(coords);
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
    this._loadDate();
    // this._renderMarker(position);
    // this._renderPopup(position);
  }

  _goToPopup(coords) {
    this.#map.setView(coords, this.#zoom, {
      animate: true,
      duration: 1,
    });

    // map.panTo(new L.LatLng(40.737, -73.923));
  }

  _renderMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(this._renderPopup(workout))
      .openPopup();
  }

  _renderPopup(workout) {
    return L.popup(workout.coords, {
      maxWidth: 250,
      minHeight: 100,
      autoClose: false,
      closeOnClick: false,
      className: `${workout.type}-popup`,
      content: workout.description,
    });
  }

  _showForm(e) {
    form.classList.remove("form-item--hidden");
    inputDistance.focus();
    const { lat, lng } = e.latlng;
    this.#mapEvent = [lat, lng];
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    form.classList.add("form-item--hidden");
  }

  _handelSelector() {
    inputRunning.classList.toggle("form-input--hidden");
    inputCycling.classList.toggle("form-input--hidden");
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout-item workout--${workout.type}" data-id=${workout.id}>
        <h2 class="workout-title">${workout.description}</h2>
        <div class="workout-details">
          <span class="workout-logo">${workout.logo}</span>
          <span class="workout-value">${workout.distance}</span>
          <span class="workout-unite">km</span>
        </div>
        <div class="workout-details">
          <span class="workout-logo">⏱</span>
          <span class="workout-value">${workout.duration}</span>
          <span class="workout-unite">min</span>
        </div>
    `;

    if (workout.type == "running") {
      html += `
      <div class="workout-details">
          <span class="workout-logo">⚡️</span>
          <span class="workout-value">${workout.pace}</span>
          <span class="workout-unite"> min/km</span>
        </div>
        <div class="workout-details">
          <span class="workout-logo"> 👣 </span>
          <span class="workout-value">${workout.cadence}</span>
          <span class="workout-unite">spm</span>
        </div>
      </li>
      `;
    }
    if (workout.type == "cycling") {
      html += `
      <div class="workout-details">
          <span class="workout-logo">⚡️</span>
          <span class="workout-value">${workout.speed}</span>
          <span class="workout-unite"> min/km</span>
        </div>
        <div class="workout-details">
          <span class="workout-logo"> 🚵 </span>
          <span class="workout-value">${workout.elevation}</span>
          <span class="workout-unite">spm</span>
        </div>
      </li>
      `;
    }

    form.insertAdjacentHTML("afterend", html);
  }

  _onSubmit(e) {
    e.preventDefault();
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const cadence = +inputCadence.value;
    const elevation = +inputElevation.value;

    let workout;

    if (cadence) {
      if (
        !this._isNum([distance, duration, cadence]) ||
        !this._isGreaterThan0([distance, duration, cadence])
      )
        return this._showWarning("please, provide valid numbers");

      workout = new Running(this.#mapEvent, duration, distance, cadence);
    } else if (elevation) {
      if (
        !this._isNum([distance, duration, elevation]) ||
        !this._isGreaterThan0([distance, duration])
      )
        return this._showWarning("please, provide valid numbers");

      workout = new Cycling(this.#mapEvent, duration, distance, elevation);
    } else {
      return this._showWarning("please, provide valid numbers here");
    }

    this.#workouts.push(workout);
    this._renderMarker(workout);
    this._hideForm();
    this._renderWorkout(workout);
    this._saveToLocalStorage();
  }

  _moveToLocation(e) {
    const target = e.target.closest(".workout-item");
    if (!target) return;
    const id = target.dataset.id;

    const workout = this.#workouts.find((work) => work.id == id);
    this._goToPopup(workout.coords);
  }

  _saveToLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _loadDate() {
    const workouts = JSON.parse(localStorage.getItem("workouts"));
    if (workouts) {
      this.#workouts = workouts;

      this.#workouts.forEach((work) => {
        this._renderMarker(work);
        this._renderWorkout(work);
      });
    }
  }
}

const app = new App();
