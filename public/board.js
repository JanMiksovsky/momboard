import dataFetch from "./dataFetch.js";
import updateState from "./updateState.js";

const refreshInterval = 5 * 60 * 1000; // 5 minutes
const noRefresh = location.search.slice(1) === "noRefresh";

let state = {
  now: null,
  updates: null,
};

let refreshTimeout;

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
    setState({
      error: true,
      updates: {},
    });
  }
}

function render(state, changed) {
  if (changed.updates) {
    const { error, updates } = state;

    let keys = Object.keys(updates);
    shuffle(keys);
    keys = keys.slice(0, 4);
    const tiles = keys.map((key) => renderMessageTile(key, updates[key]));

    // Add today banner at the top.
    const today = renderToday(error);
    tiles.unshift(today);

    const html = tiles.join("\n");

    document.body.innerHTML = html;
  }

  if (changed.now) {
    now.textContent = new Date(state.now).toLocaleTimeString();
  }
}

function renderMessageTile(name, data) {
  const message = data?.message ?? "";
  const spoke = data?.spoke;
  const spokeAgo = timeAgo(spoke);
  const spokeSpan = spokeAgo
    ? `<span class="spoke">
      <span class="downplay">(last spoke with</span>
        <strong>${spokeAgo}</strong><span class="downplay">)</span>
    </span>`
    : "";
  return `<div class="tile">
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

function renderToday(error) {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(now);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(now);
  const day = new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(now);
  const tileClass = `today${error ? " error" : ""}`;
  return `<div class="${tileClass}">
  <span>MomBoard</span>
  <span>
    <span class="weekday">${weekday}</span>
    <span>${month} ${day}</span>
  </span>
  <span id="now"></span>
</div>`;
}

function setState(changes) {
  const { newState, changed } = updateState(state, changes);
  state = newState;
  render(state, changed);
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

window.addEventListener("load", async () => {
  // Start the clock
  setInterval(() => {
    setState({
      now: Date.now(),
    });
  }, 1000);

  await refresh();
});
window.addEventListener("focus", async () => {
  await refresh();
});
window.addEventListener("online", async () => {
  await refresh();
});

window.refresh = refresh;
