// Export PNG using html2canvas (loaded dynamically as an ES module).
// Source build: cdnjs provides html2canvas.esm.js / esm.min.js for v1.4.1 :contentReference[oaicite:1]{index=1}

async function loadHtml2Canvas() {
  // Dynamic import so your app still works even if user never clicks Export PNG
  const mod = await import("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.min.js");
  // ESM build exports default
  return mod.default ?? mod;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportElementAsPng(element, { filename = "my-schedule.png", scale = 2 } = {}) {
  const html2canvas = await loadHtml2Canvas();

  const bg = getComputedStyle(document.body).backgroundColor || "#000";

  const canvas = await html2canvas(element, {
    backgroundColor: bg,
    scale,
    useCORS: true,
    logging: false,
  });

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Failed to generate PNG.");
  downloadBlob(blob, filename);
}
