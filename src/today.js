export default function today() {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    now
  );
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(now);
  const day = new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(now);
  return {
    weekday,
    month,
    day,
  };
}
