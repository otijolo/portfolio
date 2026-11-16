import { isSoundMuted, onSoundChange } from "./sound-settings.js";

let context;
let volume;
let buffer;
let source;
let typing = false;
let loading;
let lastBlipTime = -Infinity;

function stopSound() {
  if (!source) return;
  source.stop();
  source.disconnect();
  source = null;
}

function unlockSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  context ||= new AudioContext({ latencyHint: "interactive" });
  if (!volume) {
    volume = context.createGain();
    volume.gain.value = 0.65;
    volume.connect(context.destination);
  }

  context.resume().catch(() => {});
  if (!loading) {
    loading = fetch(new URL("../assets/audio/text-blip.wav", import.meta.url))
      .then((response) => {
        if (!response.ok)
          throw new Error("Não foi possível carregar o som do diálogo.");
        return response.arrayBuffer();
      })
      .then((data) => context.decodeAudioData(data))
      .then((decoded) => {
        buffer = decoded;
      })
      .catch(() => {
        loading = null;
      });
  }
}

document.addEventListener("pointerdown", unlockSound, { capture: true });
document.addEventListener("keydown", unlockSound, { capture: true });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopSound();
});
onSoundChange((muted) => {
  if (muted) stopSound();
});

export function setDialogueSoundTyping(value) {
  if (value && !typing) lastBlipTime = -Infinity;
  typing = value;
  if (!typing) stopSound();
}

export function playDialogueCharacter(character) {
  if (
    isSoundMuted() ||
    !typing ||
    document.hidden ||
    !/[\p{L}\p{N}]/u.test(character) ||
    !buffer ||
    context?.state !== "running"
  )
    return;
  if (context.currentTime - lastBlipTime < 0.072) return;
  lastBlipTime = context.currentTime;
  stopSound();
  const blip = context.createBufferSource();
  blip.buffer = buffer;
  blip.connect(volume);
  blip.onended = () => {
    blip.disconnect();
    if (source === blip) source = null;
  };
  source = blip;
  blip.start();
}
