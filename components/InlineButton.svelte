<script>
  export let disabled = false;
  export let icon;
  export let color;
  export let title;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  function click(e) {
    if (!disabled) {
      dispatch("click", e);
    }
  }
</script>

<iconify-icon
  {icon}
  class:ui-btn-disabled={disabled}
  class="ui-text-lg icon-button ui-text-base-content"
  style:color
  on:click={(e) => click(e)}
  on:pointerdown={(_) => null}
  {title}
/>
