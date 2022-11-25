<script>
  import IconButton from "./IconButton.svelte";
  export let size;
  export let type = "remove";
  export let disabled;
</script>

<IconButton
  icon="fluent-emoji-high-contrast:cross-mark"
  {disabled}
  on:click
  {size}
  {type}
/>
