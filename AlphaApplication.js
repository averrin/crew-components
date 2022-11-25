import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import { logger, setting, capitalize } from "./helpers.js";

export default function CreateApplication(spec, props) {
  const {moduleId, app_id, title, component, width = 800, height = 600, temp = false} = spec;
  const appName = capitalize(app_id);
  const show_setting = `show-${app_id}`;
  const isTemp = temp;
  return class AlphaApplication extends SvelteApplication {

    constructor() {
      const widgetId = `alpha-${app_id}`;
      super({ widgetId });
      globalThis.Hooks.on(`closeAlphaApplication`, (app) => {
        if (app.options.id != widgetId) return;
        this._onHide()
      });
    }

    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        id: `alpha-${app_id}`,
        resizable: true,
        minimizable: true,
        zIndex: 95,
        title: title,
        width,
        height,

        svelte: {
          class: component,
          target: document.body,
          props: {...spec, ...props},
        },
      });
    }

    start(hidden = false) {
      if (!isTemp) {
        game.settings.register(moduleId, show_setting, {
          scope: "client",
          config: false,
          type: Boolean,
          default: false,
        });

        game.settings.register(moduleId, `position-${app_id}`, {
          scope: "client",
          config: false,
          type: Object,
          default: { x: 0, y: 0 },
        });

        if (!hidden && setting(show_setting)) this.show();
      }
    }

    toggleCollapsed() {
      Hooks.call(`Alpha${appName}ToggleCollapse`);
    }

    async toggle() {
      if (setting(show_setting)) {
        await this.hide();
      } else {
        await this.show();
      }
    }

    async show() {
      await this.render(true);
      if (!isTemp) {
        globalThis.game.settings.set(moduleId, show_setting, true);
      }
    }
    async hide() {
      await this.close(true);
      this._onHide()
    }

    _onHide() {
      if (!isTemp) {
        globalThis.game.settings.set(moduleId, show_setting, false);
      }
    }

    makeShim() {
      return class SettingsShim extends FormApplication {

        /**
         * @inheritDoc
         */
        constructor() {
          super({});
          AlphaSuit.showSettings(); // TODO: fix
        }

        async _updateObject(event, formData) {
        }

        render() {
          this.close();
        }

      }
    }
  }
}

