import {
  setDialogueSoundTyping,
  playDialogueCharacter,
} from "./dialogue-sound.js";

export function createDialogue(
  element,
  lines,
  shouldReduceMotion,
  onTypingChange = () => {},
  renderText = (text) => {
    element.textContent = text;
  },
) {
  let index = 0;
  let ticker = null;
  let progress = 0;
  let finished = false;
  function stop() {
    if (ticker !== null) {
      clearInterval(ticker);
      ticker = null;
    }
    setDialogueSoundTyping(false);
    onTypingChange(false);
  }
  function render() {
    stop();
    const full = lines[index];
    progress = 0;
    finished = false;
    renderText("");
    if (shouldReduceMotion()) {
      reveal();
      return;
    }
    onTypingChange(true);
    setDialogueSoundTyping(true);
    ticker = setInterval(() => {
      progress = Math.min(progress + 1, full.length);
      renderText(full.slice(0, progress));
      playDialogueCharacter(full[progress - 1]);
      if (progress === full.length) {
        stop();
        finished = true;
      }
    }, 24);
  }
  function reveal() {
    stop();
    renderText(lines[index]);
    progress = lines[index].length;
    finished = true;
  }
  function next() {
    if (!finished) {
      reveal();
      return;
    }
    index = (index + 1) % lines.length;
    render();
  }
  return {
    start: render,
    restart() {
      index = 0;
      render();
    },
    clear() {
      stop();
      renderText("");
      progress = 0;
      finished = false;
    },
    stop,
    next,
    reveal,
    isTyping() {
      return !finished;
    },
    get index() {
      return index;
    },
  };
}
