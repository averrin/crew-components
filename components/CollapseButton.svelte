<script>
  export let collapsed = false;
</script>

<button
  title="toggle collapsed"
  class="ui-btn ui-btn-square"
  class:ui-btn-outline={!collapsed}
  on:click
>
  {#if collapsed}
    <iconify-icon icon="fa-solid:expand-arrows-alt" />
  {:else}
    <iconify-icon icon="fa-solid:compress-arrows-alt" />
  {/if}
</button>
