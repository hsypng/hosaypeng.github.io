/**
 * Habits Heatmap - GitHub contribution graph style renderer.
 * Expects window.__HABITS_DATA__ to be set by the Jekyll page.
 */
(function () {
  "use strict";

  var YEAR; // derived from data in init()
  var TOTAL_HABITS; // computed from data
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

  var data;
  var tooltip;
  var today;

  function init() {
    data = window.__HABITS_DATA__;
    if (!data) return;

    var dates = Object.keys(data.days);
    YEAR = dates.length > 0
      ? Math.max.apply(null, dates.map(function(d) { return parseInt(d.split("-")[0], 10); }))
      : new Date().getFullYear();

    today = new Date();
    today.setHours(0, 0, 0, 0);

    TOTAL_HABITS = 0;
    for (var c in data.categories) {
      TOTAL_HABITS += data.categories[c].length;
    }

    var container = document.getElementById("heatmap-root");
    if (!container) return;

    createTooltip();
    renderRollup(container);
    renderIndividualHeatmaps(container);
  }

  function createTooltip() {
    tooltip = document.createElement("div");
    tooltip.className = "heatmap-tooltip";
    document.body.appendChild(tooltip);
  }

  // Build calendar grid info for the year
  function getWeeks() {
    var weeks = [];
    var d = new Date(YEAR, 0, 1);
    var currentWeek = [];

    // Pad first week (JS: 0=Sun, we want Mon=0)
    var startDay = (d.getDay() + 6) % 7; // convert to Mon=0
    for (var p = 0; p < startDay; p++) {
      currentWeek.push(null);
    }

    while (d.getFullYear() === YEAR) {
      var dateStr = formatDate(d);
      var dow = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
      currentWeek.push(dateStr);
      if (dow === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      d.setDate(d.getDate() + 1);
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return weeks;
  }

  function formatDate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function parseDate(s) {
    var parts = s.split("-");
    return new Date(+parts[0], +parts[1] - 1, +parts[2]);
  }

  function isPrivate(habitName) {
    return data.private_habits && data.private_habits.indexOf(habitName) !== -1;
  }

  // Get rollup score for a date: fraction of habits completed
  function getRollupScore(dateStr) {
    var dayData = data.days[dateStr];
    if (!dayData) return null; // no tracking data
    var done = 0;
    var total = 0;
    for (var cat in dayData) {
      for (var habit in dayData[cat]) {
        total++;
        if (dayData[cat][habit]) done++;
      }
    }
    return total > 0 ? done / total : 0;
  }

  // Get single habit completion for a date
  function getHabitDone(dateStr, category, habit) {
    var dayData = data.days[dateStr];
    if (!dayData || !dayData[category]) return null;
    if (!(habit in dayData[category])) return null;
    return dayData[category][habit];
  }

  function rollupLevel(score) {
    if (score === null) return "future";
    if (score === 0) return "red";
    if (score < 0.25) return 1;
    if (score < 0.5) return 2;
    if (score < 0.75) return 3;
    return 4;
  }

  function createGrid(container, weeks, cellDataFn, tooltipFn) {
    var wrap = document.createElement("div");
    wrap.className = "heatmap-container";

    var graph = document.createElement("div");
    graph.className = "heatmap-graph";

    var totalCols = weeks.length + 1; // +1 for day labels column
    graph.style.gridTemplateColumns = "24px repeat(" + weeks.length + ", 11px)";

    // Month labels row
    // Empty cell for day-label column
    var emptyMonth = document.createElement("div");
    emptyMonth.style.gridRow = "1";
    emptyMonth.style.gridColumn = "1";
    graph.appendChild(emptyMonth);

    var monthPositions = getMonthPositions(weeks);
    for (var mi = 0; mi < monthPositions.length; mi++) {
      var mp = monthPositions[mi];
      var mlabel = document.createElement("div");
      mlabel.className = "month-label";
      mlabel.textContent = MONTHS[mp.month];
      mlabel.style.gridRow = "1";
      mlabel.style.gridColumn = String(mp.col + 2); // +2: 1-indexed + day-label col
      graph.appendChild(mlabel);
    }

    // Day labels + cells
    for (var row = 0; row < 7; row++) {
      // Day label
      var dl = document.createElement("div");
      dl.className = "day-label";
      dl.textContent = DAY_LABELS[row];
      dl.style.gridRow = String(row + 2); // +2: 1-indexed + month row
      dl.style.gridColumn = "1";
      graph.appendChild(dl);

      for (var wi = 0; wi < weeks.length; wi++) {
        var dateStr = weeks[wi][row];
        var cell = document.createElement("div");
        cell.className = "heatmap-cell";
        cell.style.gridRow = String(row + 2);
        cell.style.gridColumn = String(wi + 2);

        if (!dateStr) {
          cell.classList.add("level-future");
        } else {
          var cellDate = parseDate(dateStr);
          if (cellDate > today) {
            cell.classList.add("level-future");
          } else {
            var result = cellDataFn(dateStr);
            var level = result.level;
            cell.classList.add(typeof level === "number" ? "level-" + level : "level-" + level);
          }

          cell.dataset.date = dateStr;
          if (dateStr === formatDate(today)) {
            cell.classList.add("today");
          }
          cell.addEventListener("mouseenter", (function(ds, isFuture) {
            return function(e) {
              var text = isFuture ? ds : tooltipFn(ds);
              if (!text) return;
              tooltip.textContent = text;
              tooltip.style.display = "block";
              var rect = e.target.getBoundingClientRect();
              tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + "px";
              tooltip.style.top = (rect.top - tooltip.offsetHeight - 6) + "px";
            };
          })(dateStr, cellDate > today));
          cell.addEventListener("mouseleave", function() {
            tooltip.style.display = "none";
          });
        }

        graph.appendChild(cell);
      }
    }

    wrap.appendChild(graph);
    container.appendChild(wrap);
  }

  function getMonthPositions(weeks) {
    var positions = [];
    var seen = {};
    for (var wi = 0; wi < weeks.length; wi++) {
      for (var di = 0; di < 7; di++) {
        var ds = weeks[wi][di];
        if (!ds) continue;
        var month = parseInt(ds.split("-")[1], 10) - 1;
        if (!(month in seen)) {
          seen[month] = true;
          positions.push({ month: month, col: wi });
        }
        break; // only need first date in each week
      }
    }
    return positions;
  }

  function renderRollup(root) {
    var section = document.createElement("div");
    section.className = "heatmap-section";

    var title = document.createElement("h2");
    title.textContent = "Daily Completion";
    section.appendChild(title);

    // Stats
    var privateCount = data.private_habits ? data.private_habits.length : 0;
    var trackingNote = TOTAL_HABITS + " goals tracked";
    if (privateCount > 0) {
      trackingNote += " (" + (TOTAL_HABITS - privateCount) + " shown, " + privateCount + " private)";
    }
    var stats = document.createElement("div");
    stats.className = "heatmap-stats";
    stats.textContent = trackingNote;
    section.appendChild(stats);

    var weeks = getWeeks();

    createGrid(section, weeks,
      function(dateStr) {
        var score = getRollupScore(dateStr);
        return { level: rollupLevel(score), score: score };
      },
      function(dateStr) {
        var score = getRollupScore(dateStr);
        if (score === null) return dateStr + ": No data";
        var pct = Math.round(score * 100);
        var dayData = data.days[dateStr];
        var done = 0, total = 0;
        for (var cat in dayData) {
          for (var h in dayData[cat]) {
            total++;
            if (dayData[cat][h]) done++;
          }
        }
        var label = dateStr + ": " + done + "/" + total + " (" + pct + "%)";
        if (dateStr === formatDate(today) && done < total) label += " (in progress)";
        return label;
      }
    );

    // Legend
    var legend = document.createElement("div");
    legend.className = "heatmap-legend";
    legend.innerHTML = "Less ";
    var levels = ["level-0", "level-1", "level-2", "level-3", "level-4"];
    for (var i = 0; i < levels.length; i++) {
      var swatch = document.createElement("div");
      swatch.className = "heatmap-cell " + levels[i];
      legend.appendChild(swatch);
    }
    var moreText = document.createTextNode(" More");
    legend.appendChild(moreText);

    // Red swatch
    var spacer = document.createTextNode("  ");
    legend.appendChild(spacer);
    var redSwatch = document.createElement("div");
    redSwatch.className = "heatmap-cell level-red";
    legend.appendChild(redSwatch);
    var missedText = document.createTextNode(" Missed");
    legend.appendChild(missedText);

    section.appendChild(legend);
    root.appendChild(section);
  }

  function renderIndividualHeatmaps(root) {
    var weeks = getWeeks();

    for (var cat in data.categories) {
      // Category divider
      var divider = document.createElement("div");
      divider.className = "heatmap-category-divider";
      var catTitle = document.createElement("h2");
      catTitle.textContent = cat;
      divider.appendChild(catTitle);
      root.appendChild(divider);

      var habits = data.categories[cat];
      for (var hi = 0; hi < habits.length; hi++) {
        var habit = habits[hi];

        if (isPrivate(habit)) continue;

        var section = document.createElement("div");
        section.className = "heatmap-section";

        var title = document.createElement("h3");
        title.textContent = habit;
        section.appendChild(title);

        createGrid(section, weeks,
          (function(c, h) {
            return function(dateStr) {
              var done = getHabitDone(dateStr, c, h);
              if (done === null) return { level: "future" };
              return { level: done ? 4 : "red" };
            };
          })(cat, habit),
          (function(c, h) {
            return function(dateStr) {
              var done = getHabitDone(dateStr, c, h);
              if (done === null) return dateStr + ": No data";
              if (done) return dateStr + ": Done";
              return dateStr + ": " + (dateStr === formatDate(today) ? "Pending" : "Missed");
            };
          })(cat, habit)
        );

        root.appendChild(section);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
