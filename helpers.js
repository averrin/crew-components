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

const extraFunctions = { getProperty, lower: (s) => s.toLowerCase(), float: (s) => parseFloat(s || 0), int: (s) => parseInt(s || 0), findString };

export let logger = consola.withTag(moduleId);
export default function initHelpers(mid, color, settings) {
  moduleId = mid;
  logger = consola.withTag(moduleId);
  infoColor = color;
  SETTINGS = settings;
  logger._reporters[0].levelColorMap[3] = infoColor;
}

export let setting = key => {
  return game.settings.get(moduleId, key);
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

export function hasFlag(obj, flag) {
  if (game.version < 10) {
    return flag in obj.data.flags;
  } else {
    return flag in obj.flags;
  }
}

export function getFlag(obj, flag) {
  let doc = obj;
  if (game.version < 10) {
    doc = obj.data;
  }
  if (doc && "flags" in doc) {
    return doc.flags[flag];
  }
  return null
}

export function setFlag(obj, flag, value) {
  const updates = {};
  updates[`flags.${flag}`] = value;
  return obj.update(updates);
}

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
  _field = _field.replaceAll(fieldRegex, (f) => aliases[f] || f);
  const index = Array.from(_field.matchAll(fieldRegex))?.map((match) => match[2]) || [];
  return { field, dir, id: id || uuidv4(), index };
}

export function createShow(aliases, field) {
  let _field = field;
  _field = _field.replaceAll(fieldRegex, (f) => aliases[f] || f);
  const index = Array.from(_field.matchAll(fieldRegex))?.map((match) => match[2]) || [];
  return { field, index };
}

export function createFilter(aliases, field, id) {
  let _field = field;
  _field = _field.replaceAll(fieldRegex, (f) => aliases[f] || f);
  const index = Array.from(_field.matchAll(fieldRegex))?.map((match) => match[2]) || [];
  return { field, index, id };
}

export function showGetter(aliases, show) {
  return createGetter(aliases, show.field);
}

export function createGetter(aliases, field) {
  const _f = field;
  field = field.replaceAll(fieldRegex, (f) => aliases[f] || f);
  const getterText = preprocess(field);
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

function preprocess(str) {
  if (str.match(fieldRegex)) {
    str = str.replaceAll("@item", `item`);
    return str.replaceAll(fieldRegex, `getProperty(item, "$2")`);
  } else {
    return `findString(item, "${str}")`;
  }
}

export function hasExpression(str) {
  return str.match(fieldRegex);
}

export const fieldRegex = new RegExp(/(@([\w.]+))/g);
export function filterItemPredicate(item, filter, aliases) {
  let query = "";
  // let qtags = [];
  // let mode = "tag";
  if (!filter.filters || filter.filters.length == 0) return true;
  const key = filter.filters.map(f => f.field).join(" ");
  if (getterCache[key]) {
    return getterCache[key](item);
  }
  // tags
  //   .forEach(tag => {
  //     if (["and", "or"].includes(tag)) {
  //       mode = "tag";
  //       qtags.push(tag);
  //       return;
  //     }
  //     if (mode == "between") {
  //       qtags.push("and");
  //     }
  //     if (hasExpression(tag)) {
  //       qtags.push(tag);
  //     } else {
  //       qtags.push(`lower(@name) ~= lower("${tag}")`);
  //     }
  //     mode = "between";
  //   });
  // query = qtags.join(" ");

  query = filter.filters.map(f => f.field).join(" and ");
  try {
    const filter = createGetter(aliases, query);
    const res = filter(item);
    if (res !== true) {
      // logger.info(item, expr, res);
    }
    return res === true;
  } catch (error) {
    return false;
  }
  // ?.every((tag) => {
  //   if (!item) return false;
  //   const expr = preprocess(tag);
  // });
}

function createControlButton(data) {
  const btn = document.createElement("li");
  btn.className = "scene-control";
  btn.style = "display: flex; align-items: center; justify-content: center";
  btn.dataset.control = data.name;
  btn.title = data.title;
  btn.innerHTML = `<iconify-icon icon=${data.icon} style="font-size: 2rem" />`;
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
      toolBtn.addEventListener("click", tool.onClick);
      toolBtn.dataset.tool = tool.name;
      sub.appendChild(toolBtn);
    }
    controls.appendChild(sub);
    btn.addEventListener("click", () => {
      const subcontrols = document.querySelectorAll(".sub-controls");
      document.querySelectorAll(".scene-control").forEach(e => e.classList.remove("active"));
      subcontrols.forEach(e => e.classList.remove("active"));
      document.querySelector(".sub-controls-" + data.name).classList.add("active");
      ui.controls.activeControl = data.name;
      btn.classList.add("active");
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
