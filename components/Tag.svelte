<script>
  import { contrastColor } from "../helpers.js";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let tag;
  export let compact = false;
  let text = tag.text?.toString() || "";
  let fgColor;
  let hlColor = "#f94a4a";

  const fieldRegex = new RegExp(/(@[\w.]+)/g);
  const hashRegex = new RegExp(/{#}/g);

  if (!tag.color && text.includes("@")) {
    tag.color = "#7dd3fc";
    if (text.startsWith("show:")) {
      tag.color = "#651e87";
      hlColor = "#7dd3fc";
      fgColor = "#eeeeee";
    } else if (text.startsWith("sort:")) {
      tag.color = "#fcd37d";
      fgColor = "#232323";
    } else {
      fgColor = "#232323";
    }
    text = tag.text.replaceAll(
      fieldRegex,
      `<b style="color: ${hlColor}">$1</b>`
    );
  }
  text = text.replaceAll(hashRegex, `<b style="color: ${hlColor}">{#}</b>`);
  if (!tag.color && ["and", "or"].includes(tag.text)) {
    tag.color = "#ccffdd";
    fgColor = "#232323";
  }

  function handleClick(event) {
    logger.info(event);
    if (event.target != this && !event.target.classList.contains("tag-icon"))
      return;
    event.stopPropagation();
    if (event.which == 1) {
      dispatch("click", tag);
    } else if (event.which == 3) {
      dispatch("right-click", tag);
    }
  }
</script>

{#if text != ""}
  <span
    class="tag ui-gap-1 ui-cursor-pointer"
    draggable={true}
    on:dragstart
    on:pointerdown
    style:background-color={tag.color}
    style:color={fgColor || contrastColor(tag.color)}
    title={tag.text}
    class:compact
    on:pointerup={handleClick}
  >
    {#if tag.icon}
      <iconify-icon
        icon={tag.icon}
        style:color={fgColor || contrastColor(tag.color)}
        class:compact
        class="tag-icon"
      />
    {/if}

    {#if !tag.icon || !compact}
      {@html text}
    {/if}
    {#if !compact}
      <iconify-icon
        class="ui-h-4 ui-w-4 ui-cursor-pointer tag-remove"
        icon="gridicons:cross"
        style:color={fgColor || contrastColor(tag.color)}
        on:pointerdown={(_) => null}
        on:click={(e) => {
          e.stopPropagation();
          dispatch("remove", tag);
        }}
      />
    {/if}
  </span>
{/if}

<style>
  .tag {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    display: flex;
    white-space: nowrap;
    list-style: none;
    background: hsl(var(--n) / var(--tw-bg-opacity));
    color: #fff;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: bold;
    padding: 0px 0.4rem;
    height: unset !important;
    align-items: center;
  }

  .tag.compact {
    font-size: 0.8rem;
  }

  .tag-remove {
    cursor: pointer;
    font-size: 16px;
  }
  iconify-icon {
    font-size: 1.2rem;
  }

  iconify-icon.compact {
    margin: 2px 0px !important;
    font-size: 1rem;
  }
</style>
