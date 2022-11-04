import updateState from "./updateState.js";

const userId = "65fbe32d-bf35-47de-a27f-e86724613a7b";
const itemId = "2bd8b583-d812-4a08-a54b-063fe6732bc5";
const readUrl = `https://api.jsonstorage.net/v1/json/${userId}/${itemId}`;

const refreshInterval = 10 * 1000; // 10 seconds

let state = {
  updates: null,
};

async function refresh() {
  const response = await fetch(readUrl);
  const data = await response.json();
  if (data) {
    const { updates } = data;
    setState({ updates });
  }
}

function render(state, changed) {
  if (changed.updates) {
    const { updates } = state;

    const keys = Object.keys(updates);
    // Add a marker for the today tile show it gets shuffled in.
    const todayMarker = Symbol();
    keys.push(todayMarker);
    shuffle(keys);

    const tiles = keys.map((key) =>
      key === todayMarker
        ? renderTodayTile()
        : renderMessageTile(key, updates[key])
    );

    const html = tiles.join("\n");

    document.body.innerHTML = html;
  }
}

function renderMessageTile(name, data) {
  const message = data?.message ?? "";
  const length = message.length;
  const lines = Math.ceil(length / 24);
  const spoke = data?.spoke;
  const spokeAgo = timeAgo(spoke);
  const spokeSpan = spokeAgo
    ? `<span class="spoke">
  — last spoke with
  <strong>${spokeAgo}</strong>
</span>`
    : "";

  return `<div class="tile">
  <div class="heading">
    <span class="name">
      From
      <strong>${name}</strong>
    </span>
    ${spokeSpan}
  </div>
    <p class="message" style="--length: ${length}; --lines: ${lines}">
      ${message}
    </p>
  </div>
</div>`;
}

function renderTodayTile() {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(now);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(now);
  const day = new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(now);
  return `<div class="tile">
  <div class="dateBlock">
    <div class="weekday">${weekday}</div>
    <div class="monthDay">${month} ${day}</div>
  </div>
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
  await refresh();
});

window.refresh = refresh;
