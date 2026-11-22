(() => {
  "use strict";
  const STORAGE_KEY = "tatkal-sathi-v1";
  const $ = (id) => document.getElementById(id);
  const safeRead = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  };
  const state = safeRead();
  const fields = ["fromStation", "toStation", "train", "journeyDate", "quota", "travelClass"];
  const defaultChecks = { account: false, route: false, passengers: false, payment: false, official: false };
  state.checks = { ...defaultChecks, ...(state.checks || {}) };
  state.passengers = Array.isArray(state.passengers) ? state.passengers : [];

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      $("tripMessage").textContent = "इस browser में local save उपलब्ध नहीं है।";
      return false;
    }
  }
  function updateSummary() {
    $("tripDateSummary").textContent = state.trip?.journeyDate || "अभी तय नहीं";
    $("passengerSummary").textContent = state.passengers.length + " यात्री";
    const done = Object.values(state.checks).filter(Boolean).length;
    $("checkSummary").textContent = done + "/5 पूरी";
    const percent = Math.round(done / 5 * 100);
    $("progressBar").style.width = percent + "%";
    $("progressCaption").textContent = percent + "% तैयारी पूरी";
  }
  function renderPassengers() {
    const root = $("passengerList");
    root.replaceChildren();
    if (!state.passengers.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "अभी कोई यात्री नहीं जोड़ा गया है।";
      root.append(empty);
    }
    state.passengers.forEach((person, index) => {
      const card = document.createElement("div");
      card.className = "passenger-card";
      const nameLabel = document.createElement("label");
      nameLabel.textContent = "यात्री का नाम";
      const name = document.createElement("input");
      name.value = person.name || "";
      name.maxLength = 80;
      name.placeholder = "पूरा नाम";
      name.autocomplete = "off";
      name.setAttribute("aria-label", "यात्री " + (index + 1) + " का नाम");
      name.addEventListener("input", () => { person.name = name.value; save(); });
      nameLabel.append(name);
      const ageLabel = document.createElement("label");
      ageLabel.textContent = "उम्र";
      const age = document.createElement("input");
      age.type = "number";
      age.min = "0";
      age.max = "125";
      age.placeholder = "उम्र";
      age.value = person.age ?? "";
      age.setAttribute("aria-label", "यात्री " + (index + 1) + " की उम्र");
      age.addEventListener("input", () => { person.age = age.value; save(); });
      ageLabel.append(age);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-passenger";
      remove.textContent = "×";
      remove.setAttribute("aria-label", "यात्री हटाएँ");
      remove.addEventListener("click", () => {
        state.passengers.splice(index, 1);
        save(); renderPassengers(); updateSummary();
      });
      card.append(nameLabel, ageLabel, remove);
      root.append(card);
    });
    updateSummary();
  }

  $("tripDetailsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.trip = Object.fromEntries(fields.map((id) => [id, $(id).value.trim()]));
    save();
    $("tripMessage").textContent = "यात्रा की जानकारी इस डिवाइस पर सेव हो गई।";
    updateSummary();
  });
  $("clearTrip").addEventListener("click", () => {
    fields.forEach((id) => { $(id).value = ""; });
    $("tripMessage").textContent = "फॉर्म साफ किया गया। सेव की गई यात्रा हटाने के लिए नया फॉर्म सेव करें।";
  });
  $("addPassenger").addEventListener("click", () => {
    if (state.passengers.length >= 6) {
      $("passengerMessage").textContent = "अधिकतम 6 यात्रियों की तैयारी जोड़ सकते हैं।";
      return;
    }
    state.passengers.push({ name: "", age: "" });
    save(); renderPassengers();
    $("passengerMessage").textContent = "";
  });
  document.querySelectorAll("[data-check]").forEach((input) => {
    input.checked = Boolean(state.checks[input.dataset.check]);
    input.addEventListener("change", () => {
      state.checks[input.dataset.check] = input.checked;
      save(); updateSummary();
    });
  });

  if (state.trip) fields.forEach((id) => { if (state.trip[id] !== undefined) $(id).value = state.trip[id]; });
  renderPassengers();
  updateSummary();
  $("connectionStatus").textContent = navigator.onLine ? "● Online" : "● Offline";
  window.addEventListener("online", () => { $("connectionStatus").textContent = "● Online"; });
  window.addEventListener("offline", () => { $("connectionStatus").textContent = "● Offline"; });

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        $("connectionStatus").textContent = "Offline cache unavailable";
      });
    });
  }
})();