let muted = false;
try {
  muted = localStorage.getItem("portfolio-muted") === "true";
} catch {}
const listeners = new Set();
export function isSoundMuted() {
  return muted;
}
export function onSoundChange(listener) {
  listeners.add(listener);
  listener(muted);
}

const button = document.querySelector("#sound-toggle");
function updateButton() {
  button.setAttribute("aria-pressed", String(muted));
  const label = muted ? "Ativar som" : "Desativar som";
  button.setAttribute("aria-label", label);
  button.title = label;
}
button.addEventListener("click", () => {
  muted = !muted;
  try {
    localStorage.setItem("portfolio-muted", String(muted));
  } catch {}
  updateButton();
  listeners.forEach((listener) => listener(muted));
  document.querySelectorAll("audio,video").forEach((media) => {
    media.muted = muted;
  });
});
button.addEventListener("keydown", (event) => {
  event.stopPropagation();
  if (event.key.toLowerCase() === "z") {
    event.preventDefault();
    button.click();
  }
});
updateButton();
