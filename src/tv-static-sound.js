import { isSoundMuted, onSoundChange } from "./sound-settings.js";
const cabinet = document.querySelector(".tv-cabinet");
const scene = document.querySelector("#scene");
const door = document.querySelector("#door-overlay");
let context;
let buffer;
let loading;
let source;
let volume;

function syncSound() {
  const playing =
    !isSoundMuted() &&
    !document.hidden &&
    cabinet.classList.contains("is-static") &&
    scene.classList.contains("tv-visible") &&
    door.classList.contains("is-open");
  if (!playing) {
    if (source) {
      source.stop();
      source.disconnect();
      source = null;
    }
    return;
  }
  if (source || !buffer || context?.state !== "running") return;
  source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(volume);
  source.start();
}

function unlockSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  if (!context) {
    context = new AudioContext({ latencyHint: "interactive" });
    volume = context.createGain();
    volume.gain.value = 0.15;
    volume.connect(context.destination);
  }
  context
    .resume()
    .then(syncSound)
    .catch(() => {});
  if (!loading) {
    loading = fetch(new URL("../assets/audio/tv-static.mp3", import.meta.url))
      .then((response) => {
        if (!response.ok)
          throw new Error("Não foi possível carregar o som da TV.");
        return response.arrayBuffer();
      })
      .then((data) => context.decodeAudioData(data))
      .then((decoded) => {
        buffer = decoded;
        syncSound();
      })
      .catch(() => {
        loading = null;
      });
  }
}

const observer = new MutationObserver(syncSound);
for (const element of [cabinet, scene, door]) {
  observer.observe(element, { attributes: true, attributeFilter: ["class"] });
}
document.addEventListener("pointerdown", unlockSound, { capture: true });
document.addEventListener("keydown", unlockSound, { capture: true });
document.addEventListener("visibilitychange", syncSound);
onSoundChange(syncSound);
