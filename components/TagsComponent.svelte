<script>
  // This is a modified version of https://github.com/agustinl/svelte-tags-input
  import { createEventDispatcher, onDestroy } from "svelte";
  import { getContext, tick } from "svelte";
  import Tag from "./Tag.svelte";
  // import { tagsStore } from "../../modules/stores.js";

  const dispatch = createEventDispatcher();

  let tag = "";
  let arrelementsmatch = [];
  let regExpEscape = (s) => {
    return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
  };

  export let tags;
  export let addKeys;
  export let maxTags;
  export let onlyUnique;
  export let removeKeys;
  export let placeholder;
  export let allowPaste;
  export let allowDrop;
  export let splitWith;
  export let autoComplete;
  export let autoCompleteFilter;
  export let autoCompleteKey;
  export let autoCompleteMarkupKey;
  export let name;
  export let id;
  export let allowBlur;
  export let disable;
  export let minChars;
  export let onlyAutocomplete;
  export let labelText;
  export let labelShow;
  export let colors = {};
  export let icons = {};
  export let borderRadius = undefined;
  export let tagsStore = undefined;

  let layoutElement;

  if (!tagsStore) {
    tagsStore = getContext("tagsStore");
  }

  if (tagsStore) {
    const unsub = tagsStore.subscribe((oTags) => {
      for (const t of oTags) {
        colors[t.text] = t.color;
        icons[t.text] = t.icon;
      }
    });
    onDestroy(unsub);
  }

  tags = tags || [];
  if (tags == "") tags = [];
  // $: {
  //   if (typeof tags[0] !== "string" && !(tags[0] instanceof String)) {
  //     tags = tags.map((t) => t.text);
  // }
  //   }
  $: addKeys = addKeys || [13];
  $: maxTags = maxTags || false;
  $: onlyUnique = onlyUnique || false;
  $: removeKeys = removeKeys || [8];
  $: placeholder = placeholder || "";
  $: allowPaste = allowPaste || false;
  $: allowDrop = allowDrop || false;
  $: splitWith = splitWith || ",";
  $: autoComplete = autoComplete || false;
  $: autoCompleteFilter =
    typeof autoCompleteFilter == "undefined" ? true : false;
  $: autoCompleteKey = autoCompleteKey || false;
  $: autoCompleteMarkupKey = autoCompleteMarkupKey || false;
  $: name = name || "svelte-tags-input";
  $: id = id || uniqueID();
  $: allowBlur = allowBlur || false;
  $: disable = disable || false;
  $: minChars = minChars || 1;
  $: onlyAutocomplete = onlyAutocomplete || false;
  $: labelText = labelText || name;
  $: labelShow = labelShow || false;

  $: matchsID = id + "_matchs";

  let storePlaceholder = placeholder;

  function setTag(e) {
    const currentTag = e.target.value;

    if (addKeys) {
      addKeys.forEach(function (key) {
        if (key === e.keyCode) {
          if (currentTag) e.preventDefault();

          /* switch (input.keyCode) {
                case 9:
                    // TAB add first element on the autoComplete list
                    if (autoComplete && document.getElementById(matchsID)) {
                        addTag(document.getElementById(matchsID).querySelectorAll("li")[0].textContent);
                    } else {
                        addTag(currentTag);
                    }
                    break;
                default:
                    addTag(currentTag);
                    break;
                } */
          if (autoComplete && document.getElementById(matchsID)) {
            addTag(
              document.getElementById(matchsID).querySelectorAll("li")[0]
                .textContent
            );
          } else {
            addTag(currentTag);
          }
        }
      });
    }

    if (removeKeys) {
      removeKeys.forEach(function (key) {
        if (key === e.keyCode && tag === "") {
          tags.pop();
          tags = tags != "" ? tags : [];

          dispatch("tags", {
            tags: tags,
          });

          arrelementsmatch = [];
          document.getElementById(id).readOnly = false;
          placeholder = storePlaceholder;
          document.getElementById(id).focus();
        }
      });
    }

    // ArrowDown : focus on first element of the autocomplete
    if (e.keyCode === 40 && autoComplete && document.getElementById(matchsID)) {
      e.preventDefault();
      document.getElementById(matchsID).querySelector("li:first-child").focus();
    } // ArrowUp : focus on last element of the autocomplete
    else if (
      e.keyCode === 38 &&
      autoComplete &&
      document.getElementById(matchsID)
    ) {
      e.preventDefault();
      document.getElementById(matchsID).querySelector("li:last-child").focus();
    }
  }

  function addTag(currentTag) {
    if (typeof currentTag === "object" && currentTag !== null) {
      if (!autoCompleteKey) {
        return console.error(
          "'autoCompleteKey' is necessary if 'autoComplete' result is an array of objects"
        );
      }

      var currentObjTags = currentTag;
      currentTag = currentTag[autoCompleteKey].trim();
    } else {
      currentTag = currentTag.trim();
    }

    if (currentTag == "") return;
    if (maxTags && tags.length == maxTags) return;
    if (onlyUnique && tags.includes(currentTag)) return;
    if (onlyAutocomplete && arrelementsmatch.length === 0) return;

    tags = tags != "" ? tags : [];
    tags.push(currentObjTags ? currentObjTags : currentTag);
    tags = tags != "" ? tags : [];
    tag = "";

    dispatch("tags", {
      tags: tags,
    });

    // Hide autocomplete list
    // Focus on svelte tags input
    arrelementsmatch = [];
    document.getElementById(id).focus();

    if (maxTags && tags.length == maxTags) {
      document.getElementById(id).readOnly = true;
      placeholder = "";
    }
  }

  function removeTag(tag) {
    const i = tags.indexOf(tag);
    tags.splice(i, 1);
    tags = tags != "" ? tags : [];

    dispatch("tags", {
      tags: tags,
    });

    // Hide autocomplete list
    // Focus on svelte tags input
    arrelementsmatch = [];
    document.getElementById(id).readOnly = false;
    placeholder = storePlaceholder;
    document.getElementById(id).focus();
  }

  function onPaste(e) {
    if (!allowPaste) return;
    e.preventDefault();

    const data = getClipboardData(e);
    splitTags(data).map((tag) => addTag(tag));
  }

  function onDragStart(e) {
    var childNode = this.childNodes;
    var text = "";

    childNode.forEach(function (value) {
      if (value.nodeType === Node.TEXT_NODE) {
        text += value.nodeValue;
      }
    });
    e.dataTransfer.setData("Text", text);
  }

  function onDrop(e) {
    if (!allowDrop) return;
    e.preventDefault();

    const data = e.dataTransfer.getData("Text");
    if (onlyUnique && tags.includes(data)) return;
    addTag(data);
  }

  function onFocus() {
    layoutElement.classList.add("focus");
  }

  function onBlur(e, tag) {
    layoutElement.classList.remove("focus");

    if (!document.getElementById(matchsID) && allowBlur) {
      e.preventDefault();
      addTag(tag);
    }
  }

  function onClick() {
    minChars == 0 && getMatchElements();
  }

  function getClipboardData(e) {
    if (window.clipboardData) {
      return window.clipboardData.getData("Text");
    }

    if (e.clipboardData) {
      return e.clipboardData.getData("text/plain");
    }

    return "";
  }

  function splitTags(data) {
    return data.split(splitWith).map((tag) => tag.trim());
  }

  function escapeHTML(string) {
    const htmlEscapes = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
    };
    return ("" + string).replace(/[&<>"'\/]/g, (match) => htmlEscapes[match]);
  }

  function buildMatchMarkup(search, value) {
    return escapeHTML(value).replace(
      RegExp(regExpEscape(search.toLowerCase()), "i"),
      "<strong>$&</strong>"
    );
  }

  async function getMatchElements(input) {
    if (!autoComplete) return;

    let value = input ? input.target.value : "";
    let autoCompleteValues = [];

    if (Array.isArray(autoComplete)) {
      autoCompleteValues = autoComplete;
    }

    if (typeof autoComplete === "function") {
      if (autoComplete.constructor.name === "AsyncFunction") {
        autoCompleteValues = await autoComplete(value);
      } else {
        autoCompleteValues = autoComplete(value);
      }
    }

    if (autoCompleteValues.constructor.name === "Promise") {
      autoCompleteValues = await autoCompleteValues;
    }

    // Escape
    if (
      (minChars > 0 && value == "") ||
      (input && input.keyCode === 27) ||
      value.length < minChars
    ) {
      arrelementsmatch = [];
      return;
    }

    let matchs = autoCompleteValues;

    if (
      typeof autoCompleteValues[0] === "object" &&
      autoCompleteValues !== null
    ) {
      if (!autoCompleteKey) {
        return console.error(
          "'autoCompleteValue' is necessary if 'autoComplete' result is an array of objects"
        );
      }

      if (autoCompleteFilter !== false) {
        matchs = autoCompleteValues.filter((e) =>
          e[autoCompleteKey].toLowerCase().includes(value.toLowerCase())
        );
      }
      matchs = matchs.map((matchTag) => {
        return {
          label: matchTag,
          search: autoCompleteMarkupKey
            ? matchTag[autoCompleteMarkupKey]
            : buildMatchMarkup(value, matchTag[autoCompleteKey]),
        };
      });
    } else {
      if (autoCompleteFilter !== false) {
        matchs = autoCompleteValues.filter((e) =>
          e.toLowerCase().includes(value.toLowerCase())
        );
      }
      matchs = matchs.map((matchTag) => {
        return {
          label: matchTag,
          search: buildMatchMarkup(value, matchTag),
        };
      });
    }

    if (onlyUnique === true && !autoCompleteKey) {
      matchs = matchs.filter((tag) => !tags.includes(tag.label));
    }

    arrelementsmatch = matchs;
  }

  function navigateAutoComplete(
    e,
    autoCompleteIndex,
    autoCompleteLength,
    autoCompleteElement
  ) {
    if (!autoComplete) return;

    e.preventDefault();

    // ArrowDown
    if (e.keyCode === 40) {
      // Last element on the list ? Go to the first
      if (autoCompleteIndex + 1 === autoCompleteLength) {
        document
          .getElementById(matchsID)
          .querySelector("li:first-child")
          .focus();
        return;
      }
      document
        .getElementById(matchsID)
        .querySelectorAll("li")
        [autoCompleteIndex + 1].focus();
    } else if (e.keyCode === 38) {
      // ArrowUp
      // First element on the list ? Go to the last
      if (autoCompleteIndex === 0) {
        document
          .getElementById(matchsID)
          .querySelector("li:last-child")
          .focus();
        return;
      }
      document
        .getElementById(matchsID)
        .querySelectorAll("li")
        [autoCompleteIndex - 1].focus();
    } else if (e.keyCode === 13) {
      // Enter
      addTag(autoCompleteElement);
    } else if (e.keyCode === 27) {
      // Escape
      arrelementsmatch = [];
      document.getElementById(id).focus();
    }
  }

  function uniqueID() {
    return "sti_" + Math.random().toString(36).substring(2, 11);
  }

  export let onTagClick = undefined;
  export let onTagRClick = undefined;

  onTagClick = onTagClick || getContext("tagClick");
  onTagRClick = onTagRClick || getContext("tagRClick");

  function onTagClickHandler(event) {
    const clickedTag = event.detail.text;
    if (onTagClick) {
      onTagClick && onTagClick(event, clickedTag);
    } else if (!disable) {
      logger.info("single click");
      removeTag(clickedTag);

      tag = clickedTag;
      tick().then((_) => {
        document.getElementById(id).focus();
        document.getElementById(id).value = "";
        document.getElementById(id).value = clickedTag;
      });
    }
  }

  function onTagRClickHandler(event) {
    const clickedTag = event.detail.text;
    onTagRClick && onTagRClick(event, clickedTag);
  }
</script>

<div
  class="svelte-tags-input-layout ui-flex ui-flex-row ui-gap-1 ui-items-center ui-justify-start ui-p-1"
  class:sti-disabled={disable}
  bind:this={layoutElement}
  style:border-radius={borderRadius}
>
  <label for={id} class={labelShow ? "" : "sr-only"}>{labelText}</label>

  {#if tags?.length > 0}
    {#each tags as tag, i (tag + i)}
      <Tag
        tag={{
          text: typeof tag === "string" ? tag : tag[autoCompleteKey],
          icon: icons[tag],
          color: colors[tag],
        }}
        compact={disable}
        on:remove={() => removeTag(tag)}
        on:dragstart={onDragStart}
        on:click={onTagClickHandler}
        on:right-click={onTagRClickHandler}
      />
    {/each}
  {/if}
  {#if !disable}
    <input
      type="text"
      {id}
      {name}
      bind:value={tag}
      on:keydown={setTag}
      on:keyup={getMatchElements}
      on:paste={onPaste}
      on:drop={onDrop}
      on:focus={onFocus}
      on:blur={(e) => onBlur(e, tag)}
      on:click={onClick}
      class="svelte-tags-input !ui-rounded"
      {placeholder}
      disabled={disable}
    />
  {/if}
</div>

{#if autoComplete && arrelementsmatch.length > 0}
  <div class="svelte-tags-input-matchs-parent ui-flex-none">
    <ul id="{id}_matchs" class="svelte-tags-input-matchs ui-flex-none">
      {#each arrelementsmatch as element, index}
        <li
          tabindex="-1"
          on:keydown={(e) =>
            navigateAutoComplete(
              e,
              index,
              arrelementsmatch.length,
              element.label
            )}
          on:click={() => addTag(element.label)}
        >
          {@html element.search}
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style lang="scss">
  /* CSS svelte-tags-input */

  .svelte-tags-input,
  .svelte-tags-input-tag,
  .svelte-tags-input-matchs,
  .svelte-tags-input-layout label {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    /* font-size: 1.2rem; */
    font-size: 0.8rem;
    padding: 2px 5px;
    background-color: hsl(var(--b1));
    color: hsl(var(--bc));
  }

  .svelte-tags-input-layout label {
    margin: 4px 5px 0 0;
    padding: 0;
    font-weight: 500;
  }

  /* svelte-tags-input-layout */

  .svelte-tags-input-layout {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    border: solid 1px hsl(var(--b3));
    min-height: var(--control-height);
    height: var(--control-height);

    width: 100%;

    align-items: stretch;
    input {
      display: flex;
      color: hsl(var(--bc));
    }
  }

  /* svelte-tags-input */

  .svelte-tags-input {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    margin: 0;

    border: none;
  }

  .svelte-tags-input:focus {
    outline: 0;
  }

  /* svelte-tags-input-tag */

  .svelte-tags-input-tag {
    display: flex;
    white-space: nowrap;
    list-style: none;
    color: #fff;
    border-radius: 6px;
    font-weight: bold;
    padding: 0px 0.4rem;
    align-items: center;
  }

  .svelte-tags-input-tag-remove {
    cursor: pointer;
    font-size: 16px;
  }

  /* svelte-tags-input-matchs */

  .svelte-tags-input-matchs-parent {
    position: relative;
  }

  .svelte-tags-input-matchs {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin: 3px 0;
    padding: 0px;
    /* border: solid 1px #ccc; */
    border-radius: 2px;
    max-height: 310px;
    overflow: scroll;
    overflow-x: auto;
    z-index: 999;
  }

  .svelte-tags-input-matchs li {
    list-style: none;
    padding: 5px;
    border-radius: 2px;
    cursor: pointer;
  }

  .svelte-tags-input-matchs li:hover,
  .svelte-tags-input-matchs li:focus {
    outline: none;
    background-color: hsl(var(--b3));
    color: hsl(var(--bc));
  }

  /* svelte-tags-input disabled */
  .svelte-tags-input-layout.sti-layout-disable,
  .svelte-tags-input:disabled {
    cursor: not-allowed;
  }

  .svelte-tags-input-layout.sti-layout-disable:hover,
  .svelte-tags-input-layout.sti-layout-disable:focus {
    border-color: #ccc;
  }

  .svelte-tags-input-layout.sti-layout-disable .svelte-tags-input-tag-remove {
    cursor: not-allowed;
  }

  .svelte-tags-input-layout label.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .sti-disabled {
    border: none !important;
    background-color: transparent !important;
    --main-input-height: 2rem !important;
  }
  .sti-disabled span {
    font-size: 0.8rem !important;
    padding: 0px 0.4rem !important;
  }
</style>
