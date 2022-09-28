import consola from 'consola/src/browser'
import { v4 as uuidv4 } from "uuid";
import { sort } from 'fast-sort';
import { compileExpression } from "filtrex";

let moduleId, infoColor, SETTINGS;

function findString(item, str) {
  let res = false;
  if (str == str.toLowerCase()) {
    res = item.name.toLowerCase().match(str)
  } else {
    res = item.name.match(str)
  }
  res = !!res;
  if (!res) {
    if (item.flags && "tagger" in item.flags) {
      res = item.flags["tagger"]?.tags?.includes(str)
    }
  }
  return res;

}

function onScene(item) {
  return (canvas.scene.tokens.contents.filter((t) => t.actor?.id == item._id) || []).length > 0;
}

export function updateFields(_fields, filter, extraInfo) {
  let fields = [..._fields];
  if (extraInfo) {
    fields.push(...(extraInfo?.index || []));
  }
  let si = [];
  si = filter.sort?.map((s) => s.index)?.flat() || [];
  fields.push(...si);
  si = filter.show?.map((s) => s.index)?.flat() || [];
  fields.push(...si);
  si = filter.filters?.map((s) => s.index)?.flat() || [];
  fields.push(...si);
  if (game.version >= 10) {
    fields = fields.map(f => f.replace("data", "system"));
  }
  return fields;
}

export function hasFlag(obj, flag) {
  if (game.version < 10) {
    if (!obj?.data?.flags) return false;
    return flag in obj.data.flags;
  } else {
    if (!obj?.flags) return false;
    return flag in obj.flags;
  }
}

export function getFlag(obj, flag) {
  const f = flag.split(".");
  if (!obj) return null;
  let doc = obj;
  if (game.version < 10 && !("flags" in doc)) {
    doc = obj.data;
  }
  if (!obj) return null;
  if (doc && "flags" in doc) {
    let result = doc.flags[f[0]];
    for (const k of f.slice(1)) {
      if (!result) return result;
      result = result[k];
    }
    return result;
  }
  return null
}

export function setFlag(obj, flag, value) {
  const updates = {};
  updates[`flags.${flag}`] = value;
  return obj.update(updates);
}

export function toggleFlag(obj, flag) {
  if (getFlag(obj, flag)) {
    return setFlag(obj, flag, false)
  } else {
    return setFlag(obj, flag, true)
  }
}

const extraFunctions = {
  getProperty,
  lower: (s) => s.toLowerCase(),
  float: (s) => parseFloat(s || 0),
  int: (s) => parseInt(s || 0),
  findString,
  onScene,
  getFlag,
};
const globalAliases = {
  "@onScene": "onScene(@item)",
  "@fav": 'getFlag(@item, "alpha-suit.fav")',
}

export let logger = consola.withTag(moduleId);
export default function initHelpers(mid, color, settings) {
  moduleId = mid;
  logger = consola.withTag(moduleId);
  infoColor = color;
  SETTINGS = settings;
  logger._reporters[0].levelColorMap[3] = infoColor;
}

export let setting = (key, val) => {
  if (!val) return game.settings.get(moduleId, key);
  else game.settings.set(moduleId, key, val);
};

export function rgb2hex({ r, g, b, a = 1 }) {
  return {
    hex:
      "#" + [r, g, b, Math.round(a * 255) | 0].reduce((acc, v) => `${acc}${v.toString(16).padStart(2, "0")}`, ""),
  };
}

export function contrastColor(color) {
  if (!color || color == "") return "#eeeeeeff";
  const pRed = 0.299;
  const pGreen = 0.587;
  const pBlue = 0.114;
  const rgb = foundry.utils.hexToRGB(parseInt(color.slice(1).substring(0, 6), 16));

  const contrast = Math.sqrt(pRed * rgb[0] ** 2 + pGreen * rgb[1] ** 2 + pBlue * rgb[2] ** 2);
  return contrast > 0.5 ? "#232323ff" : "#eeeeeeff";
}

export function getControlledTiles() {
  if (game.version < 10) {
    return canvas.background.controlled;
  } else {
    return canvas.tiles.controlled;
  }
}


// import { icons as giIcons } from "@iconify-json/gi";
// import { addCollection } from 'iconify-icon';
// addCollection(giIcons);
// let _cachedIcons = { gi: Object.keys(giIcons.icons) };
let _cachedIcons = {};
export async function getIconNames(collection) {
  if (_cachedIcons[collection]) return _cachedIcons[collection];
  const url = `https://api.iconify.design/collection?prefix=${collection}`
  const res = await fetch(url).then(r => r.json());
  _cachedIcons[collection] = [...res.uncategorized];
  for (const [_, i] of Object.entries(res.categories)) {
    _cachedIcons[collection].push(...i);
  }
  return _cachedIcons[collection];

}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function tintImage(src, tint) {
  tint = _getRGBAArray(tint);

  return new Promise((resolve, reject) => {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    let image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      let imgData = context.getImageData(0, 0, canvas.width, canvas.height);
      let data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 0] || data[i + 1] || data[i + 2] || data[i + 3]) {
          data[i + 0] = tint[0];
          data[i + 1] = tint[1];
          data[i + 2] = tint[2];
          data[i + 3] = tint[3];
        }
      }
      context.putImageData(imgData, 0, 0);
      resolve({ url: canvas.toDataURL(), width: image.width, height: image.height });
    };
    image.onerror = error => reject(src, error);
    image.src = src;

  });
}

function _getRGBAArray(color) {
  // Check input as rgba/rgb color
  let m = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/.exec(color);
  if (m) {
    if (m[4]) return [m[1], m[2], m[3], m[4] * 255];
    return [m[1], m[2], m[3], 255];
  }

  // Check input as hex 6-digit color
  m = /^#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/.exec(color);
  if (m) {
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16), 255];
  }
}

export let thumbs = {};
export async function updateThumb(obj) {
  const img = obj.texture?.src || obj.document?.texture?.src || obj.data.img;
  if (!(img in thumbs)) {
    const thumb = await ImageHelper.createThumbnail(img, {
      width: setting(SETTINGS.RESOLUTION),
      height: setting(SETTINGS.RESOLUTION),
    });
    thumbs[img] = thumb.thumb;
  }
}

export function pageContent(content, currentPage, pageSize) {
  return content.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize);
}

export function createSort(aliases, field, dir, id) {
  let _field = field;
  aliases = { ...aliases, ...globalAliases };
  _field = _field.replaceAll(fieldRegex, (f) => aliases[f] || f);
  const index = Array.from(_field.matchAll(fieldRegex))?.map((match) => match[2]) || [];
  return { field, dir, id: id || uuidv4(), index };
}

export function createShow(aliases, field) {
  let _field = field;
  aliases = { ...aliases, ...globalAliases };
  _field = _field.replaceAll(fieldRegex, (f) => aliases[f] || f);
  const index = Array.from(_field.matchAll(fieldRegex))?.map((match) => match[2]) || [];
  return { field, index };
}

export function createFilter(aliases, field, id) {
  let _field = field;
  aliases = { ...aliases, ...globalAliases };
  _field = _field.replaceAll(fieldRegex, (f) => aliases[f] || f);
  const index = Array.from(_field.matchAll(fieldRegex))?.map((match) => match[2]) || [];
  return { field, index, id };
}

export function showGetter(aliases, show) {
  return createGetter(aliases, show.field);
}

export function createGetter(aliases, field, processed = false) {
  const _f = field;
  let getterText = field;
  if (!processed) {
    getterText = preprocess(field, aliases);
  }
  logger.info(`${_f} => ${getterText}`);
  let getter = getterCache[getterText];
  if (!getter) {
    const ef = { ...extraFunctions, ...aliases }
    const expr = compileExpression(getterText, { extraFunctions: ef });
    getter = (item) => {
      // debugger;
      return expr({ item, aliases });
    }
    getterCache[getterText] = getter;
  }
  return getter;
}

const getterCache = {};
export function sortContent(content, filter, aliases = {}) {
  let sorting = filter.sort;
  let spec = [];
  if (!sorting || sorting?.length == 0) {
    spec.push({ asc: (item) => getProperty(item, "name") })
  } else {
    for (const s of sorting) {
      const getter = createGetter(aliases, s.field);
      const sorter = {};
      sorter[s.dir] = getter;
      spec.push(sorter);
    }
  }
  content = sort(content).by(spec);
  return content;
}

function preprocess(field, aliases) {
  aliases = { ...aliases, ...globalAliases };
  field = field.replaceAll(fieldRegex, (f) => aliases[f] || f);
  if (game.version >= 10) {
    field = field.replaceAll("data", `system`);
  }
  if (field.match(fieldRegex)) {
    field = field.replaceAll("@item", `item`);
    return field.replaceAll(fieldRegex, `getProperty(item, "$2")`);
  } else {
    return `findString(item, "${field}")`;
  }
}

export function hasExpression(str) {
  return str.match(fieldRegex);
}

export const fieldRegex = new RegExp(/(@([\w.]+))/g);
export function filterItemPredicate(item, filter, aliases) {
  let query = "";
  if ((!filter.filters || filter.filters.length == 0) && (!filter.persist_filters || filter.persist_filters.length == 0)) return true;
  const key = filter?.filters?.map(f => f.field).join(" ");
  if (key && getterCache[key]) {
    return getterCache[key](item);
  }

  query = filter.filters?.map(f => preprocess(f.field, aliases)).join(" and ");
  query = query ?? "";
  if (filter.persist_filters?.length > 0) {
    if (query != "") {
      query += " and ";
    }
    query += filter.persist_filters.map(f => preprocess(f.field, aliases)).join(" and ");
  }
  try {
    const filter = createGetter(aliases, query, true);
    const res = filter(item);
    if (res !== true) {
      // logger.info(item, expr, res);
    }
    return res === true;
  } catch (error) {
    return false;
  }
}

function createControlButton(data) {
  const btn = document.createElement("li");
  btn.className = "scene-control";
  if (data.toggle) {
    btn.classList.add("toggle");
  }
  btn.style = "display: flex; align-items: center; justify-content: center";
  btn.dataset.control = data.name;
  btn.title = data.title;
  btn.innerHTML = `<iconify-icon icon=${data.icon} style="font-size: 120%" />`;
  return btn;
}

export function addTools(data) {
  setTimeout(() => {
    const controls = document.querySelector("#controls");
    const col = document.querySelector(".main-controls");
    const btn = createControlButton(data);
    col.appendChild(btn);
    const sub = document.createElement("ol");
    sub.className = "sub-controls app control-tools flexcol sub-controls-" + data.name;
    for (const tool of data.tools) {
      const toolBtn = createControlButton(tool);
      toolBtn.addEventListener("click", async (e) => {
        await tool.onClick(e);
        if (tool.isActive) {
          if (tool.isActive()) {
            toolBtn.classList.add("active");
          } else {
            toolBtn.classList.remove("active");
          }
        }
      });
      toolBtn.dataset.tool = tool.name;
      sub.appendChild(toolBtn);
    }
    controls.appendChild(sub);
    btn.addEventListener("click", (e) => {
      const subcontrols = document.querySelectorAll(".sub-controls");
      document.querySelectorAll(".scene-control").forEach(e => e.classList.remove("active"));
      subcontrols.forEach(e => e.classList.remove("active"));
      document.querySelector(".sub-controls-" + data.name).classList.add("active");
      if (game.version < 10) {
        ui.controls.activeControl = data.name;
      } else {
        ui.controls._onClickLayer(e);
      }
      btn.classList.add("active");
      for (const tool of data.tools) {
        const toolBtn = document.querySelector(`[data-control="${tool.name}"]`);
        if (tool.isActive) {
          if (tool.isActive()) {
            toolBtn.classList.add("active");
          } else {
            toolBtn.classList.remove("active");
          }
        }
      }
      Object.keys(Canvas.layers).forEach(
        l => {
          try {
            return (typeof canvas[l]?.deactivate == "function") && canvas[l]?.deactivate();
          } catch (error) {

          }
        }
      );
    })
  }, 0);

}

export function toggleFilter(filter, field, id, aliases = {}) {
  filter.update(f => {
    f.filters = f.filters || [];
    if (f.filters.find(f => f.id == id)) {
      f.filters = f.filters.filter(f => f.id != id);
    } else {
      f.filters.push(createFilter(aliases, field, id))
    }
    return f;
  })
}

export function addFilter(filter, field, id, aliases = {}) {
  filter.update(f => {
    f.filters = f.filters || [];
    f.filters = f.filters.filter(f => f.id != id);
    f.filters.push(createFilter(aliases, field, id))
    return f;
  })
}
