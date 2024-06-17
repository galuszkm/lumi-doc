import { sendClickedItemID } from "./communicate";

export const randomID = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export const getElem = (id) => {
  return document.getElementById(id);
}

export const handleItemClick = (id, type) => {
  sendClickedItemID(id);
}

const isObject = (item) => {
  return item && typeof item === "object" && !Array.isArray(item);
}

export const mergeDeep = (target, source) => {
  const merged = Array.isArray(target) ? [] : {};

  if (isObject(target) && isObject(source)) {
    // Copy properties from the target to merged
    for (const key in target) {
      if (target.hasOwnProperty(key)) {
        if (isObject(target[key])) {
          merged[key] = mergeDeep(target[key], {});
        } else {
          merged[key] = target[key];
        }
      }
    }

    // Copy properties from the source to merged
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (isObject(source[key])) {
          merged[key] = mergeDeep(target[key], source[key]);
        } else if (Array.isArray(source[key])) {
          merged[key] = source[key]; // Overwrite arrays from source
        } else {
          merged[key] = source[key];
        }
      }
    }
  }

  return merged;
}

export const scrollToItem = (id) => {
  const e = document.getElementById(id);
  e.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  e.classList.add('highlighted');
  setTimeout(() => e.classList.remove('highlighted'), 500);
};

export const isValidHtml = (content) => {
  const doc = new DOMParser().parseFromString(content, 'text/html');
  // Check if the body contains element nodes (valid HTML tags)
  const isValid = Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  return isValid;
};
