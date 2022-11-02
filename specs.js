import { getIconNames } from "./helpers.js"
export let iconCollection = "game-icons";
export function setIconCollection(ic) {
  iconCollection = ic;
}

export const argSpecs = [
  {
    id: "position", options: [
      { value: "#controlled.first", label: "First Controlled", group: "Controlled" },
      { value: "#controlled.last", label: "Last Controlled", group: "Controlled" },
      { value: "#target.first", label: "First Target", group: "Targets" },
      { value: "#target.last", label: "Last Target", group: "Targets" },
      { value: "#manual", label: "Manual", group: "Other", lazy: true },
      { value: { x: 0, y: 0 }, label: "Fixed", group: "Other" },
      { value: [], label: "Tagger", group: "Other" },
    ], var_types: ["position", "token", "tile", "expression"], default: { x: 0, y: 0 }
  },
  {
    id: "offset", var_types: ["offset", "size", "position", "expression"], default: { x: 0, y: 0 }
  },
  {
    id: "size", var_types: ["offset", "size", "position", "expression"], default: { x: 0, y: 0 }
  },
  {
    id: "scale_xy", var_types: ["offset", "size", "position", "expression"], default: { x: 1, y: 1 }
  },
  {
    id: "placeable", options: [
      { value: "#id:", label: "Id or Name" },
    ], var_types: ["placeable", "token", "tile", "expression"]
  },
  {
    id: "token", options: [
      { value: "#controlled.first", label: "First Controlled" },
      { value: "#controlled.last", label: "Last Controlled" },
      { value: "#target.first", label: "First Target" },
      { value: "#target.last", label: "Last Target" },
      { value: [], label: "Tagger" },
      { value: "#id:", label: "Id or Name" },
    ], var_types: ["token", "expression"]
  },
  {
    id: "tile", options: [
      { value: "#controlled.first", label: "First Controlled" },
      { value: "#controlled.last", label: "Last Controlled" },
      { value: [], label: "Tagger" },
      { value: "#id:", label: "Id or Name" },
    ], var_types: ["tile", "expression"]
  },
  {
    id: "targets", options: [
      { value: "", label: "No target", group: "General" },
      { value: "#controlled.all", label: "All Controlled", group: "Controlled" },
      { value: "#controlled.random", label: "Random Controlled", group: "Controlled" },
      { value: "#controlled.first", label: "First Controlled", group: "Controlled" },
      { value: "#controlled.last", label: "Last Controlled", group: "Controlled" },
      { value: "#target.all", label: "All Targets", group: "Targets" },
      { value: "#target.random", label: "Random Target", group: "Targets" },
      { value: "#target.first", label: "First Target", group: "Targets" },
      { value: "#target.last", label: "Last Target", group: "Targets" },
      { value: "#id:", label: "Id or Name", group: "Other" },
      { value: "#tokens.all", label: "All Tokens", group: "Other" },
      { value: "#tiles.all", label: "All Tiles", group: "Other" },
      { value: [], label: "Tagger", group: "Other" },
    ], var_types: ["targets"]
  },
  {
    id: "bool", var_types: ["bool", "expression"], default: false,
  },
  // {
  //   id: "effect_file", var_types: ["effect_file", "expression"], options: (value) => {

  //     let files = [];
  //     try {
  //       if (value && value.startsWith("jb2a")) {
  //         files = globalThis.Sequencer.Database.getPathsUnder(value).map((o) => value + "." + o);
  //       } else {
  //         if (!value || (value && value.indexOf("/") == -1)) {
  //           try {
  //             files = globalThis.Sequencer.Database.getPathsUnder("jb2a").map((o) => "jb2a." + o);
  //           } catch (error) {
  //             files = [];
  //           }
  //         }
  //       }
  //     } catch (e) {
  //       //filepath
  //     }
  //     return files;
  //   }
  // },
  { id: "sound_file", var_types: ["sound_file", "expression"] },
  { id: "int", var_types: ["int", "expression"], default: 0 },
  { id: "float", var_types: ["float", "int", "expression"], default: 0 },
  { id: "macro", var_types: ["macro", "string", "expression"] },
  { id: "string", var_types: ["string", "expression"] },
  { id: "color", var_types: ["string", "color", "expression"], default: "#ffffff" },
  { id: "code", var_types: ["code", "string", "expression"] },
  { id: "expression", var_types: ["expression"] },
  {
    id: "sequence", var_types: ["sequence"], options: (_) => {
      return Director.listSequences().map(s => { return { value: s.id, label: s.title } });
    }
    , control: "select"
  },
  {
    id: "animate-target", var_types: ["animate-target"], options: [
      { value: "sprite", label: "sprite" },
      { value: "alphaFilter", label: "alphaFilter" },
      { value: "spriteContainer", label: "spriteContainer" },
    ]
    , control: "select"
  },

  {
    id: "animate-property", var_types: ["animate-property"], options: (_, modifier) => {
      return {
        "sprite": [
          { value: "position.x", label: "position.x" },
          { value: "position.y", label: "position.y" },
          { value: "rotation", label: "rotation" },
          { value: "angle", label: "angle" },
          { value: "scale.x", label: "scale.x" },
          { value: "scale.y", label: "scale.y" },
          { value: "width", label: "width" },
          { value: "height", label: "height" },
        ],
        "alphaFilter": [
          { value: "alpha", label: "alpha" },
        ],
        "spriteContainer": [
          { value: "position.x", label: "position.x" },
          { value: "position.y", label: "position.y" },
          { value: "rotation", label: "rotation" },
          { value: "angle", label: "angle" },
          { value: "scale.x", label: "scale.x" },
          { value: "scale.y", label: "scale.y" },
          { value: "width", label: "width" },
          { value: "height", label: "height" },
        ]
      }[modifier.args[0] || "sprite"];
    }, default: "position.x"
    , control: "select"
  },

  {
    id: "multiply-mode", var_types: ["multiply-mode"], options: [
      { value: "atLocation", label: "atLocation" },
      { value: "attachTo", label: "attachTo" },
      { value: "stretchTo", label: "stretchTo" },
    ], control: "select", default: "atLocation"
  },

  {
    id: "edge", var_types: ["edge", "string", "expression"], options: [
      { value: "on", label: "on" },
      { value: "inner", label: "inner" },
      { value: "outer", label: "outer" },
    ], control: "select", default: "on"
  },

  {
    id: "align", var_types: ["align", "string", "expression"], options: [
      { value: "center", label: "center" },
      { value: "top-left", label: "top-left" },
      { value: "top", label: "top" },
      { value: "top-right", label: "top-right" },
      { value: "left", label: "left" },
      { value: "right", label: "right" },
      { value: "bottom-left", label: "bottom-left" },
      { value: "bottom", label: "bottom" },
      { value: "bottom-right", label: "bottom-right" },
    ], control: "select", default: "center"
  },

  // {
  //   id: "sequence-vars", var_types: ["sequence-vars"], options: (_, extra) => {
  //     const seqId = extra.args[0];
  //     if (!seqId) return [];
  //     const seq = Director.findSequence(seqId);
  //     if (!seq) return [];
  //     let vars = seq.variables.map(v => { return { value: v.name, label: v.name } });
  //     vars = [{ value: "_", label: "None" }, ...vars];
  //     return vars;
  //   }, control: "select"
  // },
  // {
  //   id: "hook", var_types: ["hook"], options: (_) => {
  //     return hookSpecs.map((hook) => {
  //       return { "value": hook.id, "label": hook.name };
  //     });
  //   }, control: "select"
  // },
  // {
  //   id: "action-type", var_types: ["action-type"], options: (_) => {
  //     return actionTypes.map((type) => {
  //       return { "value": type.id, "label": type.label, group: type.group };
  //     });
  //   }, control: "select"
  // },
  {
    id: "icon", var_types: ["icon", "string", "expression"], options: async (_) => {
      // const iconCollection = setting(SETTINGS.ICON_COLLECTION);
      return (await getIconNames(iconCollection)).map((icon) => {
        return { "value": `${iconCollection}:${icon}`, "label": icon }; // TODO: add categories
      });
    }, control: "select"
  },
  {
    id: "effectSource", var_types: ["effect"], options: [
      { value: ["#sceneId"], label: "All on the scene" },
      { value: ["#origin"], label: "From sequence" },
      { value: ["#name"], label: "By name" },
      { value: ["#object"], label: "By object" },
      { value: ["#target"], label: "By target" },
      { value: ["#source"], label: "By source" },
    ]
  },
  {
    id: "ease", var_types: ["ease", "expression"], options: [
      { value: "linear", label: "linear" },
      { value: "easeInSine", label: "InSine" },
      { value: "easeOutSine", label: "OutSine" },
      { value: "easeInOutSine", label: "InOutSine" },
      { value: "easeInQuad", label: "InQuad" },
      { value: "easeOutQuad", label: "OutQuad" },
      { value: "easeInOutQuad", label: "InOutQuad" },
      { value: "easeInCubic", label: "InCubic" },
      { value: "easeOutCubic", label: "OutCubic" },
      { value: "easeInOutCubic", label: "InOutCubic" },
      { value: "easeInQuart", label: "InQuart" },
      { value: "easeOutQuart", label: "OutQuart" },
      { value: "easeInOutQuart", label: "InOutQuart" },
      { value: "easeInQuint", label: "InQuint" },
      { value: "easeOutQuint", label: "OutQuint" },
      { value: "easeInOutQuint", label: "InOutQuint" },
      { value: "easeInExpo", label: "InExpo" },
      { value: "easeOutExpo", label: "OutExpo" },
      { value: "easeInOutExpo", label: "InOutExpo" },
      { value: "easeInCirc", label: "InCirc" },
      { value: "easeOutCirc", label: "OutCirc" },
      { value: "easeInOutCirc", label: "InOutCirc" },
      { value: "easeInBack", label: "InBack" },
      { value: "easeOutBack", label: "OutBack" },
      { value: "easeInOutBack", label: "InOutBack" },
      { value: "easeInElastic", label: "InElastic" },
      { value: "easeOutElastic", label: "OutElastic" },
      { value: "easeInOutElastic", label: "InOutElastic" },
      { value: "easeInBounce", label: "InBounce" },
      { value: "easeOutBounce", label: "OutBounce" },
      { value: "easeInOutBounce", label: "InOutBounce" },
    ], default: "linear"
  }
];

