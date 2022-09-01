<script>
  export let icon;
  export let size;
  export let title = "";
  export let type = "outline";
  export let cls;
</script>

<button
  class="ui-btn ui-btn-square ui-btn-{size} ui-btn-{type} {cls}"
  {title}
  on:click
>
  <iconify-icon {icon} />
</button>

<style>
  .ui-btn-ghost:not(.ui-border),
  .ui-btn-ghost:hover:not(.ui-border) {
    border: none;
  }

  .ui-btn:hover:not(.ui-btn-ghost) iconify-icon {
    color: hsl(var(--b2) / var(--tw-text-opacity));
  }

  .ui-btn-ghost,
  .ui-btn-ghost:hover {
    border-color: currentColor;
    background-color: transparent;
    --tw-text-opacity: 1;
    color: hsl(var(--bc) / var(--tw-text-opacity));
  }

  .ui-btn-remove {
    background-color: hsl(var(--er) / var(--tw-bg-opacity));
    border-color: hsl(var(--er) / var(--tw-bg-opacity));
  }
  .ui-btn-primary {
    background-color: hsl(var(--n) / var(--tw-bg-opacity));
  }
  .ui-btn-outline {
    border-color: currentColor;
    background-color: transparent;
    --tw-text-opacity: 1;
    color: hsl(var(--bc) / var(--tw-text-opacity));
  }
</style>
