"use strict";

const { DateTime } = luxon;

class Phase {
  constructor() {
    this.color = "#000000";
    this.enabled = true;
  }

  should_render() {
    if (!this.name) return false;
    if (!this.enabled) return false;

    const d0 = new Date(this.d0);
    const d1 = new Date(this.d1);
    return d0 < d1;
  }
}

function add_phase() {
  const p = new Phase();
  const e = document.createElement("div");

  e.phase = p;
  e.classList.add("phase");

  const name_e = document.createElement("input");
  name_e.type = "text";
  name_e.onchange = () => {
    p.name = name_e.value;
    render();
  };
  e.appendChild(name_e);

  const d0_e = document.createElement("input");
  d0_e.type = "date";
  d0_e.onchange = () => {
    p.d0 = d0_e.value;
    render();
  };
  e.appendChild(d0_e);

  const d1_e = document.createElement("input");
  d1_e.type = "date";
  d1_e.onchange = () => {
    p.d1 = d1_e.value;
    render();
  };
  e.appendChild(d1_e);

  const color_e = document.createElement("input");
  color_e.type = "color";
  color_e.onchange = () => {
    p.color = color_e.value;
    render();
  };
  e.appendChild(color_e);

  const enabled_e = document.createElement("input");
  enabled_e.type = "checkbox";
  enabled_e.checked = true;
  enabled_e.onchange = () => {
    p.enabled = enabled_e.checked;
    render();
  };
  e.appendChild(enabled_e);

  document
    .getElementById("phases")
    .appendChild(e);
}

function get_phases() {
  return Array.from(
    document.getElementsByClassName("phase"))
    .map(e => e.phase)
    .filter(p => p.should_render());
}

function render() {
  const ps = get_phases();

  if (ps.length === 0) return;

  const minStartDate = ps.reduce((min, phase) => phase.d0 < min ? phase.d0 : min, ps[0].d0);
  const maxEndDate = ps.reduce((max, phase) => phase.d1 > max ? phase.d1 : max, ps[0].d1);

  generateWeeksGrid(minStartDate, maxEndDate);
}

function generateWeeksGrid(startDate, endDate) {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);
  const now = DateTime.now();

  const gridContainer = document.getElementById("weeks-grid");
  gridContainer.innerHTML = "";  // Clear existing grid

  // Dynamically adjust the width based on the number of rows (years)
  const years = end.year - start.year + 1;  // Number of rows
  const maxContainerWidth = 800;  // Maximum width in pixels
  const minContainerWidth = 400;  // Minimum width in pixels
  const adjustedWidth = Math.max(minContainerWidth, maxContainerWidth - (years * 10));  // Adjust width based on rows
  gridContainer.style.width = `${adjustedWidth}px`;  // Apply the dynamic width

  const phases = get_phases();  // Get all valid phases

  // Loop through each year between start and end
  for (let year = start.year; year <= end.year; year++) {
    const janFirst = DateTime.local(year, 1, 1);  // First week of January
    const decLast = DateTime.local(year, 12, 31);  // Last week of December

    // Add 52 weeks for the current year
    for (let i = 0; i < 52; i++) {
      const weekStart = janFirst.plus({ weeks: i });
      const weekElement = document.createElement("div");
      weekElement.classList.add("week");

      // Determine which phase the current week belongs to, if any
      let inPhase = false;
      phases.forEach(phase => {
        const phaseStart = DateTime.fromISO(phase.d0);
        const phaseEnd = DateTime.fromISO(phase.d1);

        // Check if the current week falls within this phase
        if (weekStart >= phaseStart && weekStart <= phaseEnd) {
          weekElement.style.backgroundColor = phase.color;  // Assign user-selected color
          inPhase = true;
        }
      });

      // Handle past or future based on the actual phase start and end
      if (weekStart < start && year === start.year) {
        weekElement.classList.add("future-week");  // Before phase starts
      } else if (weekStart > end && year === end.year) {
        weekElement.classList.add("future-week");  // After phase ends
      } else if (weekStart < now) {
        weekElement.classList.add("past-week");  // Passed weeks
      } else {
        weekElement.classList.add("future-week");  // Remaining weeks
      }

      gridContainer.appendChild(weekElement);
    }
  }
}
