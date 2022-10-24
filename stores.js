import { writable, get } from 'svelte/store';
import { setting, moduleId, logger } from './helpers.js'

export function settingStore(key) {
  const store = writable(setting(key))
  const spec = game.settings.settings.get(`${moduleId}.${key}`);
  spec.onChange = val => {
    store.set(val);
  }
  return store;
}

export function hookedStore(hooks, getter) {
  if (!Array.isArray(hooks)) {
    hooks = [hooks];
  }
  const store = writable(getter())
  for (const hook of hooks) {
    Hooks.on(hook, _ => {
      logger.info("Update hooked store", hook, getter())
      store.set(getter())
    })
  }
  return store;
}

export let theme = writable("light");
export let currentScene = writable(null);

export function initStores() {
  theme = settingStore("theme");

  currentScene.set(canvas.scene);
  Hooks.on("canvasInit", () => {
    Hooks.once("renderCombatTracker", _ => currentScene.set(canvas.scene));
  });
}
