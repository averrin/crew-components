<svelte:options accessors={true} />

<script>
  import { theme, scale as uiScale } from "./stores.js";
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  import { getContext, onDestroy, tick } from "svelte";
  import { setting } from "./helpers.js";

  export let elementRoot;
  export let id;
  export let extraClass = "";
  export let fullHeight = false;

  const { application } = getContext("external");
  // debugger;
  setTimeout(_ => {
    if (elementRoot) {
      elementRoot.classList.add("alpha-ui");
      elementRoot.classList.add("alpha-" + id);
      elementRoot.dataset["theme"] = $theme;
    }
  }, 1);
  const position = application.position;
  const { left, top, scale } = position.stores;

  const key = "position-" + id;

  tick().then((_) => {
    const pos = setting(key);
    left.set(pos.x);
    top.set(pos.y);
  });

  onDestroy(
    uiScale.subscribe((s) => {
      tick().then((_) => scale.set(s));
    })
  );

  onDestroy(
    left.subscribe((l) => {
      if (!l) return;
      tick().then((_) => {
        const pos = setting(key);
        pos.x = l;
        setting(key, { x: l, y: pos.y });
      });
    })
  );

  onDestroy(
    top.subscribe((t) => {
      if (!t) return;
      tick().then((_) => {
        const pos = setting(key);
        pos.y = t;
        setting(key, { y: t, x: pos.x });
      });
    })
  );
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
