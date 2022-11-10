<script>
  import Select from "svelte-select";

  import RemoveButton from "./RemoveButton.svelte";
  import IconButton from "./IconButton.svelte";
  import Icon from "./Icon.svelte";

  import { argSpecs } from "../specs.js";
  import { get } from "svelte/store";

  import { rgb2hex } from "../helpers.js";
  import Tags from "./Tags.svelte";
  import { HsvPicker } from "svelte-color-picker";
  import { v4 as uuidv4 } from "uuid";
  import { tick } from "svelte";
  import { getContext } from "svelte";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let mode = "direct";

  export let icon;
  export let disabled = false;
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
  export let heightAuto = false;
  export let justify = "start";
  export let extra;
  export let optional = false;
  export let defaultValue;
  export let compact = false;
  export let inline = false;
  export let vertical = false;
  export let clearable = false;
  export let resettable = false;

  export let autoComplete = [];
  export let sequences = [];
  export let spec;
  export let size = "md";
  export let onlyAutocomplete = true;

  export let min;
  export let max;
  export let step;
  export let linked = false;
  if (type == "scale_xy") {
    linked = true;
  }

  export let isRestricted;
  isRestricted = isRestricted || getContext("isRestricted");

  if (["target"].includes(type)) {
    heightAuto = true;
  }

  export let width;
  let style = "";
  if (width) {
    style = `width: ${width} !important`;
  }

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
  if (!spec) {
    logger.error("Unknown spec", label, type, argSpecs);
  }
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

  async function handleDrop(event) {
    const data = TextEditor.getDragEventData(event);
    if (data.type != "Tile") return;

    let file = data.texture.src;
    const db = Sequencer.Database.inverseFlattenedEntries.get(file);
    if (db) {
      file = db;
    }
    value = file;
    update();
  }

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

  function stepUp() {
    let parts = value.split(".");
    parts.pop();
    value = parts.join(".");
    update();
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
        ops = get(ops);
      }
      ops = ops || [];
      options = [...ops, ...additionalItems].flat();
    }
    if (isRestricted) {
      options = options.filter((o) => !o.restricted);
    }
    // logger.info(type, label, spec, options, value);
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
    if (!vars || vars.length == 0) return;
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
    if (defaultValue) {
      if (value != defaultValue) {
        value = defaultValue;
      } else {
        value = "";
      }
      return;
    }
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
    } else if (spec?.control == "compare-int") {
      value = [];
    } else if (type == "string") {
      value = "";
    } else {
      // debugger;
    }
  }
  const groupBy = (a) => a.group;

  function convertFixed(e, key) {
    if (key && linked) {
      const v = value[key];
      for (const k of Object.keys(value)) {
        value[k] = v;
      }
    }
    value = { x: Number.parseFloat(value.x), y: Number.parseFloat(value.y) };
  }

  let colorOpen = false;

  function fixCP() {
    tick().then((_) => {
      document
        .querySelectorAll(".ui-modal-box .alpha-selector")
        .forEach((e) => (e.style.display = "none"));
      document
        .querySelectorAll(".ui-modal-box .color-info-box")
        .forEach((e) => (e.style.display = "none"));
      document
        .querySelectorAll(".ui-modal-box .main-container")
        .forEach((e) => (e.style.height = "unset"));
    });
  }
  fixCP();
  $: {
    if (type == "color" && value && typeof value !== "string") {
      value = "#" + value.toString(16);
    }
    fixCP();
  }

  async function pickPosition() {
    const controlled = [
      canvas.tiles.controlled,
      ...globalThis.canvas.tokens.controlled,
    ].flat();
    let t = await globalThis.warpgate.crosshairs.show({
      drawIcon: true,
      icon: "modules/director/icons/crosshair.png",
      label: `Pick position`,
      interval: 0,
      // interval: setting(SETTINGS.MANUAL_MODE),
    });
    t = { x: t.x, y: t.y };
    controlled.forEach((c) => c.control());
    value = t;
    update();
  }

  async function pickToken() {
    const controlled = [
      canvas.tiles.controlled,
      ...globalThis.canvas.tokens.controlled,
    ].flat();
    let data = await globalThis.warpgate.crosshairs.show({
      drawIcon: true,
      icon: "modules/director/icons/crosshair.png",
      label: `Pick Token`,
      interval: 0,
      // interval: setting(SETTINGS.MANUAL_MODE),
    });
    const tokens = canvas.tokens.placeables.filter(
      (t) =>
        t.x + t.w > data.x && t.y + t.h > data.y && t.x < data.x && t.y < data.y
    );
    controlled.forEach((c) => c.control());
    if (tokens.length != 0) {
      value = "#token:" + tokens[0].document.id;
      update();
    } else {
      ui.notifications.error("Token not found");
    }
  }

  // if (type == "token") {
  //   // debugger;
  //   value = "#id:" + value.id;
  // }
</script>

{#if type == "color"}
  <input
    type="checkbox"
    id="color-modal-{id}"
    class="ui-modal-toggle"
    on:click={(_) => (colorOpen = !colorOpen)}
  />
  <label
    for="color-modal-{id}"
    class="ui-modal ui-items-center"
    class:modal-open={colorOpen}
    style="pointer-events: all !important;"
  >
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
  class="arg-input ui-input-group ui-min-w-fit ui-justify-{justify} ui-input-group-{size}"
  class:ui-input-group-vertical={vertical}
  class:inline
  for=""
  class:!ui-w-auto={widthAuto}
  class:!ui-h-auto={heightAuto}
  id="{type}-{value}"
  data-id={id}
  data-type={type}
  {style}
>
  <slot name="left" />
  {#if label != ""}
    <span
      class="ui-flex ui-flex-row ui-items-center ui-gap-1"
      class:ui-italic={optional}
    >
      {#if icon}
        <Icon {icon} />
      {/if}
      {label}
    </span>
  {:else if icon}
    <Icon {icon} />
  {/if}
  {#if mode == "optional"}
    <div
      class="ui-flex ui-flex-row ui-items-center"
      style={!hideSign || label != ""
        ? "border: 1px solid hsl(var(--b3));"
        : ""}
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
        class="ui-btn ui-btn-square ui-border-none"
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
      <input type="number" bind:value class="ui-input" />
      {#if resettable && defaultValue !== undefined && value !== defaultValue}
        <IconButton
          icon="fluent:arrow-reset-20-filled"
          on:click={resetValue}
          type="primary"
        />
      {/if}
    {:else if type == "float"}
      <input
        type="number"
        bind:value
        step={step ?? 0.01}
        {min}
        {max}
        class="ui-input"
      />
      {#if resettable && defaultValue !== undefined && value !== defaultValue}
        <IconButton
          icon="fluent:arrow-reset-20-filled"
          on:click={resetValue}
          type="primary"
        />
      {/if}
    {:else if type == "effect_file"}
      <label
        class="ui-input-group"
        style={`--width: ${width}`}
        on:drop={handleDrop}
      >
        <Select
          isDisabled={disabled}
          items={spec.options(value)}
          value={value && value.split("/")[value.split("/").length - 1]}
          on:select={(e) => (value = e.detail.value)}
          on:clear={(_) => (value = "")}
          isCreatable={true}
          listAutoWidth={false}
          containerStyles="border-radius: 0px !important"
        />
        {#if value.split(".").length > 2}
          <button class="ui-btn ui-btn-square" on:click={stepUp}>
            <iconify-icon icon="charm:chevron-left" />
          </button>
        {/if}
        <button class="ui-btn ui-btn-square" on:click={selectFile}>
          <iconify-icon icon="fa6-solid:magnifying-glass" />
        </button>
      </label>
    {:else if type == "sound_file"}
      <label class="ui-input-group">
        <input
          type="text"
          value={value && value.split("/")[value.split("/").length - 1]}
          on:change={(e) => (value = e.detail)}
          class="ui-input"
        />
        <button class="ui-btn ui-btn-square" on:click={selectFile}>
          <iconify-icon icon="fa6-solid:magnifying-glass" />
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
        <RemoveButton on:click={resetValue} type="primary" />
      {:else if value && typeof value === "string" && value.startsWith("#id:")}
        <input
          type="text"
          value={value.slice(4)}
          on:change={changeId}
          class="ui-input"
          readonly={disabled}
        />
        <RemoveButton on:click={resetValue} type="primary" />
      {:else if value && typeof value === "string" && value.startsWith("#token:")}
        <div
          class="ui-flex ui-flex-row ui-items-center ui-gap-2 ui-p-2"
          style="border: 1px solid hsl(var(--b3))"
        >
          <img
            class="ui-h-6 ui-w-6 ui-border-none"
            src={canvas.tokens.get(value.slice(7))?.document.texture.src ??
              "icons/svg/mystery-man.svg"}
            alt=""
          />
          {canvas.tokens.get(value.slice(7))?.document.name ?? "Unknown token"}
        </div>
        <IconButton icon="mdi:target" title="Pick token" on:click={pickToken} />
        <RemoveButton on:click={resetValue} type="primary" />
      {:else if (typeof value === "object" && "x" in value && "y" in value) || type == "offset" || type == "size"}
        <input
          type="number"
          step={step ?? 1}
          {min}
          {max}
          bind:value={value.x}
          readonly={disabled}
          on:change={convertFixed}
          class="ui-input"
        />
        <input
          type="number"
          step={step ?? 1}
          {min}
          {max}
          readonly={disabled}
          bind:value={value.y}
          on:change={convertFixed}
          class="ui-input"
        />
        <IconButton
          icon="mdi:target"
          title="Pick position"
          on:click={pickPosition}
        />
        {#if !disabled}
          <RemoveButton on:click={resetValue} type="primary" />
        {/if}
      {:else if value instanceof TokenDocument}
        {value.id}
      {:else}
        <Select
          isDisabled={disabled}
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
    {:else if type == "offset" || type == "size" || type == "scale_xy"}
      <input
        bind:value={value.x}
        type="number"
        step={step ?? 0.01}
        {min}
        {max}
        on:change={(e) => convertFixed(e, "x")}
        class="ui-input ui-w-16"
      />
      <input
        type="number"
        step={step ?? 0.01}
        {min}
        {max}
        bind:value={value.y}
        on:change={(e) => convertFixed(e, "y")}
        class="ui-input ui-w-16"
      />
      {#if type == "scale_xy"}
        <IconButton
          type={linked ? "primary" : "outline"}
          icon={linked ? "jam:link" : "jam:unlink"}
          on:click={(_) => (linked = !linked)}
        />
      {/if}
      <!-- <RemoveButton on:click={resetValue} type="primary" /> -->
    {:else if type == "bool"}
      <div
        class="ui-flex ui-flex-row ui-items-center toggle-holder"
        style={!hideSign || label != ""
          ? "border: 1px solid hsl(var(--b3)); padding: 0.5rem"
          : ""}
      >
        <input
          type="checkbox"
          class="ui-toggle ui-toggle-accent"
          bind:checked={value}
          {disabled}
        />
      </div>

      {#if resettable && defaultValue !== undefined && value !== defaultValue}
        <IconButton
          icon="fluent:arrow-reset-20-filled"
          on:click={resetValue}
          type="primary"
        />
      {/if}
    {:else if type == "macro"}
      <Select
        isDisabled={disabled}
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
      <input type="text" bind:value class="ui-input" />
    {:else if type == "color"}
      <div
        class="ui-btn ui-btn-square"
        style:background-color={value}
        on:click={(_) => (colorOpen = !colorOpen)}
      />
      {#if !compact}
        <input type="text" bind:value class="ui-input" />
      {/if}
    {:else if type == "effectSource"}
      <Select
        isDisabled={disabled}
        items={options}
        value={options.find((o) => o.value[0] == value[0])}
        on:select={setEffectSource}
        listAutoWidth={false}
        isClearable={false}
      />
      {#if value[0] == "#origin"}
        <Select
          isDisabled={disabled}
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
          class="ui-input"
        />
      {/if}
    {:else if spec?.control == "select"}
      <Select
        items={options}
        {value}
        {groupBy}
        on:select={(e) => (value = e.detail.value)}
        on:clear={(_) => {
          value = "";
          dispatch("change", value);
        }}
        listAutoWidth={false}
        isDisabled={disabled}
      />
    {:else if spec?.control == "multiselect"}
      <div class:!ui-h-auto={heightAuto}>
        <Tags
          allowPaste={false}
          allowDrop={false}
          onlyUnique={true}
          {onlyAutocomplete}
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

      {#if resettable && defaultValue !== undefined && value !== defaultValue}
        <IconButton
          icon="fluent:arrow-reset-20-filled"
          on:click={resetValue}
          type="primary"
        />
      {/if}
    {:else if spec?.control == "compare-int"}
      <div class="ui-w-16 force-select-width">
        <Select
          isDisabled={disabled}
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
        class="ui-input"
      />
      {#if resettable && defaultValue !== undefined && value !== defaultValue}
        <IconButton
          icon="fluent:arrow-reset-20-filled"
          on:click={resetValue}
          type="primary"
        />
      {/if}
    {:else}
      <input
        type="text"
        bind:value
        class="ui-input"
        {disabled}
        class:ui-cursor-not-allowed={disabled}
      />
      {#if !disabled}
        {#if clearable}
          <RemoveButton on:click={resetValue} type="primary" />
        {/if}
        {#if resettable && defaultValue !== undefined && value !== defaultValue}
          <IconButton
            icon="fluent:arrow-reset-20-filled"
            on:click={resetValue}
            type="primary"
          />
        {/if}
      {/if}
    {/if}
  {:else}
    <button
      class="ui-btn ui-btn-square ui-m-0 ui-border-none"
      style="background-color: #aa66cc;"
      on:click={(e) => setMode(e, "direct")}
    >
      <iconify-icon icon="heroicons-solid:at-symbol" />
    </button>
    <Select
      isDisabled={disabled}
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
    <RemoveButton on:click={resetOptionalValue} type="primary" />
  {/if}
  <slot name="right" />
</label>

<style>
  input[type="checkbox"] {
    margin: 0;
    border-style: solid;
  }
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
  .toggle-holder {
    height: var(--control-height);
  }

  .alpha-selector,
  .color-info-box {
    display: none !important;
  }
</style>
