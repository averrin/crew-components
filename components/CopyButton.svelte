<script>
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import IconButton from "./IconButton.svelte";
  export let text;
  export let notification;
  export let icon;
  export let title;
  export let type = "primary";
  export let size;

  if (!notification) {
    notification = `Copied: ${text}`;
  }
</script>

<CopyToClipboard
  {text}
  on:copy={(_) => globalThis.ui.notifications.info(notification)}
  let:copy
>
  <IconButton {size} {icon} {title} on:click={copy} {type} />
</CopyToClipboard>
