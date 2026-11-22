(() => {
  "use strict";
  const API = "https://api.dharun.dev/v1/stations";
  const inputs = [
    { id: "fromStation", list: "fromStationOptions" },
    { id: "toStation", list: "toStationOptions" }
  ];
  const cacheKey = "tatkal-station-search-v1";
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(cacheKey) || "{}"); } catch {}
  const saveCache = () => {
    try {
      const entries = Object.entries(cache).slice(-80);
      localStorage.setItem(cacheKey, JSON.stringify(Object.fromEntries(entries)));
    } catch {}
  };
  const clean = (value) => String(value || "").trim();
  inputs.forEach(({ id, list }) => {
    const input = document.getElementById(id);
    const datalist = document.getElementById(list);
    if (!input || !datalist) return;
    let timer;
    let controller;
    input.setAttribute("list", list);
    input.setAttribute("autocomplete", "off");
    input.setAttribute("aria-label", id === "fromStation" ? "From station name or code" : "To station name or code");
    input.addEventListener("input", () => {
      clearTimeout(timer);
      const query = clean(input.value);
      if (query.length < 2) { datalist.replaceChildren(); return; }
      const key = query.toLowerCase();
      if (cache[key]) render(cache[key]);
      timer = setTimeout(async () => {
        if (controller) controller.abort();
        controller = new AbortController();
        try {
          const url = API + "?q=" + encodeURIComponent(query) + "&limit=12";
          const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
          if (!response.ok) throw new Error("Station search unavailable");
          const body = await response.json();
          const rows = Array.isArray(body.data) ? body.data : [];
          cache[key] = rows;
          saveCache();
          render(rows);
        } catch (error) {
          if (error.name !== "AbortError" && !cache[key]) {
            datalist.replaceChildren();
          }
        }
      }, 220);
    });
    function render(rows) {
      datalist.replaceChildren();
      rows.forEach((station) => {
        const code = clean(station.code || station.stationCode || station.station_code);
        const name = clean(station.name || station.stationName || station.station_name);
        if (!code || !name) return;
        const option = document.createElement("option");
        option.value = name + " (" + code + ")";
        option.label = [station.state, station.zone].filter(Boolean).join(" • ");
        datalist.append(option);
      });
    }
  });
})();