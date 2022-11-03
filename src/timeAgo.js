export default function timeAgo(dateText) {
  if (!dateText) {
    return "";
  }

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
  } else {
    daysAgo = days + " days ago";
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
