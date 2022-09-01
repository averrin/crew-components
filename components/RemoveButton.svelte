<script>
  import IconButton from "./IconButton.svelte";
  export let size;
  export let type = "remove";
</script>

<IconButton
  icon="fluent-emoji-high-contrast:cross-mark"
  on:click
  {size}
  {type}
/>
