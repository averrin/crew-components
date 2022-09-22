<script>
  export let icon;
  export let color;
  export let title;
</script>

<iconify-icon
  {icon}
  class="ui-text-lg icon-button ui-text-base-content"
  style:color
  on:click
  on:pointerdown={(_) => null}
  {title}
/>
