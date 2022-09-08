<script>
  import { contrastColor } from "../helpers.js";
  import { getContext } from "svelte";

  import ArgInput from "./ArgInput.svelte";
  import Tag from "./Tag.svelte";
  import TagSpec from "../tags.js";
  export let showGlobalSetting = false;

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
    id="modal-tags-{editTag.text}"
    class="ui-modal-toggle"
    bind:checked={editTag}
  />
  <label
    for="modal-tags-{editTag.text}"
    class="ui-modal ui-cursor-pointer modal-open ui-items-center"
    style="pointer-events: all;"
  >
    <div
      class="ui-modal-box ui-bg-base-100 ui-w-11/12 ui-max-w-5xl ui-flex-col ui-gap-1 ui-flex ui-flex-col ui-max-h-64"
    >
      <h3 class="ui-py-1 ui-font-bold ui-text-lg ui-text-base-content">
        Edit tag
      </h3>
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
            size="md"
          />
          <ArgInput
            type="icon"
            label="icon"
            bind:value={editTag.icon}
            hideSign={true}
            widthAuto={true}
            size="md"
          />
          {#if showGlobalSetting}
            <ArgInput
              type="bool"
              label="global"
              bind:value={editTag.global}
              hideSign={true}
              widthAuto={true}
            />
          {/if}
          <!-- <ArgInput type="string" label="text" bind:value={editTag.text} hideSign={true} widthAuto={true}> -->
          <!--    <span slot="right">Text changing will create new tag</span> -->
          <!-- </ArgInput> -->
        </div>
        <div class="ui-flex ui-flex-none ui-gap-1">
          <Tag tag={editTag} />
          <Tag tag={editTag} compact={true} />
        </div>
      </div>
      <div
        class="ui-btn ui-btn-primary ui-btn-md ui-place-self-end"
        on:click={(_) => apply()}
      >
        Save
      </div>
    </div>
  </label>
{/if}
