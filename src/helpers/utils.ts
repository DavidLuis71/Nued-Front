export const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTime = (value: string | Date) => {
  if (!value) return "-";

  let d: Date;

  if (value instanceof Date) {
    d = value;
  } else if (value.includes(":")) {
    // es hora tipo "09:00"
    const today = new Date();
    const [h, m] = value.split(":").map(Number);
    today.setHours(h, m, 0, 0);
    d = today;
  } else {
    d = new Date(value);
  }

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};