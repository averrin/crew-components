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
