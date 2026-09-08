(function () {
  "use strict";

  const STORAGE_KEY = "calendar_events_v1";

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // What month/year is currently displayed
  let viewDate = new Date();
  viewDate.setDate(1);

  // The day currently open in the modal (yyyy-mm-dd string)
  let activeDateKey = null;

  const els = {
    monthName: document.getElementById("monthName"),
    yearName: document.getElementById("yearName"),
    grid: document.getElementById("calendarGrid"),
    weekdayRow: document.getElementById("weekdayRow"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    todayBtn: document.getElementById("todayBtn"),
    clock: document.getElementById("clock"),
    modalOverlay: document.getElementById("modalOverlay"),
    modalDate: document.getElementById("modalDate"),
    closeModal: document.getElementById("closeModal"),
    eventList: document.getElementById("eventList"),
    eventForm: document.getElementById("eventForm"),
    eventTime: document.getElementById("eventTime"),
    eventText: document.getElementById("eventText"),
  };


  function loadEvents() 
  {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } 
    catch (e) 
    {
      console.error("Failed to read saved events:", e);
      return {};
    }
  }

  function saveEvents(data) 
  {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } 
    catch (e) 
    {
      console.error("Failed to save events:", e);
    }
  }

  let eventsData = loadEvents();

  function dateKey(y, m, d) 
  {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function todayKey() 
  {
    const t = new Date();
    return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
  }

  //Weekday header

  function renderWeekdayRow() 
  {
    els.weekdayRow.innerHTML = "";
    weekdayNames.forEach((name, i) => {
      const span = document.createElement("span");
      span.textContent = name.toUpperCase();
      if (i === 0 || i === 6) span.classList.add("is-weekend");
      els.weekdayRow.appendChild(span);
    });
  }

  //Calendar grid

  function renderCalendar() 
  {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    els.monthName.textContent = monthNames[month];
    els.yearName.textContent = String(year);

    els.grid.innerHTML = "";

    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todaysKey = todayKey();

    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) 
    {
      const cell = document.createElement("div");
      cell.className = "day-cell";

      let cellYear = year;
      let cellMonth = month;
      let dayNum;
      let isOutside = false;

      if (i < startWeekday) 
      {
        // Leading days from previous month
        dayNum = daysInPrevMonth - startWeekday + i + 1;
        cellMonth = month - 1;
        isOutside = true;
      }
      else if (i >= startWeekday + daysInMonth) 
      {
        // Trailing days from next month
        dayNum = i - (startWeekday + daysInMonth) + 1;
        cellMonth = month + 1;
        isOutside = true;
      }
      else {
        dayNum = i - startWeekday + 1;
      }

      // Normalize month/year for outside days
      let normMonth = cellMonth;
      let normYear = cellYear;
      if (normMonth < 0) 
      { 
        normMonth = 11; 
        normYear -= 1; 
      }

      if (normMonth > 11) 
      { 
        normMonth = 0; 
        normYear += 1; 
      }

      const key = dateKey(normYear, normMonth, dayNum);
      const weekdayIndex = (startWeekday + i - startWeekday) % 7; // not used directly
      const colIndex = i % 7;

      if (isOutside) cell.classList.add("is-outside");
      if (colIndex === 0 || colIndex === 6) cell.classList.add("is-weekend");
      if (!isOutside && key === todaysKey) cell.classList.add("is-today");

      const numEl = document.createElement("div");
      numEl.className = "day-num";
      numEl.textContent = String(dayNum);
      cell.appendChild(numEl);

      // Events preview
      const dayEvents = (eventsData[key] || []).slice().sort(sortEvents);

      if (dayEvents.length) 
      {
        const listEl = document.createElement("div");
        listEl.className = "day-events";
        const visible = dayEvents.slice(0, 2);
        visible.forEach((ev) => {
          const chip = document.createElement("div");
          chip.className = "day-event-chip";
          chip.textContent = ev.time ? `${ev.time} ${ev.text}` : ev.text;
          listEl.appendChild(chip);
        });

        if (dayEvents.length > visible.length) 
        {
          const more = document.createElement("div");
          more.className = "day-more";
          more.textContent = `+${dayEvents.length - visible.length} more`;
          listEl.appendChild(more);
        }
        cell.appendChild(listEl);
      }

      if (!isOutside) 
      {
        cell.addEventListener("click", () => openModal(key));
      }

      els.grid.appendChild(cell);
    }
  }

  function sortEvents(a, b) 
  {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  }

  //Modal

  function formatModalDate(key) 
  {
    const [y, m, d] = key.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const weekday = dt.toLocaleDateString(undefined, { weekday: "long" });
    return `${weekday}, ${monthNames[m - 1]} ${d}, ${y}`;
  }

  function openModal(key)
  {
    activeDateKey = key;
    els.modalDate.textContent = formatModalDate(key);
    renderEventList();
    els.modalOverlay.classList.add("is-open");
    els.eventText.value = "";
    els.eventTime.value = "";
    setTimeout(() => els.eventText.focus(), 50);
  }

  function closeModalFn() 
  {
    els.modalOverlay.classList.remove("is-open");
    activeDateKey = null;
  }

  function renderEventList() 
  {
    els.eventList.innerHTML = "";
    if (!activeDateKey) return;
    const dayEvents = (eventsData[activeDateKey] || []).slice().sort(sortEvents);

    dayEvents.forEach((ev, idx) => {
      const li = document.createElement("li");
      li.className = "event-item";

      if (ev.time) {
        const timeSpan = document.createElement("span");
        timeSpan.className = "ev-time";
        timeSpan.textContent = ev.time;
        li.appendChild(timeSpan);
      }

      const textSpan = document.createElement("span");
      textSpan.className = "ev-text";
      textSpan.textContent = ev.text;
      li.appendChild(textSpan);

      const delBtn = document.createElement("button");
      delBtn.className = "ev-delete";
      delBtn.type = "button";
      delBtn.setAttribute("aria-label", "Delete event");
      delBtn.textContent = "\u00d7";
      delBtn.addEventListener("click", () => deleteEvent(idx));
      li.appendChild(delBtn);

      els.eventList.appendChild(li);
    });
  }

  function deleteEvent(sortedIndex) 
  {
    const dayEvents = (eventsData[activeDateKey] || []).slice().sort(sortEvents);
    const target = dayEvents[sortedIndex];
    const original = eventsData[activeDateKey] || [];
    const originalIdx = original.indexOf(target);

    if (originalIdx > -1) 
    {
      original.splice(originalIdx, 1);
      if (original.length === 0) {
        delete eventsData[activeDateKey];
      } else {
        eventsData[activeDateKey] = original;
      }
      saveEvents(eventsData);
      renderEventList();
      renderCalendar();
    }
  }

  function addEvent(e) 
  {
    e.preventDefault();
    if (!activeDateKey) return;
    const text = els.eventText.value.trim();
    if (!text) return;
    const time = els.eventTime.value || null;

    if (!eventsData[activeDateKey]) eventsData[activeDateKey] = [];
    eventsData[activeDateKey].push({ text, time });
    saveEvents(eventsData);

    els.eventText.value = "";
    els.eventTime.value = "";
    renderEventList();
    renderCalendar();
    els.eventText.focus();
  }

  //Navigation

  function goPrevMonth() {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderCalendar();
  }

  function goNextMonth() {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderCalendar();
  }

  function goToday() {
    const t = new Date();
    viewDate = new Date(t.getFullYear(), t.getMonth(), 1);
    renderCalendar();
  }

  //live date check

  function updateClock() {
    const now = new Date();
    els.clock.textContent = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Re-render at midnight rollover so "today" highlight always stays accurate
  let lastKnownDay = todayKey();
  function checkDateRollover() {
    const current = todayKey();
    if (current !== lastKnownDay) {
      lastKnownDay = current;
      renderCalendar();
    }
  }

  // Event wiring

  els.prevBtn.addEventListener("click", goPrevMonth);
  els.nextBtn.addEventListener("click", goNextMonth);
  els.todayBtn.addEventListener("click", goToday);
  els.closeModal.addEventListener("click", closeModalFn);
  els.eventForm.addEventListener("submit", addEvent);

  els.modalOverlay.addEventListener("click", (e) => {
    if (e.target === els.modalOverlay) closeModalFn();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && els.modalOverlay.classList.contains("is-open")) {
      closeModalFn();
    }
  });


  renderWeekdayRow();
  renderCalendar();
  updateClock();
  setInterval(updateClock, 1000 * 15);
  setInterval(checkDateRollover, 1000 * 30);
})();
