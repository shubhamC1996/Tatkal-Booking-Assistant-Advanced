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
    state.trip = {};
    save();
    $("tripMessage").textContent = "यात्रा की जानकारी इस डिवाइस से हटा दी गई।";
    updateSummary();
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


  $("exportData").addEventListener("click", () => {
    const payload = { version: 1, exportedAt: new Date().toISOString(), trip: state.trip || {}, passengers: state.passengers, checks: state.checks };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tatkal-sathi-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    $("backupMessage").textContent = "Backup फाइल डाउनलोड के लिए तैयार है। इसे सुरक्षित रखें।";
  });
  $("importData").addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 100000) throw new Error("Backup फाइल बहुत बड़ी है।");
      const imported = JSON.parse(await file.text());
      if (!imported || typeof imported !== "object" || !Array.isArray(imported.passengers) || imported.passengers.length > 6 || !imported.checks || typeof imported.checks !== "object") throw new Error("यह Tatkal Sathi backup फाइल नहीं है।");
      const allowedChecks = Object.keys(defaultChecks);
      const cleanChecks = Object.fromEntries(allowedChecks.map((key) => [key, Boolean(imported.checks[key])]));
      const cleanPassengers = imported.passengers.map((p) => {
        if (!p || typeof p !== "object") throw new Error("Passenger data सही नहीं है।");
        return { name: String(p.name || "").slice(0, 80), age: String(p.age ?? "").slice(0, 3) };
      });
      const trip = imported.trip && typeof imported.trip === "object" ? Object.fromEntries(fields.map((key) => [key, String(imported.trip[key] || "").slice(0, 100)])) : {};
      state.trip = trip; state.passengers = cleanPassengers; state.checks = cleanChecks;
      save();
      fields.forEach((id) => { $(id).value = state.trip[id] || ""; });
      document.querySelectorAll("[data-check]").forEach((input) => { input.checked = Boolean(state.checks[input.dataset.check]); });
      renderPassengers(); updateSummary();
      $("backupMessage").textContent = "Backup सफलतापूर्वक restore हो गया।";
    } catch (error) {
      $("backupMessage").textContent = error.message || "Backup restore नहीं हो सका।";
    } finally { event.target.value = ""; }
  });

  let installPrompt = null;
  const installButton = $("installApp");
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });
  window.addEventListener("appinstalled", () => {
    installButton.hidden = true;
    $("connectionStatus").textContent = "● App installed";
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