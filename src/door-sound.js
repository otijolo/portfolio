import { onSoundChange } from "./sound-settings.js";
const sound = new Audio(
  new URL("../assets/audio/rollup-door-ready.wav", import.meta.url),
);
onSoundChange((muted) => {
  sound.muted = muted;
});
sound.preload = "auto";
sound.volume = 0.5;
sound.load();
let movement = 0;

function stopSound() {
  sound.pause();
  sound.currentTime = 0;
}

export function playDoorSound(door) {
  const current = ++movement;
  stopSound();
  const animations = door.getAnimations();
  if (document.hidden || !animations.length) return;
  sound
    .play()
    .then(() => {
      if (current !== movement) return;
      if (animations.every((animation) => animation.playState === "finished"))
        stopSound();
    })
    .catch(() => {});
  Promise.allSettled(animations.map((animation) => animation.finished)).then(
    () => {
      if (current === movement) stopSound();
    },
  );
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    ++movement;
    stopSound();
  }
});
