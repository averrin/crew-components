<script>
  export let icon;
  export let size;
  export let title = "";
  export let type = "outline";
  export let cls;
  export let disabled = false;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  function click(e) {
    if (!disabled) {
      dispatch("click", e);
    }
  }
</script>

<button
  class="ui-btn ui-btn-square ui-btn-{size} ui-btn-{type} {cls}"
  class:ui-btn-disabled={disabled}
  {title}
  on:click={(e) => click(e)}
>
  <iconify-icon {icon} />
</button>
