import dataFetch from "./dataFetch.js";
import updateState from "./updateState.js";

const refreshInterval = 5 * 60 * 1000; // 5 minutes
const noRefresh = location.search.slice(1) === "noRefresh";

let state = {
  error: null,
  flip: null,
  now: null,
  online: null,
  updates: null,
};

let refreshTimeout;

function formatNotes(notes) {
  // Convert **bold** to <strong>bold</strong>.
  const bolded = notes.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Convert newlines to <br> tags.
  const lineBreaks = bolded.replace(/\n/g, "<br>");
  return lineBreaks;
}

// The names/keys for notes start with a parenthesis.
function isKeyForNote(key) {
  return key?.startsWith("(");
}

async function refresh() {
  const data = await dataFetch();
  if (data) {
    const { updates } = data;
    setState({
      error: false,
      updates,
    });
    if (!noRefresh) {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      console.log(`Next refresh: ${new Date(Date.now() + refreshInterval)}`);
      refreshTimeout = setTimeout(refresh, refreshInterval);
    }
  } else {
    // If we didn't get data and we're online, an error occurred.
    const error = state.online;
    setState({
      error,
      updates: {},
    });
  }
}

function render(state, changed) {
  if (changed.flip) {
    document.body.classList.toggle("flip", state.flip);
  }

  if (changed.now) {
    const now = state.now;
    weekday.textContent = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(now);
    month.textContent = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(now);
    day.textContent = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
    }).format(now);
    time.textContent = now.toLocaleTimeString();
  }

  if (changed.online || changed.error) {
    title.textContent = state.error
      ? "⚠ No Data"
      : state.online
      ? "MomBoard"
      : "⊘ Offline";
  }

  if (changed.updates) {
    if (state.updates) {
      const { error, updates } = state;
      let entries = Object.entries(updates);
      const sorted = sortByDate(entries);
      let recent = sorted.slice(0, 4);
      shuffle(recent);
      const tileFragments = recent.map(([key, value]) =>
        isKeyForNote(key)
          ? renderNotesTile(value)
          : renderMessageTile(key, value)
      );
      tiles.innerHTML = tileFragments.join("\n");
    } else {
      tiles.innerHTML = "";
    }
  }
}

function renderMessageTile(name, data) {
  const message = data?.message ?? "";
  const spoke = data?.spoke;
  const spokeAgo = timeAgo(spoke);
  const spokeSpan = spokeAgo
    ? `<span class="spoke">
      (spoke with <strong>${spokeAgo}</strong>)
    </span>`
    : "";
  return `<div class="tile messageTile">
    <max-font-size class="message">
      ${message}
    </max-font-size>
    <div class="heading">
    <span class="name">
      <strong>${name}</strong>
    </span>
    ${spokeSpan}
  </div>
  </div>
</div>`;
}

function renderNotesTile(data) {
  const notes = formatNotes(data?.message ?? "");
  return `<div class="tile notesTile">
  <div class="notes">
    ${notes}
  </div>
</div>`;
}

function setState(changes) {
  const { newState, changed } = updateState(state, changes);
  state = newState;
  render(state, changed);
}

// Sort by date, most recent first.
function sortByDate(entries) {
  const sorted = entries.slice();
  sorted.sort(([key1, value1], [key2, value2]) => {
    const date1 = new Date(value1.spoke ?? 0);
    const date2 = new Date(value2.spoke ?? 0);
    return date2 - date1;
  });
  return sorted;
}

/*
 * Shuffle an array.
 *
 * Performs a Fisher-Yates shuffle. From http://sedition.com/perl/javascript-fy.html
 */
function shuffle(array) {
  var i = array.length;
  while (--i >= 0) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

// dateText is in yyyy-mm-dd format
function timeAgo(dateText) {
  if (!dateText) {
    return null;
  }

  // Convert from yyyy-mm-dd format to yyyy/mm/dd format.
  dateText = dateText.replaceAll("-", "/");

  const ianaTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offsetInMinutes = timeZoneOffsetInMinutes(ianaTimeZone);
  const offsetInHours = offsetInMinutes / 60;
  const sign = offsetInHours > 0 ? "+" : "";
  const dateTextWithTimeZone = `${dateText} GMT${sign}${offsetInHours}`;

  const date = new Date(Date.parse(dateTextWithTimeZone));
  const now = new Date();
  const midnightToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  let daysAgo;
  const days = Math.floor((midnightToday - date) / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    daysAgo = "today";
  } else if (days === 1) {
    daysAgo = "yesterday";
  } else if (days <= 7) {
    daysAgo = days + " days ago";
  } else {
    daysAgo = null;
  }

  return daysAgo;
}

// From https://stackoverflow.com/a/69014377/76472
function timeZoneOffsetInMinutes(ianaTimeZone) {
  const now = new Date();
  now.setSeconds(0, 0);

  // Format current time in `ianaTimeZone` as `M/DD/YYYY, HH:MM:SS`:
  const tzDateString = now.toLocaleString("en-US", {
    timeZone: ianaTimeZone,
    hourCycle: "h23",
  });

  // Parse formatted date string:
  const match = /(\d+)\/(\d+)\/(\d+), (\d+):(\d+)/.exec(tzDateString);
  const [_, month, day, year, hour, min] = match.map(Number);

  // Change date string's time zone to UTC and get timestamp:
  const tzTime = Date.UTC(year, month - 1, day, hour, min);

  // Return the offset between UTC and target time zone:
  return Math.floor((tzTime - now.getTime()) / (1000 * 60));
}

function updateClock() {
  setState({
    now: new Date(),
  });
}

window.addEventListener("load", async () => {
  // Start the clock
  setInterval(() => {
    updateClock();
  }, 1000);

  updateClock();

  // If the current hour is even, flip the orientation of various elements.
  const flip = state.now.getHours() % 2 === 0;
  setState({
    error: false,
    flip,
    online: navigator.onLine,
  });

  await refresh();
});
window.addEventListener("focus", async () => {
  await refresh();
});
window.addEventListener("offline", () => {
  setState({
    online: false,
  });
});
window.addEventListener("online", async () => {
  setState({
    online: true,
  });
  await refresh();
});

window.refresh = refresh;
window.setState = setState;
