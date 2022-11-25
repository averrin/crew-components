<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  import { getContext, onDestroy, tick } from "svelte";
  import { setting, moduleId } from "./helpers.js";
  import {theme, scale as uiScale} from "./stores.js"

  export let elementRoot;
  export let id;
  export let extraClass = "";
  export let fullHeight = false;
  export let temp = false;

  const { application } = getContext("external");
  // debugger;
  tick().then((_) => {
    const element = document.getElementById("alpha-" + id)
    if (element) {
      element.classList.add("alpha-ui");
      element.classList.add("alpha-" + id);
      element.dataset["theme"] = $theme;
    } else {
      debugger;
    }
  });
  const position = application.position;
  const { left, top, scale } = position.stores;


  const key = "position-" + id;

  if (!temp) {
    tick().then((_) => {
      const pos = setting(key);
      left.set(pos.x);
      top.set(pos.y);
    });

    onDestroy(
      uiScale.subscribe((s) => {
        tick().then((_) => scale.set(s));
      }),
      left.subscribe((l) => {
        if (!l) return;
        tick().then((_) => {
          const pos = setting(key);
          pos.x = l;
          setting(key, { x: l, y: pos.y });
        });
      }),
      top.subscribe((t) => {
        if (!t) return;
        tick().then((_) => {
          const pos = setting(key);
          pos.y = t;
          setting(key, { y: t, x: pos.x });
        });
      })
    );
  }
</script>

<ApplicationShell bind:elementRoot>
  <main
    class={`alpha-ui ui-flex ui-flex-col ui-container ui-text-base-content ${extraClass}`}
    style:height={fullHeight ? "100%" : "unset"}
    data-theme={$theme}
  >
    <slot />
  </main>
</ApplicationShell>
