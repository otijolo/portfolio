import { projects } from "./projects.js";
import { createDialogue } from "./dialogue.js";
import { skillCategories, skillLogos } from "./skills.js";
import "./tv-static-sound.js";
import { playDoorSound } from "./door-sound.js";
import { isSoundMuted } from "./sound-settings.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const screens = new Set([
  "inicio",
  "projetos",
  "habilidades",
  "sobre",
  "contato",
]);
const door = $("#door-overlay");
const modal = $("#project-dialog");
const inventory = $("#inventory");
const menuButtons = [...$$("[data-nav]"), $("#exit-store")];
const reduceSystem = window.matchMedia("(prefers-reduced-motion: reduce)");
const npc = $(".npc-container");
function setPupilOffsets(leftX = 0, leftY = 0, rightX = 0, rightY = 0) {
  const scene = $("#scene");
  for (const [name, value] of Object.entries({
    "left-x": leftX,
    "left-y": leftY,
    "right-x": rightX,
    "right-y": rightY,
  }))
    scene.style.setProperty(`--eye-${name}`, `${value.toFixed(2)}px`);
}
let blinkTimer = null;
function scheduleBlink() {
  clearTimeout(blinkTimer);
  npc.classList.remove("is-blinking");
  if (
    document.hidden ||
    reduceSystem.matches ||
    !door.classList.contains("is-open")
  )
    return;

  blinkTimer = setTimeout(
    () => {
      npc.classList.add("is-blinking");
      blinkTimer = setTimeout(scheduleBlink, 150);
    },
    3000 + Math.random() * 3500,
  );
}
document.addEventListener("visibilitychange", scheduleBlink);
let currentFilter = "todos";
let browsingProjects = false;
let currentScreen = "inicio";
let previousScreen = "inicio";
let menuSelection = 0;
let keyboardZone = "menu";
let returningFromExit = false;
let storeReady = false;
let doorOpening = 0;
let walkTimer = null;
let tvHideTimer = null;
let displayedProjectId = null;
let previewedProjectId = null;
let mediaRequest = 0;
let tvStaticStarted = 0;
let tvStaticTimer = null;
function startTvStatic() {
  const remote = $(".npc-remote");
  remote.classList.remove("is-pressing");
  void remote.offsetWidth;
  remote.classList.add("is-pressing");
  clearTimeout(tvStaticTimer);
  tvStaticStarted = performance.now();
  $(".tv-cabinet").classList.remove("is-off");
  $(".tv-cabinet").classList.add("is-static");
}
function presentMedia(content, request) {
  if (request !== mediaRequest) return;
  $(".tv-screen").replaceChildren(content);
  if (!$(".tv-screen").children.length) {
    clearTimeout(tvStaticTimer);
    $(".tv-cabinet").classList.remove("is-static");
    $(".tv-cabinet").classList.add("is-off");
    return;
  }

  clearTimeout(tvStaticTimer);
  tvStaticTimer = setTimeout(
    () => {
      if (request === mediaRequest)
        $(".tv-cabinet").classList.remove("is-static");
    },
    reduceSystem.matches
      ? 0
      : Math.max(0, 240 - (performance.now() - tvStaticStarted)),
  );
}
function updateProjectScene(showProjects) {
  const scene = $("#scene");
  if (scene.classList.contains("show-projects") === showProjects) return;
  clearTimeout(walkTimer);
  clearTimeout(tvHideTimer);
  scene.classList.toggle("show-projects", showProjects);
  if (showProjects) scene.classList.add("tv-visible");
  else
    tvHideTimer = setTimeout(() => scene.classList.remove("tv-visible"), 1600);
  $(".shop-tv").inert = !showProjects;
  scene.style.setProperty("--eye-x", showProjects ? "6px" : "0px");
  setPupilOffsets();
  scene.style.setProperty("--eye-y", "0px");
  scene.classList.remove("npc-walking");

  void scene.offsetWidth;
  scene.classList.add("npc-walking");
  walkTimer = setTimeout(() => scene.classList.remove("npc-walking"), 1200);
}
const dialogues = new Map();
const introLines = [
  "Prazer! Me chamo Juan.",
  "Sou estudante de TI, desenvolvedor e artista. Se quiser saber mais, é só clicar nas opções ao lado!",
  "Ainda tô arrumando bastante coisa, mas já dá pra ir olhando à vontade.",
  "Pode usar o mouse ou o teclado. As setas pra cima e pra baixo movem a mão pelo menu, e Z confirma a opção, enquanto X pode tanto pular os diálogos quanto ser usado pra voltar.",
];
function registerDialogue(section, element, accessible, lines) {
  const paragraphs =
    section === "sobre" ? lines.map(() => document.createElement("p")) : null;
  if (paragraphs) element.replaceChildren(...paragraphs);
  const dialogueLines = paragraphs ? [lines.join("\n\n")] : lines;
  const controller = createDialogue(
    element,
    dialogueLines,
    () => reduceSystem.matches,
    (typing) => {
      npc.classList.toggle(
        "is-talking",
        typing && door.classList.contains("is-open") && !modal.open,
      );
      accessible.textContent = dialogueLines[controller.index];
    },
    (text) => {
      if (!paragraphs) {
        element.textContent = text;
        return;
      }
      const parts = text.split("\n\n");
      paragraphs.forEach((paragraph, index) => {
        paragraph.textContent = parts[index] || "";
        paragraph.hidden = !paragraph.textContent;
      });
    },
  );
  dialogues.set(
    section,
    paragraphs
      ? {
          ...controller,
          next() {
            if (controller.isTyping()) controller.reveal();
          },
        }
      : controller,
  );
}
const introText = $("#intro-text");
const introParagraphs = introLines.map(() => document.createElement("p"));
introText.replaceChildren(...introParagraphs);
$("#intro-accessible").textContent = introLines.join("\n\n");

const introDialogue = createDialogue(
  introText,
  [introLines.join("\n\n")],
  () => reduceSystem.matches,
  (typing) => {
    npc.classList.toggle(
      "is-talking",
      typing && door.classList.contains("is-open") && !modal.open,
    );
  },
  (text) => {
    if (!text) {
      $("#scene").style.setProperty("--eye-x", "0px");
      setPupilOffsets();
      $("#scene").style.setProperty("--eye-y", "0px");
    }
    const parts = text.split("\n\n");
    introParagraphs.forEach((paragraph, index) => {
      paragraph.textContent = parts[index] || "";
      paragraph.hidden = !paragraph.textContent;
    });
  },
);
dialogues.set("inicio", {
  ...introDialogue,
  next() {
    if (introDialogue.isTyping()) introDialogue.reveal();
  },
});
$$("[data-dialogue]").forEach((box) => {
  const section = box.closest("[data-screen]").dataset.screen;
  const lines = [...box.querySelectorAll("p")].map((p) => p.textContent.trim());
  const visible = document.createElement(section === "sobre" ? "div" : "p");
  visible.setAttribute("aria-hidden", "true");
  const accessible = document.createElement("p");
  accessible.className = "sr-only";
  box.classList.add("dialogue-line");
  box.setAttribute("role", "button");
  box.tabIndex = 0;
  box.setAttribute(
    "aria-label",
    "Clique pra revelar o texto ou avançar o diálogo",
  );
  box.replaceChildren(visible, accessible);
  registerDialogue(section, visible, accessible, lines);
});
let dialogue = dialogues.get("inicio");
let skillCategory = null;
let selectedSkill = null;
let previewedSkill = null;
const skillPrompts = {
  programacao:
    "Em resumo, o que eu uso pra programar tá aqui. Escolhe algum ícone!",
  design:
    "Em resumo, o que eu uso pra projetar e desenhar tá aqui. Escolhe algum ícone!",
  edicao: "Em resumo, o que eu uso pra editar tá aqui. Escolhe algum ícone!",
};
let toolsAnimationFrame = 0;
let skillTransitionVersion = 0;
let toolsRaisingPromise = null;
let skillsLeaving = false;
function resetSkillSelection() {
  cancelAnimationFrame(toolsAnimationFrame);
  skillCategory = null;
  selectedSkill = null;
  previewedSkill = null;
  const group = $(".hanging-skills");
  group.replaceChildren();
  group.hidden = true;
  $$("[data-skill-category]").forEach((button) =>
    button.setAttribute("aria-pressed", "false"),
  );
}
const ropeAnchorOffset = 200;
function raiseTools() {
  if (toolsRaisingPromise) return toolsRaisingPromise;
  const group = $(".hanging-skills");
  if (!group.children.length || group.hidden) return Promise.resolve();
  cancelAnimationFrame(toolsAnimationFrame);
  group.inert = true;
  const ceiling = $("#scene").getBoundingClientRect().top;
  const animations = [...group.querySelectorAll(".skill-drop")].map(
    (drop, index) => {
      const button = drop.querySelector(".hanging-tool");
      const distance =
        Math.max(0, button.getBoundingClientRect().bottom - ceiling) + 50;
      return drop.animate(
        [
          { transform: "translateY(0)" },
          { transform: `translateY(-${distance}px)` },
        ],
        {
          duration: reduceSystem.matches ? 0 : 650,
          delay: reduceSystem.matches ? 0 : index * 15,
          easing: "cubic-bezier(.45,0,.7,1)",
          fill: "forwards",
        },
      );
    },
  );
  toolsRaisingPromise = Promise.allSettled(
    animations.map((animation) => animation.finished),
  ).then(() => {
    group.replaceChildren();
    animations.forEach((animation) => animation.cancel());
    group.inert = false;
    toolsRaisingPromise = null;
  });
  return toolsRaisingPromise;
}
function positionTools(elapsed = Infinity) {
  const height = $("#scene").clientHeight;
  $$(".skill-pendulum").forEach((tool) => {
    const delay = parseFloat(tool.style.getPropertyValue("--tool-delay")) || 0;
    tool.style.visibility = elapsed < delay ? "hidden" : "visible";

    const t = Math.max(0, (elapsed - delay) / 1000 + 0.1);
    const targetY =
      (height * parseFloat(tool.style.getPropertyValue("--tool-y"))) / 100;
    const anchorOffset =
      ropeAnchorOffset + Math.max(0, targetY - height * 0.28) * 2;
    const length = targetY + anchorOffset;
    tool.style.top = `${-anchorOffset}px`;
    const settled = !Number.isFinite(t) || t > 6;
    const drop = settled ? 1 : 1 - (1 + 6 * t) * Math.exp(-6 * t);
    const angle = settled
      ? 0
      : 8 *
        Math.exp(-0.7 * t) *
        (Math.cos(3.6 * t) + (0.7 / 3.6) * Math.sin(3.6 * t));
    tool.style.setProperty("--rope-height", `${length * drop}px`);
    tool.style.transform = `rotate(${angle}deg)`;
  });
}
function lowerTools() {
  cancelAnimationFrame(toolsAnimationFrame);
  if (reduceSystem.matches) {
    positionTools();
    return;
  }
  const start = performance.now();
  positionTools(0);
  function frame(now) {
    if ($(".hanging-skills").hidden) {
      positionTools();
      return;
    }
    positionTools(now - start);
    if (now - start < 6500) toolsAnimationFrame = requestAnimationFrame(frame);
    else positionTools();
  }
  toolsAnimationFrame = requestAnimationFrame(frame);
}
function speakSkill(text) {
  dialogue.stop();
  const box = $("#screen-habilidades [data-dialogue]");
  dialogue = createDialogue(
    box.querySelector("p"),
    [text],
    () => reduceSystem.matches,
    (typing) => {
      npc.classList.toggle("is-talking", typing && storeReady);
      box.querySelector(".sr-only").textContent = text;
    },
  );
  if (storeReady) dialogue.restart();
  else dialogue.clear();
}
function previewSkill(name) {
  if (
    currentScreen !== "habilidades" ||
    skillsLeaving ||
    toolsRaisingPromise ||
    previewedSkill === name
  )
    return;
  previewedSkill = name;
  speakSkill(`${name}?`);
}
function clearSkillPreview(name) {
  if (previewedSkill !== name) return;
  previewedSkill = null;
  if (currentScreen === "habilidades" && !skillsLeaving && !toolsRaisingPromise)
    speakSkill(skillPrompts[skillCategory]);
}
async function showSkillCategory(category) {
  if (skillsLeaving) return;
  const transition = ++skillTransitionVersion;
  $$("[data-skill-category]").forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.skillCategory === category),
    ),
  );
  await raiseTools();
  if (transition !== skillTransitionVersion || currentScreen !== "habilidades")
    return;
  skillCategory = category;
  selectedSkill = null;
  previewedSkill = null;
  $$("[data-skill-category]").forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.skillCategory === category),
    ),
  );
  const group = $(".hanging-skills");
  group.replaceChildren();
  group.hidden = false;
  const items = skillCategories[category];
  const leftCount = Math.ceil(items.length / 2);
  const sceneHeight = $("#scene").clientHeight;
  const toolsFragment = document.createDocumentFragment();
  items.forEach(([name, symbol, color, description], index) => {
    const left = index < leftCount;
    const position = left ? index : index - leftCount;
    const count = left ? leftCount : items.length - leftCount;
    const x =
      (left ? 7 : 65) + (count > 1 ? (position * 28) / (count - 1) : 14);
    const button = document.createElement("button");
    const pendulum = document.createElement("div");
    pendulum.className = "skill-pendulum";
    const drop = document.createElement("div");
    drop.className = "skill-drop";
    button.type = "button";
    button.className = "hanging-tool";
    button.setAttribute("aria-label", name);
    button.setAttribute("aria-pressed", "false");
    const designHandSides = [
      "right",
      "left",
      "right",
      "left",
      "right",
      "left",
      "left",
    ];
    button.dataset.handSide =
      category === "design"
        ? designHandSides[index]
        : index % 2
          ? "left"
          : "right";
    button.style.setProperty("--tool-x", `${x}%`);
    button.style.setProperty("--tool-y", `${position % 2 ? 60 : 28}%`);
    button.style.setProperty(
      "--rope-height",
      `${sceneHeight * (position % 2 ? 0.6 : 0.28)}px`,
    );
    button.style.setProperty("--tool-color", color);
    button.style.setProperty("--tool-delay", `${index * 45}ms`);
    button.style.setProperty(
      "--tool-tilt",
      `${[-5, 3, -2, 6, -4, 2, 0, -3][index % 8]}deg`,
    );
    pendulum.style.cssText = button.style.cssText;
    button.removeAttribute("style");
    const icon = document.createElement("span");
    icon.className = "tool-icon";
    icon.setAttribute("aria-hidden", "true");
    const logos = skillLogos[name] || [];
    icon.classList.toggle("multiple-logos", logos.length > 1);
    logos.forEach((file) => {
      if (
        [
          "aseprite.png",
          "canva.png",
          "figma.png",
          "affinity.png",
          "photoshop.png",
          "blender.png",
          "krita.png",
          "java.png",
          "javascript.png",
          "python.png",
          "godot.png",
          "html5.png",
          "css.png",
          "git.png",
          "github.png",
          "premiere.png",
          "davinci.png",
          "capcut.png",
        ].includes(file)
      ) {
        icon.classList.add(`pixel-${file.replace(".png", "")}`);
        button.classList.add("has-pixel-sprite");
        if (file === "canva.png") button.classList.add("has-canva-sprite");
        if (file === "figma.png") button.classList.add("has-figma-sprite");
        if (file === "blender.png") button.classList.add("has-blender-sprite");
        if (file === "krita.png") button.classList.add("has-krita-sprite");
        if (file === "java.png") button.classList.add("has-java-sprite");
        if (file === "python.png") button.classList.add("has-python-sprite");
        if (file === "godot.png") button.classList.add("has-godot-sprite");
        if (file === "html5.png") button.classList.add("has-html5-sprite");
        if (file === "git.png") button.classList.add("has-git-sprite");
        if (file === "github.png") button.classList.add("has-github-sprite");

        const image = document.createElement("img");
        image.src = `assets/images/skills/${file}`;
        image.alt = "";
        image.draggable = false;
        icon.append(image);
        return;
      }
      const image = document.createElement("img");
      image.src = `assets/images/skills/${file}`;
      image.alt = "";
      image.draggable = false;
      if (
        [
          "github.svg",
          "aseprite.svg",
          "affinity.svg",
          "davinciresolve.svg",
        ].includes(file)
      )
        image.className = "logo-light";
      icon.append(image);
    });
    if (!logos.length) icon.textContent = symbol;
    button.append(icon);
    button.addEventListener("pointerenter", () => {
      if (!document.documentElement.classList.contains("keyboard-mode"))
        previewSkill(name);
    });
    button.addEventListener("pointerleave", () => {
      if (!document.documentElement.classList.contains("keyboard-mode"))
        clearSkillPreview(name);
    });
    button.addEventListener("click", () => {
      if (!reduceSystem.matches) {
        button.classList.remove("is-poking");
        void button.offsetWidth;
        button.classList.add("is-poking");
        button.getAnimations().forEach((animation) => {
          if (
            animation.effect?.pseudoElement === "::after" &&
            animation.effect
              .getKeyframes()
              .some((frame) => frame.marginTop !== undefined)
          )
            animation.cancel();
        });

        button.animate(
          [
            { marginTop: "0px" },
            { marginTop: "9px", offset: 0.32 },
            { marginTop: "0px" },
          ],
          { duration: 420, easing: "ease-in-out", pseudoElement: "::after" },
        );
        drop.getAnimations().forEach((animation) => animation.cancel());
        drop.animate(
          [
            { transform: "translateY(0)" },
            { transform: "translateY(-9px)", offset: 0.32 },
            { transform: "translateY(0)" },
          ],
          { duration: 420, easing: "ease-in-out" },
        );
      }
      selectedSkill = name;
      previewedSkill = null;
      keyboardZone = "tools";
      $$(".hanging-tool").forEach((tool) =>
        tool.setAttribute("aria-pressed", String(tool === button)),
      );
      speakSkill(description);
    });
    button.addEventListener("focus", () => {
      keyboardZone = "tools";
      if (document.documentElement.classList.contains("keyboard-mode"))
        previewSkill(name);
    });
    button.addEventListener("blur", () => clearSkillPreview(name));
    drop.append(button);
    pendulum.append(drop);
    toolsFragment.append(pendulum);
  });
  group.append(toolsFragment);
  lowerTools();
  speakSkill(skillPrompts[category]);
}
$$("[data-skill-category]").forEach((button) =>
  button.addEventListener("click", () => {
    keyboardZone = "skill-categories";
    showSkillCategory(button.dataset.skillCategory);
  }),
);
reduceSystem.addEventListener("change", () => {
  if (reduceSystem.matches) {
    cancelAnimationFrame(toolsAnimationFrame);
    positionTools();
  }
  if (reduceSystem.matches && dialogue.isTyping()) dialogue.reveal();
  scheduleBlink();
});

function getRoute() {
  const [section, id] = decodeURIComponent(location.hash.slice(1)).split("/");
  return { section: screens.has(section) ? section : "inicio", id: id || null };
}
function setRoute(section, id) {
  const hash = `#${section}${id ? `/${id}` : ""}`;
  if (location.hash === hash) syncRoute();
  else location.hash = hash;
}
function updateSelection(index) {
  menuSelection = (index + menuButtons.length) % menuButtons.length;
  menuButtons.forEach((button, i) =>
    button.classList.toggle("keyboard-selected", i === menuSelection),
  );
}
function resetStore() {
  dialogue.clear();
  dialogues.forEach((controller) => controller.clear());
  ++skillTransitionVersion;
  resetSkillSelection();
  currentFilter = "todos";
  browsingProjects = false;
  displayedProjectId = null;
  previewedProjectId = null;
  ++mediaRequest;
  presentMedia(document.createDocumentFragment(), mediaRequest);
  renderInventory();
  inventory.hidden = true;
  $(".filters").hidden = false;
  $("#back-categories").hidden = true;
  $(".shop-options").dataset.layout = "";
  $$(".filter").forEach((button) => {
    const active = button.dataset.filter === "todos";
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  clearTimeout(walkTimer);
  clearTimeout(tvHideTimer);
  $("#scene").classList.remove(
    "show-projects",
    "tv-visible",
    "npc-walking",
    "show-skills",
  );
  $(".shop-tv").inert = true;
  $("#scene").style.setProperty("--eye-x", "0px");
  $("#scene").style.setProperty("--eye-y", "0px");
  setPupilOffsets();
  previousScreen = currentScreen = "inicio";
  keyboardZone = "menu";
  updateSelection(0);
  document.activeElement?.blur();
  $("#content-panel").scrollTop = 0;

  history.replaceState(null, "", location.pathname + location.search);
  syncRoute();
}
function enterStore(section) {
  if (door.classList.contains("is-closing")) return;
  returningFromExit = false;
  if (door.classList.contains("is-open")) {
    if (section) setRoute(section);
    return;
  }
  storeReady = false;
  resetStore();
  const opening = ++doorOpening;
  dialogue.clear();
  door.classList.remove("is-closing");
  door.classList.add("is-open");
  playDoorSound(door);
  scheduleBlink();
  door.setAttribute("aria-label", "Porta aberta");

  Promise.all(door.getAnimations().map((animation) => animation.finished))
    .then(() => {
      if (opening !== doorOpening || !door.classList.contains("is-open"))
        return;
      storeReady = true;
      dialogue.restart();
    })
    .catch(() => {});
}
async function exitStore() {
  if (currentScreen === "habilidades") {
    ++skillTransitionVersion;
    dialogue.stop();
    skillsLeaving = true;
    await raiseTools();
    resetSkillSelection();
    skillsLeaving = false;
  }
  storeReady = false;
  doorOpening++;
  if (modal.open) modal.close();
  dialogue.stop();
  returningFromExit = true;
  door.classList.add("is-closing");
  door.disabled = true;
  door.classList.remove("is-open");
  playDoorSound(door);
  scheduleBlink();
  door.setAttribute("aria-label", "Loja fechada");

  try {
    history.replaceState(null, "", location.pathname + location.search);
  } catch {}
  currentScreen = "inicio";
  syncRoute();
  updateSelection(0);
}
function nav(section) {
  keyboardZone = "menu";
  enterStore();
  setRoute(section);
}
function createPlaceholder(title, specific = false) {
  const div = document.createElement("div");
  div.className = "placeholder-art";
  const b = document.createElement("b");
  b.textContent = specific ? "ARTE PENDENTE" : "✦ EM CONSTRUÇÃO ✦";
  const small = document.createElement("small");
  small.textContent = specific
    ? `Substituir por uma imagem de ${title}`
    : "Uma nova ilustração entra aqui";
  div.append(b, small);
  return div;
}
function createArt(project) {
  if (!project.image) return createPlaceholder(project.title, true);
  const img = document.createElement("img");
  img.src = project.image;
  img.alt = `Imagem do projeto ${project.title}`;
  img.loading = "lazy";
  img.onerror = () => img.replaceWith(createPlaceholder(project.title, true));
  return img;
}
function visibleProjects() {
  return projects.filter(
    (project) =>
      currentFilter === "todos" || project.collections.includes(currentFilter),
  );
}
function renderInventory() {
  const options = $(".shop-options");
  options.dataset.layout = "project-list";
  inventory.replaceChildren();
  const list = visibleProjects();
  options.style.setProperty(
    "--option-rows",
    String(Math.ceil((list.length + 1) / 2)),
  );
  for (const project of list) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "item-card";
    button.dataset.project = project.id;
    button.setAttribute("aria-label", `Ver projeto ${project.title} na TV`);
    const title = document.createElement("strong");
    title.textContent = project.title;
    button.append(title);
    button.addEventListener("click", () => setRoute("projetos", project.id));
    button.addEventListener("pointerenter", () => {
      if (!document.documentElement.classList.contains("keyboard-mode"))
        previewProject(project);
    });
    button.addEventListener("focus", () => previewProject(project));
    inventory.append(button);
  }
}
function setFilter(filter) {
  currentFilter = filter;
  browsingProjects = true;
  $(".filters").hidden = true;
  inventory.hidden = false;
  $("#back-categories").hidden = false;
  $$(".filter").forEach((b) => {
    const active = b.dataset.filter === filter;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  renderInventory();
  keyboardZone = "cards";
  focusZone("cards");
}
function showCategories() {
  $(".shop-options").dataset.layout = "";
  if (getRoute().id) setRoute("projetos");
  browsingProjects = false;
  $(".filters").hidden = false;
  inventory.hidden = true;
  $("#back-categories").hidden = true;
  keyboardZone = "filters";
}
$("#back-categories").addEventListener("click", () => {
  showCategories();
  focusZone("filters");
});
function previewProject(project) {
  if (
    currentScreen !== "projetos" ||
    getRoute().id ||
    previewedProjectId === project.id
  )
    return;
  previewedProjectId = project.id;
  openProject(project, true);
}
function openProject(project, preview = false) {
  if (!preview) {
    previewedProjectId = null;
    $(".shop-options").dataset.layout = "";
    displayedProjectId = project.id;
  }
  const slides = [
    { src: project.image, caption: project.title },
    ...(project.gallery || []),
  ];
  let slide = 0;
  function showSlide() {
    const request = ++mediaRequest;
    startTvStatic();
    const media = document.createElement("div");
    media.className = "tv-project-media";
    if (project.id === "caiabreso") media.classList.add("tv-black-background");
    if (project.id === "acessa") media.classList.add("tv-acessa-background");
    if (project.id === "abeia") media.classList.add("tv-fill-gallery");
    if (["unifor-hub", "loja", "insetonauta"].includes(project.id))
      media.classList.add("tv-fit-contain");
    const item = slides[slide];
    if (!item.src) {
      presentMedia(document.createDocumentFragment(), request);
      return;
    }
    const visual = document.createElement(
      item.type === "video" || /\.(mp4|webm)$/i.test(item.src)
        ? "video"
        : "img",
    );
    const isVideo = visual instanceof HTMLVideoElement;
    const onReady = async () => {
      if (request !== mediaRequest) return;
      if (!isVideo && visual.naturalHeight > visual.naturalWidth) {
        const candidates = await Promise.all(
          slides.map(
            (entry, index) =>
              new Promise((resolve) => {
                if (index === slide) {
                  resolve(visual);
                  return;
                }
                if (
                  !entry.src ||
                  entry.type === "video" ||
                  /\.(mp4|webm)$/i.test(entry.src)
                ) {
                  resolve(null);
                  return;
                }
                const image = new Image();
                image.alt = entry.caption;
                image.onload = () =>
                  resolve(
                    image.naturalHeight > image.naturalWidth ? image : null,
                  );
                image.onerror = () => resolve(null);
                image.src = entry.src;
              }),
          ),
        );
        if (request !== mediaRequest) return;
        const screen = $(".tv-screen");
        const capacity = screen.clientWidth / Math.max(1, screen.clientHeight);
        const group = [];
        let used = 0;
        const spacing = project.id === "abeia" ? 0 : 0.025;
        for (let offset = 0; offset < slides.length; offset++) {
          const image = candidates[(slide + offset) % slides.length];
          if (!image) continue;
          const ratio = image.naturalWidth / image.naturalHeight;
          if (group.length && used + ratio + spacing > capacity) break;
          group.push(image);
          used += ratio + spacing;
        }
        media.classList.add("tv-portrait-gallery");
        media.replaceChildren(...group);
      }
      presentMedia(media, request);
    };
    visual.addEventListener(isVideo ? "loadedmetadata" : "load", onReady, {
      once: true,
    });
    visual.addEventListener(
      "error",
      () => {
        if (request !== mediaRequest) return;
        presentMedia(document.createDocumentFragment(), request);
      },
      { once: true },
    );
    if (isVideo) {
      visual.controls = true;
      visual.playsInline = true;
      visual.muted = isSoundMuted();
    } else visual.alt = item.caption;
    media.replaceChildren(visual);
    visual.src = item.src;
  }
  showSlide();
  if (preview) return;
  inventory.replaceChildren();
  $("#back-categories").hidden = true;
  const actions = [
    [
      "Próxima imagem",
      () => {
        slide = (slide + 1) % slides.length;
        showSlide();
      },
    ],
    [
      "Imagem anterior",
      () => {
        slide = (slide - 1 + slides.length) % slides.length;
        showSlide();
      },
    ],
    ["Voltar pros projetos", () => setRoute("projetos")],
  ];
  for (const [label, action] of actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "item-card";
    button.textContent = label;
    if (label.startsWith("Voltar")) {
      const arrow = document.createElement("span");
      arrow.className = "back-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "←";
      button.prepend(arrow);
    }
    button.addEventListener("click", action);
    inventory.append(button);
  }
  focusZone("cards");
  const box = $("#screen-projetos [data-dialogue]");
  const accessible = box.querySelector(".sr-only");
  const lines = [project.description];
  const projectDialogue = createDialogue(
    box.querySelector("p"),
    lines,
    () => reduceSystem.matches,
    (typing) => {
      npc.classList.toggle("is-talking", typing && storeReady);
      accessible.textContent = project.description;
    },
  );
  dialogue = {
    ...projectDialogue,
    next() {
      if (projectDialogue.isTyping()) projectDialogue.reveal();
    },
  };
  if (storeReady) dialogue.restart();
  else dialogue.clear();
}

let syncing = false;
function syncRoute() {
  if (syncing || skillsLeaving) return;
  const { section, id } = getRoute();
  if (currentScreen === "habilidades" && section !== "habilidades") {
    ++skillTransitionVersion;
    dialogue.stop();
    const group = $(".hanging-skills");
    if (group.children.length && !group.hidden) {
      skillsLeaving = true;
      raiseTools().then(() => {
        resetSkillSelection();
        skillsLeaving = false;

        syncRoute();
      });
      return;
    }
    resetSkillSelection();
  }
  syncing = true;
  const changed = currentScreen !== section;
  if (changed && section === "projetos" && !id) {
    currentFilter = "todos";
    browsingProjects = false;
    displayedProjectId = null;
    previewedProjectId = null;
    renderInventory();
    showCategories();
    $$(".filter").forEach((button) => {
      const active = button.dataset.filter === "todos";
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    keyboardZone = "menu";
    presentMedia(document.createDocumentFragment(), ++mediaRequest);
  }
  const projectChanged = (id || null) !== displayedProjectId;
  if (changed || projectChanged || id) dialogue.stop();
  if (changed) previousScreen = currentScreen;
  currentScreen = section;
  $(".hanging-skills").hidden = section !== "habilidades" || !skillCategory;
  $("#scene").classList.toggle("show-skills", section === "habilidades");
  updateProjectScene(section === "projetos");
  $$(".screen").forEach((screen) => {
    screen.hidden = screen.dataset.screen !== section;
  });
  $$("[data-nav]").forEach((button) => {
    const active = button.dataset.nav === section;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  dialogue = dialogues.get(section);
  if (changed && storeReady) dialogue.restart();
  if (changed) $("#content-panel").scrollTop = 0;
  const project =
    section === "projetos" && id ? projects.find((p) => p.id === id) : null;
  if (project) {
    if (
      !browsingProjects ||
      (currentFilter !== "todos" &&
        !project.collections.includes(currentFilter))
    )
      setFilter("todos");
    openProject(project);
  } else {
    previewedProjectId = null;
    mediaRequest++;
    if ((displayedProjectId || changed) && section === "projetos") {
      presentMedia(document.createDocumentFragment(), mediaRequest);
      if (browsingProjects) {
        renderInventory();
        $("#back-categories").hidden = false;
        focusZone("cards");
      }
      if (storeReady) dialogue.restart();
    }
    displayedProjectId = null;
    if (modal.open) modal.close();
  }
  syncing = false;
}

$$("[data-nav]").forEach((button) =>
  button.addEventListener("click", () => {
    updateSelection(menuButtons.indexOf(button));
    nav(button.dataset.nav);
  }),
);
menuButtons.forEach((button, index) =>
  button.addEventListener("pointerenter", () => {
    if (!document.documentElement.classList.contains("keyboard-mode"))
      updateSelection(index);
  }),
);
$$("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    keyboardZone = "filters";
    setFilter(button.dataset.filter);
  }),
);
inventory.addEventListener("click", (event) => {
  if (event.target.closest(".item-card")) keyboardZone = "cards";
});
$("#exit-store").addEventListener("click", exitStore);
$$(".contact-list a").forEach((link) =>
  link.addEventListener("focus", () => {
    keyboardZone = "contacts";
  }),
);
door.addEventListener("click", () => {
  if (door.classList.contains("is-open")) return;
  enterStore();
});
$("#close-project").addEventListener("click", () => modal.close());
modal.addEventListener("close", () => {
  if (getRoute().id) setRoute("projetos");
});
window.addEventListener("hashchange", () => {
  if (returningFromExit || !door.classList.contains("is-open")) return;
  syncRoute();
});

$("#content-panel").addEventListener("click", (event) => {
  if (!storeReady) return;
  if (event.target.closest("a,button,.filters,.inventory")) return;
  dialogue.next();
});

function focusZone(zone) {
  keyboardZone = zone;
  if (zone === "menu") {
    menuButtons[menuSelection].focus({ preventScroll: true });
  } else if (zone === "filters") {
    $(".filter.active")?.focus({ preventScroll: true });
  } else if (zone === "cards") {
    $(".item-card")?.focus({ preventScroll: true });
  } else if (zone === "dialogue") {
    $(`[data-screen="${currentScreen}"] .dialogue-line`).focus({
      preventScroll: true,
    });
  } else if (zone === "skill-categories")
    ($('.skill-choice[aria-pressed="true"]') || $(".skill-choice"))?.focus({
      preventScroll: true,
    });
  else if (zone === "tools") $(".hanging-tool")?.focus({ preventScroll: true });
  else if (zone === "contacts")
    $(".contact-list a")?.focus({ preventScroll: true });
}
function moveAmong(nodes, direction, columns = 1) {
  if (!nodes.length) return;
  const current = nodes.indexOf(document.activeElement);
  const next =
    current < 0
      ? 0
      : Math.max(0, Math.min(nodes.length - 1, current + direction * columns));
  nodes[next].focus({ preventScroll: false });
}
function moveShopOption(key) {
  const nodes = [...document.querySelectorAll(".shop-options button")].filter(
    (node) => node.getClientRects().length,
  );
  const current = document.activeElement;
  if (!nodes.includes(current)) {
    nodes[0]?.focus({ preventScroll: true });
    return true;
  }
  const rect = current.getBoundingClientRect();
  const horizontal = key === "ArrowLeft" || key === "ArrowRight";
  const direction = key === "ArrowLeft" || key === "ArrowUp" ? -1 : 1;
  const candidates = nodes
    .filter((node) => node !== current)
    .map((node) => ({ node, rect: node.getBoundingClientRect() }))
    .filter((item) =>
      horizontal
        ? (item.rect.left - rect.left) * direction > 5
        : Math.abs(item.rect.left - rect.left) < 5 &&
          (item.rect.top - rect.top) * direction > 5,
    );
  candidates.sort((a, b) =>
    horizontal
      ? Math.abs(a.rect.left - rect.left) - Math.abs(b.rect.left - rect.left) ||
        Math.abs(a.rect.top - rect.top) - Math.abs(b.rect.top - rect.top)
      : Math.abs(a.rect.top - rect.top) - Math.abs(b.rect.top - rect.top),
  );
  if (!candidates.length) return false;
  candidates[0].node.focus({ preventScroll: true });
  return true;
}

window.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing)
    return;
  const key = event.key.toLowerCase();
  const isConfirm = key === "z" || key === "enter";
  const isCancel = key === "x" || key === "escape";
  const isArrow = event.key.startsWith("Arrow");
  if (!isConfirm && !isCancel && !isArrow) return;
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    target.closest('input,textarea,select,[contenteditable="true"]')
  )
    return;

  if (!door.classList.contains("is-open")) {
    if (isConfirm) {
      event.preventDefault();
      enterStore();
    }
    return;
  }
  if (!storeReady) {
    event.preventDefault();
    return;
  }
  if (modal.open) {
    if (isCancel) {
      event.preventDefault();
      modal.close();
    }

    return;
  }
  if (isCancel) {
    event.preventDefault();
    if (dialogue.isTyping()) {
      dialogue.reveal();
      return;
    }
    if (
      currentScreen === "habilidades" &&
      (selectedSkill || keyboardZone === "tools")
    ) {
      selectedSkill = null;
      focusZone("skill-categories");
      speakSkill(skillPrompts[skillCategory]);
      return;
    }
    if (currentScreen === "projetos" && getRoute().id) {
      setRoute("projetos");
      focusZone("cards");
      return;
    }
    if (currentScreen === "projetos" && browsingProjects) {
      showCategories();
      focusZone("filters");
      return;
    }
    if (currentScreen !== "inicio") {
      nav("inicio");
      updateSelection(0);
      return;
    }
    if (key === "escape") exitStore();
    return;
  }
  if (isArrow) {
    event.preventDefault();
    if (currentScreen === "contato" && keyboardZone === "contacts") {
      if (event.key === "ArrowLeft") {
        focusZone("menu");
        return;
      }
      moveAmong($$(".contact-list a"), event.key === "ArrowUp" ? -1 : 1);
      return;
    }
    if (currentScreen === "habilidades" && keyboardZone === "tools") {
      if (event.key === "ArrowDown") {
        focusZone("skill-categories");
        return;
      }
      moveAmong($$(".hanging-tool"), event.key === "ArrowLeft" ? -1 : 1);
      return;
    }
    if (
      currentScreen === "habilidades" &&
      keyboardZone === "skill-categories"
    ) {
      if (event.key === "ArrowUp" && skillCategory) {
        focusZone("tools");
        return;
      }
      if (event.key === "ArrowLeft") {
        focusZone("menu");
        return;
      }
      moveAmong($$(".skill-choice"), event.key === "ArrowUp" ? -1 : 1);
      return;
    }
    if (keyboardZone === "cards" && currentScreen === "projetos") {
      if (moveShopOption(event.key)) return;
      if (event.key === "ArrowLeft") {
        if (getRoute().id) setRoute("projetos");
        else {
          showCategories();
          focusZone("filters");
        }
        return;
      }
      return;
    }
    if (keyboardZone === "filters" && currentScreen === "projetos") {
      if (moveShopOption(event.key)) return;
      if (event.key === "ArrowLeft") {
        focusZone("menu");
        return;
      }
      return;
    }
    if (keyboardZone === "dialogue") {
      if (event.key === "ArrowRight") {
        focusZone("menu");
        return;
      }
      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown"
      ) {
        focusZone("menu");
        return;
      }
    }
    if (event.key === "ArrowRight") {
      if (currentScreen === "contato") {
        focusZone("contacts");
        return;
      }
      if (currentScreen === "habilidades") {
        focusZone("skill-categories");
        return;
      }
      if (currentScreen === "projetos") {
        focusZone(browsingProjects ? "cards" : "filters");
        return;
      }
      focusZone("dialogue");
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      updateSelection(menuSelection + (event.key === "ArrowDown" ? 1 : -1));
      keyboardZone = "menu";
      menuButtons[menuSelection].focus({ preventScroll: true });
      return;
    }
    return;
  }
  if (isConfirm) {
    if (
      currentScreen === "contato" &&
      target instanceof Element &&
      target.closest(".contact-list a")
    ) {
      if (key === "enter") return;
      event.preventDefault();
      target.closest("a").click();
      return;
    }
    if (
      currentScreen === "habilidades" &&
      target instanceof Element &&
      target.closest(".skill-choice,.hanging-tool")
    ) {
      if (key === "enter") return;
      event.preventDefault();
      target.closest("button").click();
      return;
    }

    if (
      key === "enter" &&
      target instanceof HTMLElement &&
      target.closest("a,.filter,.item-card,.close-detail")
    )
      return;
    event.preventDefault();
    if (
      keyboardZone === "cards" &&
      document.activeElement?.classList.contains("item-card")
    ) {
      document.activeElement.click();
      return;
    }
    if (
      keyboardZone === "filters" &&
      document.activeElement?.classList.contains("filter")
    ) {
      document.activeElement.click();
      return;
    }
    if (
      keyboardZone === "dialogue" ||
      (target instanceof Element && target.closest(".dialogue-line"))
    ) {
      dialogue.next();
      return;
    }
    const selected = menuButtons[menuSelection];
    if (selected.id === "exit-store") exitStore();
    else if (selected.dataset.nav === currentScreen) dialogue.next();
    else nav(selected.dataset.nav);
  }
});

const scene = $("#scene");
const shopOptions = $(".shop-options");
let optionLayoutFrame = 0;
function scheduleOptionColumns() {
  cancelAnimationFrame(optionLayoutFrame);
  optionLayoutFrame = requestAnimationFrame(() => {
    if (currentScreen !== "projetos" || !shopOptions.clientHeight) return;
    if (shopOptions.dataset.layout === "project-list") return;
    const count = [...shopOptions.querySelectorAll("button")].filter(
      (button) => button.getClientRects().length,
    ).length;
    shopOptions.style.setProperty("--option-columns", "1");
    for (let columns = 1; columns <= count; columns++) {
      shopOptions.style.setProperty("--option-columns", String(columns));
      if (shopOptions.scrollWidth <= shopOptions.clientWidth + 1) break;
    }
  });
}
new ResizeObserver(scheduleOptionColumns).observe(shopOptions);
new MutationObserver(scheduleOptionColumns).observe($("#screen-projetos"), {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  attributeFilter: ["hidden"],
});
document.fonts.ready.then(scheduleOptionColumns);

const curtainSizing = new ResizeObserver(() => {
  const scale = Math.max(scene.clientWidth / 1920, scene.clientHeight / 1080);
  scene.style.setProperty("--curtain-width", `${1920 * scale}px`);
  scene.style.setProperty("--curtain-height", `${1080 * scale}px`);
  if (!toolsRaisingPromise) positionTools();
});
curtainSizing.observe(scene);
let lastMousePosition = null;
window.addEventListener("keydown", (event) => {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.isComposing ||
    ["Shift", "Control", "Alt", "Meta"].includes(event.key)
  )
    return;
  document.documentElement.classList.add("keyboard-mode");
  if (scene.classList.contains("tv-visible")) return;
  scene.style.setProperty("--eye-x", "0px");
  setPupilOffsets();
  scene.style.setProperty("--eye-y", "0px");
});
window.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") return;
  const position = { x: event.clientX, y: event.clientY };
  if (
    lastMousePosition &&
    position.x === lastMousePosition.x &&
    position.y === lastMousePosition.y
  )
    return;
  lastMousePosition = position;
  const wasKeyboard =
    document.documentElement.classList.contains("keyboard-mode");
  document.documentElement.classList.remove("keyboard-mode");
  if (wasKeyboard) {
    const hoveredProject =
      event.target instanceof Element
        ? event.target.closest("[data-project]")
        : null;
    const project = hoveredProject
      ? projects.find((item) => item.id === hoveredProject.dataset.project)
      : null;
    if (project) previewProject(project);
    const hoveredMenu =
      event.target instanceof Element
        ? event.target.closest(".menu-option")
        : null;
    if (hoveredMenu && menuButtons.includes(hoveredMenu))
      updateSelection(menuButtons.indexOf(hoveredMenu));
  }
  const t = event.target;
  if (!(t instanceof Element) || !door.classList.contains("is-open")) return;
  if (!storeReady || (currentScreen === "inicio" && introDialogue.isTyping()))
    return;
  if (scene.classList.contains("tv-visible")) return;
  let x = 0,
    y = 0;
  if (t.closest(".content-panel")) {
    x = -6;
    y = 6;
  } else if (t.closest(".menu-panel")) {
    x = 6;
    y = 6;
  } else {
    const rect = scene.getBoundingClientRect();
    x = Math.max(
      -6,
      Math.min(6, ((event.clientX - rect.left) / rect.width - 0.5) * 12),
    );
    y = Math.max(
      -5,
      Math.min(2, ((event.clientY - rect.top) / rect.height - 0.5) * 9),
    );
  }
  const body = npc.querySelector(".npc-body");
  const face = body.getBoundingClientRect();
  const faceX = (event.clientX - face.left) / face.width;
  const faceY = (event.clientY - face.top) / face.height;

  const proximity = Math.max(
    0,
    Math.min(
      1,
      (0.4 - Math.abs(faceX - 0.515)) / 0.2,
      (0.3 - Math.abs(faceY - 0.55)) / 0.15,
    ),
  );
  const followEye = (centerX) => {
    const dx = faceX - centerX,
      dy = faceY - 0.55;
    const distance = Math.max(0.07, Math.hypot(dx, dy));
    const radius = body.clientWidth * 0.018;
    return [
      ((dx / distance) * radius - x) * proximity,
      ((dy / distance) * radius - y) * proximity,
    ];
  };
  setPupilOffsets(...followEye(0.4), ...followEye(0.63));
  scene.style.setProperty("--eye-x", `${x.toFixed(1)}px`);
  scene.style.setProperty("--eye-y", `${y.toFixed(1)}px`);
});

resetStore();
