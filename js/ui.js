import { orderedWeekDays, parseTimeAny, minutesToInputString, DEFAULT_DAYS, ALL_DAYS } from "./time.js";

export function getElements() {
  return {
    gridEl: document.getElementById("grid"),
    timeSuggestionsEl: document.getElementById("timeSuggestions"),

    gridStartEl: document.getElementById("gridStart"),
    gridEndEl: document.getElementById("gridEnd"),
    slotMinutesEl: document.getElementById("slotMinutes"),
    weekStartEl: document.getElementById("weekStart"),
    buildGridBtn: document.getElementById("buildGridBtn"),

    fmt24Btn: document.getElementById("fmt24"),
    fmt12Btn: document.getElementById("fmt12"),
    daysGridEl: document.getElementById("daysGrid"),

    eventTitleEl: document.getElementById("eventTitle"),
    eventDayEl: document.getElementById("eventDay"),
    eventStartEl: document.getElementById("eventStart"),
    eventEndEl: document.getElementById("eventEnd"),
    eventColorEl: document.getElementById("eventColor"),

    repeatDaysEl: document.getElementById("repeatDays"),

    saveEventBtn: document.getElementById("saveEventBtn"),
    deleteEventBtn: document.getElementById("deleteEventBtn"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),
    eventMsgEl: document.getElementById("eventMsg"),

    exportBtn: document.getElementById("exportBtn"),
    exportPngBtn: document.getElementById("exportPngBtn"),
    importFile: document.getElementById("importFile"),
    clearBtn: document.getElementById("clearBtn"),
  };
}

export function setMsg(eventMsgEl, text, isError = false) {
  eventMsgEl.textContent = text;
  eventMsgEl.style.color = isError ? "rgba(239,68,68,0.95)" : "rgba(255,255,255,0.65)";
}

export function normalizeTimeInput(el, gridConfig, { allow24 }) {
  const m = parseTimeAny(el.value, { allow24 });
  if (m == null) return;
  el.value = minutesToInputString(m, gridConfig.use12h, allow24);
}

export function normalizeAllTimeInputs(els, gridConfig) {
  normalizeTimeInput(els.gridStartEl, gridConfig, { allow24: false });
  normalizeTimeInput(els.gridEndEl, gridConfig, { allow24: true });
  normalizeTimeInput(els.eventStartEl, gridConfig, { allow24: false });
  normalizeTimeInput(els.eventEndEl, gridConfig, { allow24: true });
}

export function rebuildTimeSuggestions(timeSuggestionsEl, gridConfig) {
  timeSuggestionsEl.innerHTML = "";
  for (let m = 0; m <= 24 * 60; m += 15) {
    const opt = document.createElement("option");
    opt.value = minutesToInputString(m, gridConfig.use12h, true);
    timeSuggestionsEl.appendChild(opt);
  }
}

export function buildDaysCheckboxes(daysGridEl, gridConfig, onChange) {
  const prevChecked = new Set(
    Array.from(document.querySelectorAll('input[name="days"]:checked')).map((x) => x.value)
  );

  daysGridEl.innerHTML = "";
  const order = orderedWeekDays(gridConfig.weekStart);

  for (const day of order) {
    const label = document.createElement("label");
    label.className = "dayChip";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "days";
    input.value = day;

    input.checked = prevChecked.size > 0 ? prevChecked.has(day) : gridConfig.days.includes(day);
    input.addEventListener("change", onChange);

    label.appendChild(input);
    label.appendChild(document.createTextNode(day));
    daysGridEl.appendChild(label);
  }
}

export function getSelectedDaysOrdered(gridConfig) {
  const checked = document.querySelectorAll('input[name="days"]:checked');
  const selectedSet = new Set(Array.from(checked).map((x) => x.value));
  const order = orderedWeekDays(gridConfig.weekStart);
  return order.filter((d) => selectedSet.has(d));
}

export function rebuildEventDayOptions(eventDayEl, gridConfig) {
  eventDayEl.innerHTML = "";
  for (const day of gridConfig.days) {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day;
    eventDayEl.appendChild(opt);
  }
}

/* ---------- NEW: Repeat-on UI ---------- */

export function buildRepeatDaysCheckboxes(repeatDaysEl, gridConfig, onChange) {
  if (!repeatDaysEl) return;

  repeatDaysEl.innerHTML = "";

  for (const day of gridConfig.days) {
    const label = document.createElement("label");
    label.className = "dayChip";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "repeatDays";
    input.value = day;
    input.addEventListener("change", onChange);

    label.appendChild(input);
    label.appendChild(document.createTextNode(day));
    repeatDaysEl.appendChild(label);
  }
}

export function getRepeatDaysSelected() {
  const checked = document.querySelectorAll('input[name="repeatDays"]:checked');
  return Array.from(checked).map((x) => x.value);
}

export function setRepeatDaysSelected(days) {
  const set = new Set(days);
  const inputs = document.querySelectorAll('input[name="repeatDays"]');
  inputs.forEach((inp) => {
    inp.checked = set.has(inp.value);
  });
}

/* ---------- Form helpers ---------- */

export function resetForm(els, state) {
  state.editingId = null;
  els.saveEventBtn.textContent = "Add Event";
  els.deleteEventBtn.style.display = "none";
  els.cancelEditBtn.style.display = "none";

  els.eventTitleEl.value = "";
  els.eventColorEl.value = "#4f46e5";

  els.eventDayEl.value = state.gridConfig.days[0] ?? "Mon";

  const s = 9 * 60;
  const e = 10 * 60;
  els.eventStartEl.value = minutesToInputString(s, state.gridConfig.use12h, false);
  els.eventEndEl.value = minutesToInputString(e, state.gridConfig.use12h, true);

  // default repeat = selected day only
  setRepeatDaysSelected([els.eventDayEl.value]);
}

export function startEdit(els, state, id) {
  const ev = state.events.find((x) => x.id === id);
  if (!ev) return;

  state.editingId = id;
  els.saveEventBtn.textContent = "Save Changes";
  els.deleteEventBtn.style.display = "inline-block";
  els.cancelEditBtn.style.display = "inline-block";

  els.eventTitleEl.value = ev.title;
  els.eventColorEl.value = ev.color;
  els.eventDayEl.value = ev.day;

  els.eventStartEl.value = minutesToInputString(ev.start, state.gridConfig.use12h, false);
  els.eventEndEl.value = minutesToInputString(ev.end, state.gridConfig.use12h, true);

  // editing stays single-day
  setRepeatDaysSelected([ev.day]);
}

export function applySettingsToInputs(els, gridConfig, settings) {
  els.gridStartEl.value = settings.gridStart ?? "12:00 AM";
  els.gridEndEl.value = settings.gridEnd ?? "11:59 PM";

  els.weekStartEl.value = gridConfig.weekStart;
  els.slotMinutesEl.value = String(gridConfig.gridLinesMinutes);

  els.fmt12Btn.classList.toggle("active", gridConfig.use12h);
  els.fmt24Btn.classList.toggle("active", !gridConfig.use12h);

  els.deleteEventBtn.style.display = "none";
  els.cancelEditBtn.style.display = "none";

  if (!Array.isArray(gridConfig.days) || gridConfig.days.length === 0) {
    gridConfig.days = DEFAULT_DAYS.slice();
  }
  if (!ALL_DAYS.includes(gridConfig.weekStart)) {
    gridConfig.weekStart = "Mon";
  }
}
