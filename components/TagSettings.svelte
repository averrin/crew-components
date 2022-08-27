<script>
  import { contrastColor } from "../helpers.js";
  import { getContext } from "svelte";

  import ArgInput from "./ArgInput.svelte";
  import Tag from "./Tag.svelte";
  import TagSpec from "../tags.js";

  const tagsStore = getContext("tagsStore");

  function apply() {
    tagsStore.update((tags) => {
      let t = tags.find((t) => t.text == editTag.text);
      if (!t) {
        t = new TagSpec(editTag.text);
        tags.push(t);
      }
      t.color = editTag.color;
      t.icon = editTag.icon;
      t.global = editTag.global;
      return tags;
    });
    editTag = false;
  }

  export let editTag;
</script>

{#if editTag}
  <input
    type="checkbox"
    id="color-modal-tags-{editTag.text}"
    class="ui-modal-toggle"
    bind:checked={editTag}
  />
  <label
    for="color-modal-tags-{editTag.text}"
    class="ui-modal ui-cursor-pointer modal-open"
  >
    <div
      class="ui-modal-box ui-w-11/12 ui-max-w-5xl ui-flex-col ui-gap-1 ui-flex ui-flex-col"
    >
      <h3 class="ui-py-1 ui-font-bold ui-text-lg">Edit tag</h3>
      <div class="ui-flex ui-flex-row ui-items-center ui-gap-2">
        <div
          class="ui-flex ui-flex-row ui-flex-1 ui-items-center ui-gap-2 ui-flex-wrap"
        >
          <ArgInput
            type="color"
            label="color"
            bind:value={editTag.color}
            hideSign={true}
            widthAuto={true}
            defaultValue="#46525D"
          />
          <ArgInput
            type="icon"
            label="icon"
            bind:value={editTag.icon}
            hideSign={true}
            widthAuto={true}
          />
          <!-- <ArgInput -->
          <!--   type="bool" -->
          <!--   label="global" -->
          <!--   bind:value={editTag.global} -->
          <!--   hideSign={true} -->
          <!--   widthAuto={true} -->
          <!-- /> -->
          <!-- <ArgInput type="string" label="text" bind:value={editTag.text} hideSign={true} widthAuto={true}> -->
          <!--    <span slot="right">Text changing will create new tag</span> -->
          <!-- </ArgInput> -->
        </div>
        <div class="ui-flex ui-flex-none ui-gap-1">
          <Tag tag={editTag} />
          <Tag tag={editTag} compact={true} />
        </div>
      </div>
      <div class="ui-modal-tag">
        <label
          for="seq-modal"
          class="ui-btn ui-btn-primary"
          on:click={(_) => apply()}>Save</label
        >
      </div>
    </div>
  </label>
{/if}
