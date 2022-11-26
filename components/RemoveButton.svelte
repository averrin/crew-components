<script>
  import IconButton from "./IconButton.svelte";
  export let size;
  export let type = "remove";
  export let disabled;
  export let title;
</script>

<IconButton
  icon="fluent-emoji-high-contrast:cross-mark"
  {disabled}
  {title}
  on:click
  {size}
  {type}
/>
