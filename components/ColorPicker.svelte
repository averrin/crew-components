<svelte:options accessors={true} />

<script>
  import AlphaShell from "crew-components/AlphaShell";
  import { HsvPicker } from "svelte-color-picker";
  import { rgb2hex } from "../helpers.js";
  import { tick, getContext } from "svelte";

  export let elementRoot;
  export let value;

  function colorChange(e) {
    value.set(rgb2hex(e.detail).hex.slice(0, 7));
  }

  function fixCP() {
    tick().then((_) => {
      document
        .querySelectorAll("#alpha-color-picker .alpha-selector")
        .forEach((e) => (e.style.display = "none"));
      document
        .querySelectorAll("#alpha-color-picker .color-info-box")
        .forEach((e) => (e.style.display = "none"));
      document
        .querySelectorAll("#alpha-color-picker .main-container")
        .forEach((e) => (e.style.height = "unset"));
    });
  }
  fixCP();

  $: {
    if ($value && typeof $value !== "string") {
      value.set("#" + $value.toString(16));
    }
    fixCP();
  }
  const app = getContext("external").application;
</script>

<AlphaShell bind:elementRoot id="color-picker" isTemp={true}>
  <div class="ui-flex ui-flex-col ui-gap-2">
    <HsvPicker
      on:colorChange={colorChange}
      startColor={$value?.slice(0, 7) || "#46525D"}
    />
    <button class="ui-btn ui-btn-md ui-btn-primary" on:click={_ => app.close()}>Close</button>
  </div>
</AlphaShell>
