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



export const getCircularImage = (src: string, size = 80): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d")!;
      
      // círculo
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, 0, 0, size, size);

      resolve(canvas.toDataURL("image/png"));
    };
  });
};