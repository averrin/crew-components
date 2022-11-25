import { writable, get } from 'svelte/store';
import { setting, moduleId, logger } from './helpers.js'

export function settingStore(store, key) {
  store.set(setting(key))
  const spec = game.settings.settings.get(`${get(moduleId)}.${key}`);
  spec.onChange = val => {
    store.set(val);
  }
  store.subscribe(v => {
    // logger.info("Write setting store", key, v)
    setting(key, v);
  });
  return store;
}

export function userFlagStore(key, defaultValue) {
  const store = writable(game.user.getFlag(get(moduleId),key) ?? defaultValue)
  store.subscribe(v => {
    game.user.setFlag(get(moduleId), key, v)
  });
  return store;
}

export function hookedStore(hooks, getter) {
  if (!Array.isArray(hooks)) {
    hooks = [hooks];
  }
  const store = writable(getter())
  for (const hook of hooks) {
    Hooks.on(hook, _ => {
      // logger.info("Update hooked store", hook, getter())
      store.set(getter())
    })
  }
  return store;
}

export let theme = writable("light");
export let scale = writable(1.0);
export let currentScene = writable(null);

export function initStores() {
  scale = settingStore(scale, "ui-scale");
  theme = settingStore(theme, "theme");
  logger.info(get(theme));
  if (!["dark", "light"].includes(get(theme))) {
    setting("theme", "light");
  }

  currentScene.set(canvas.scene);
  Hooks.on("canvasInit", () => {
    Hooks.once("renderCombatTracker", _ => currentScene.set(canvas.scene));
  });
}
