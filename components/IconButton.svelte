<script>
  export let icon;
  export let size;
  export let title = "";
  export let type = "outline";
  export let cls;
  export let disabled = false;
  export let style;
  export let loading;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  function click(e) {
    if (!disabled && !loading) {
      dispatch("click", e);
    }
  }
</script>

<button
  class="ui-btn ui-btn-square ui-btn-{size} ui-btn-{type} {cls}"
  class:ui-btn-disabled={disabled}
  {title}
  {style}
  on:click={(e) => click(e)}
>
  <iconify-icon icon={loading ? "line-md:loading-twotone-loop" : icon} />
</button>

<style>
  .ui-btn-primary {
    background-color: hsl(var(--p) / var(--tw-border-opacity));
  }
</style>
