<script>
  import Select from "svelte-select";

  import { argSpecs } from "../specs.js";

  import { rgb2hex } from "../helpers.js";
  import Tags from "./Tags.svelte";
  import { HsvPicker } from "svelte-color-picker";
  import { v4 as uuidv4 } from "uuid";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let mode = "direct";

  export let id = uuidv4();
  export let value;
  export let type;
  export let variables = false;
  export let label = "";
  export let vars = [];
  export let additionalItems = [];
  export let selectFull = false;
  export let hideSign = true;
  export let widthAuto = true;
  export let justify = "start";
  export let extra;
  export let optional = false;
  export let defaultValue;
  export let compact = false;
  export let inline = false;
  export let vertical = false;

  export let autoComplete = [];
  export let sequences = [];
  export let spec;

  const compareSigns = [
    { value: "==", label: "==" },
    { value: "!=", label: "!=" },
    { value: "<", label: "<" },
    { value: "<=", label: "<=" },
    { value: ">", label: ">" },
    { value: ">=", label: ">=" },
  ];

  if (optional && (value === "" || value === undefined || value === null)) {
    mode = "optional";
  }

  spec = spec || argSpecs.find((s) => s.id == type);
  let lastVal = value;
  function update() {
    if (lastVal == value) return;
    dispatch("change", value);
    lastVal = value;
  }

  function resetOptionalValue() {
    value = undefined;
    mode = "optional";
    update();
  }

  function fixEmpty() {
    if (
      value === undefined ||
      value === null ||
      (value === "" && "default" in spec && value !== spec.default)
    ) {
      if (defaultValue === undefined) {
        resetValue();
      } else {
        value = defaultValue;
      }
      update();
      return true;
    }
    return false;
  }
  fixEmpty();

  function setEffectSource(e) {
    value = [e.detail.value];
    update();
  }
  function setEffectSourceArg(e) {
    if (e.detail) {
      value[1] = e.detail;
      if (value[0] == "#origin") {
        value[1] = e.detail.id;
      }
    }
    update();
  }

  function selectFile() {
    const fp = new FilePicker();
    fp.callback = (path) => (value = path);
    fp.browse(value);
  }

  function colorChange(e) {
    value = rgb2hex(e.detail).hex.slice(0, 7);
  }

  let options = additionalItems;
  async function populateOptions() {
    spec = spec || argSpecs.find((s) => s.id == type);
    if (spec && "options" in spec) {
      let ops = spec.options;
      if (typeof spec.options === "function") {
        ops = await spec.options(value, extra);
      }
      if (!Array.isArray(ops)) {
        ops.update((items) => {
          ops = items;
          return items;
        });
      }
      options = [...ops, ...additionalItems].flat();
    }
  }
  populateOptions();

  $: {
    if (lastVal != value) {
      populateOptions();
      if (!fixEmpty()) {
        update();
      }
    }
  }
  if (
    (typeof value === "string" || value instanceof String) &&
    value.startsWith("@")
  ) {
    mode = "variable";
  }
  function setMode(e, m) {
    if (e.detail == 0) return;
    mode = m;
    if (mode == "variable") {
      value = "@" + vars[0].name;
    } else {
      value = "";
    }
  }

  function selectVar(e) {
    value = "@" + e.detail.name;
  }
  // function changeFixed(e) {}
  function changeId(e) {
    value = "#id:" + e.target.value;
  }
  function resetValue() {
    if (spec.options) {
      let ops = spec.options;
      if (typeof spec.options === "function") {
        ops = spec.options(value, extra);
      }
      if (typeof ops[0] === "object") {
        value = ops[0].value;
      } else {
        value = ops[0];
      }
    } else if ("default" in spec) {
      value = spec.default;
    } else if (spec.control == "compare-int") {
      value = [];
    } else {
      // debugger;
    }
  }
  const groupBy = (a) => a.group;

  function convertFixed(e) {
    value = { x: Number.parseFloat(value.x), y: Number.parseFloat(value.y) };
  }
</script>

{#if type == "color"}
  <input type="checkbox" id="color-modal-{id}" class="ui-modal-toggle" />
  <label for="color-modal-{id}" class="ui-modal ui-cursor-pointer">
    <label
      class="ui-modal-box ui-relative ui-w-fit ui-flex ui-items-center ui-justify-center ui-flex-col"
      for=""
    >
      <HsvPicker
        on:colorChange={colorChange}
        startColor={value?.slice(0, 7) || "#46525D"}
      />
      <!-- <input type="text" class="ui-input" bind:value /> -->
    </label>
  </label>
{/if}

<label
  class="arg-input ui-input-group ui-min-w-fit ui-input-group-xs ui-justify-{justify}"
  class:ui-input-group-xs={compact}
  class:ui-input-group-vertical={vertical}
  class:inline
  for=""
  class:!ui-w-auto={widthAuto}
  id="{type}-{value}"
>
  <slot name="left" />
  {#if label != ""}
    <span class="" class:ui-italic={optional}>{label}</span>
  {/if}
  {#if mode == "optional"}
    <div
      class="ui-flex ui-flex-row ui-items-center"
      style={!hideSign || label != "" ? "border: 1px solid #ccc;" : ""}
    >
      <input
        type="checkbox"
        class="ui-checkbox"
        on:click={() => (mode = "direct")}
      />
    </div>
  {:else if mode == "direct"}
    {#if !hideSign}
      <button
        class="ui-btn ui-btn-square ui-m-0 !ui-p-[10px]"
        class:ui-btn-disabled={!(variables && vars.length > 0)}
        style:background-color={variables && vars.length > 0
          ? "#316060"
          : "#c7e1e1"}
        style:color={variables && vars.length > 0 ? "white" : "#444444"}
        on:click={(e) => setMode(e, "variable")}
      >
        <iconify-icon icon="fa-solid:hashtag" class="ui-text-lg" />
      </button>
    {/if}

    {#if type == "int"}
      <input type="number" bind:value class="ui-input ui-text-base" />
    {:else if type == "float"}
      <input
        type="number"
        bind:value
        step="0.01"
        class="ui-input ui-text-base"
      />
    {:else if type == "effect_file"}
      <label class="ui-input-group">
        <Select
          items={spec.options(value)}
          value={value && value.split("/")[value.split("/").length - 1]}
          on:select={(e) => (value = e.detail.value)}
          on:clear={(_) => (value = "")}
          isCreatable={true}
          listAutoWidth={false}
          containerStyles="border-radius: 0px !important"
        />
        <button class="ui-btn ui-btn-square" on:click={selectFile}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="ui-h-6 ui-w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            /></svg
          >
        </button>
      </label>
    {:else if type == "sound_file"}
      <label class="ui-input-group">
        <input
          type="text"
          value={value && value.split("/")[value.split("/").length - 1]}
          on:change={(e) => (value = e.detail)}
          class="ui-input ui-text-base"
        />
        <button class="ui-btn ui-btn-square" on:click={selectFile}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="ui-h-6 ui-w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            /></svg
          >
        </button>
      </label>
    {:else if type == "position" || type == "token" || type == "ease" || type == "targets" || type == "hook" || type == "placeable"}
      {#if Array.isArray(value)}
        <div class:ui-w-full={selectFull}>
          <Tags
            allowPaste={true}
            allowDrop={true}
            onlyUnique={true}
            splitWith={","}
            placeholder="Tag"
            {autoComplete}
            minChars="1"
            on:tags={(e) => (value = e.detail.tags)}
            tags={value}
            borderRadius="0rem"
          />
        </div>
        <button class="ui-btn ui-btn-square !ui-p-[8px]" on:click={resetValue}>
          <iconify-icon icon="gridicons:cross" />
        </button>
      {:else if value && typeof value === "string" && value.startsWith("#id:")}
        <input
          type="text"
          value={value.slice(4)}
          on:change={changeId}
          class="ui-input ui-text-base"
        />
        <button class="ui-btn ui-btn-square !ui-p-[8px]" on:click={resetValue}>
          <iconify-icon icon="gridicons:cross" />
        </button>
      {:else if (typeof value === "object" && "x" in value && "y" in value) || type == "offset" || type == "size"}
        <input
          type="number"
          step="0.01"
          bind:value={value.x}
          on:change={convertFixed}
          class="ui-input ui-text-base"
        />
        <input
          type="number"
          step="0.01"
          bind:value={value.y}
          on:change={convertFixed}
          class="ui-input ui-text-base"
        />
        <button class="ui-btn ui-btn-square !ui-p-[8px]" on:click={resetValue}>
          <iconify-icon icon="gridicons:cross" />
        </button>
      {:else}
        <Select
          items={options}
          {value}
          {groupBy}
          on:select={(e) => (value = e.detail.value)}
          on:clear={(_) => (value = "")}
          isCreatable={true}
          listAutoWidth={false}
          isClearable={false}
        />
      {/if}
    {:else if type == "offset" || type == "size"}
      <input
        bind:value={value.x}
        type="number"
        step="0.01"
        on:change={convertFixed}
        class="ui-input ui-text-base"
      />
      <input
        type="number"
        step="0.01"
        bind:value={value.y}
        on:change={convertFixed}
        class="ui-input ui-text-base"
      />
      <button class="ui-btn ui-btn-square !ui-p-[8px]" on:click={resetValue}>
        <iconify-icon icon="gridicons:cross" />
      </button>
    {:else if type == "bool"}
      <div
        class="ui-flex ui-flex-row ui-items-center"
        style={!hideSign || label != "" ? "border: 1px solid #ccc;" : ""}
      >
        <input
          type="checkbox"
          class="ui-toggle ui-toggle-accent ui-toggle-lg"
          bind:checked={value}
          style="border: 1px solid #ccc; border-radius: 1rem; height: 2rem !important; width: 4rem !important; --handleoffset: 2rem !important; margin-left: 1rem;"
        />
      </div>
    {:else if type == "macro"}
      <Select
        items={globalThis.game.macros.map((m) => {
          //m.data.ref = m;
          return m.data;
        })}
        optionIdentifier="name"
        labelIdentifier="name"
        {value}
        on:select={(e) => {
          value = e.detail.name;
        }}
        on:clear={(_) => (value = "")}
        listAutoWidth={false}
      />
    {:else if type == "code" || type == "expression"}
      <input type="text" bind:value class="ui-input ui-text-base" />
    {:else if type == "color"}
      <label
        for="color-modal-{id}"
        class="ui-btn ui-btn-square"
        style:background-color={value}
      />
      {#if !compact}
        <input type="text" bind:value class="ui-input ui-text-base" />
      {/if}
    {:else if type == "effectSource"}
      <Select
        items={options}
        value={options.find((o) => o.value[0] == value[0])}
        on:select={setEffectSource}
        listAutoWidth={false}
        isClearable={false}
      />
      {#if value[0] == "#origin"}
        <Select
          optionIdentifier="id"
          labelIdentifier="title"
          on:select={setEffectSourceArg}
          items={sequences}
          value={value[1]}
          listAutoWidth={false}
          isClearable={false}
        />
      {:else if value[0] != "#sceneId"}
        <input
          on:change={setEffectSourceArg}
          type="text"
          bind:value={value[1]}
          class="ui-input ui-text-base"
        />
      {/if}
    {:else if spec.control == "select"}
      <Select
        items={options}
        {value}
        {groupBy}
        on:select={(e) => (value = e.detail.value)}
        on:clear={(_) => (value = "")}
        listAutoWidth={false}
      />
    {:else if spec.control == "multiselect"}
      <div>
        <Tags
          allowPaste={false}
          allowDrop={false}
          onlyUnique={true}
          onlyAutocomplete={true}
          isClearable={true}
          splitWith={","}
          placeholder="Please select"
          autoComplete={options.map((o) => o.label)}
          minChars="0"
          on:tags={(e) => {
            value = e.detail.tags;
            dispatch("change", value);
          }}
          tags={value}
          borderRadius="0rem 0.5rem 0.5rem 0rem "
        />
      </div>
    {:else if spec.control == "compare-int"}
      <div class="ui-w-16 force-select-width">
        <Select
          items={compareSigns}
          listAutoWidth={false}
          isClearable={false}
          bind:value={value[0]}
          on:change={(_) => (value = [...value])}
          placeholder=""
        />
      </div>
      <input
        type="number"
        bind:value={value[1]}
        on:change={(_) => (value = [...value])}
        class="ui-input ui-text-base"
      />
    {:else}
      <input type="text" bind:value class="ui-input ui-text-base" />
    {/if}
  {:else}
    <button
      class="ui-btn ui-btn-square ui-m-0"
      style="background-color: #aa66cc;"
      on:click={(e) => setMode(e, "direct")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="ui-h-6 ui-w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
        />
      </svg>
    </button>
    <Select
      optionIdentifier="name"
      labelIdentifier="name"
      items={vars}
      value={value && value != "" ? value.slice(1) : vars[0]}
      on:select={selectVar}
      listAutoWidth={false}
      isClearable={false}
    />
  {/if}

  {#if mode != "optional" && optional}
    <button
      class="ui-btn ui-btn-square !ui-p-[8px]"
      on:click={resetOptionalValue}
    >
      <iconify-icon icon="gridicons:cross" />
    </button>
  {/if}
  <slot name="right" />
</label>

<style>
  .ui-toggle:not(:checked) {
    box-shadow: calc(var(--handleoffset) * -1) 0 0 2px hsl(var(--b1)) inset,
      0 0 0 2px hsl(var(--b1)) inset;
  }
  .ui-toggle:checked,
  .ui-toggle[checked="true"] {
    --chkbg: hsl(var(--bc));
    --tw-border-opacity: 1;
    --tw-bg-opacity: 1;
    box-shadow: var(--handleoffset) 0 0 2px hsl(var(--b1)) inset,
      0 0 0 2px hsl(var(--b1)) inset;
  }
</style>