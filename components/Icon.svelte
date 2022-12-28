<script>
  export let icon;
  let isImage = icon?.match(new RegExp(/[///.]/g))?.length > 0;
</script>

{#if !isImage}
<iconify-icon {icon} />
{:else}
  <img src={icon} />
{/if}
