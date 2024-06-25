import { itemIconAndClass, nestableItemTypes, nestingRules } from "./document";

// ==========================================
// Parsing items

export const item2Node = (item) => {
  const node = {
    key: item.id,
    label: getNodeLabel(item),
    type: item.type,
    props: removeKeysFromItem(item),
    className: ''  // Ensure className is initialized
  };

  const typeConfig = itemIconAndClass[item.type];
  if (typeConfig) {
    node.icon = typeConfig.icon;
    node.className = typeConfig.className;
  }

  // Recursively parse children items
  if (item.items) {
    node.children = item.items.map(i => item2Node(i));
  }

  return node;
};

export const getNodeLabel = (item) => {
  return item.title
    ? truncateString(item.title, 40)
    : item.text
    ? truncateString(getVisibleTextFromHTML(item.text), 40)
    : parseItemType(item.type);
}

/**
 * Truncate a string to a specified length and append an ellipsis if necessary.
 * @param {string} str - The input string.
 * @param {number} maxLength - The maximum length of the string before truncation.
 * @returns {string} - The truncated string with an ellipsis if it exceeds the maxLength.
 */
function truncateString(str, maxLength) {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 3) + '...';
  }
  return str;
}

/**
 * Extracts the visible text from an HTML string.
 *
 * @param {string} htmlString - The HTML string to parse and extract text from.
 * @return {string} The visible text content.
 */
function getVisibleTextFromHTML(htmlString) {
  // Create a new DOM parser
  const parser = new DOMParser();
  
  // Parse the HTML string into a Document
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  // Extract and return the text content of the body
  return doc.body.textContent || '';
}

function removeKeysFromItem(obj) {
  const keysToRemove = ['items'];
  return Object.keys(obj).reduce((acc, key) => {
      if (!keysToRemove.includes(key)) {
          acc[key] = obj[key];
      }
      return acc;
  }, {});
};

export function node2Item(node){
  const item = {...node.props};
  if (node.children){
    item.items = node.children.map(n => node2Item(n));
  }
  return item
};

export function parseItemType(type){
  return type.replace("Object", "").replace("GridColumn", "Column")
}

// ==========================================
// Drag and Drop items

export function drop_allowed(item, parent){
  // Check if item was moved to the top level - only sections allowed
  if (parent == null) {
    if (item.type === "SectionObject"){
      return { status: true };
    } else {
      return { status: false, detail: "Only Sections are allowed on the top level" };
    }
  }
  // Check if parent is nestable
  if (nestableItemTypes.includes(parent.type) && nestingRules[parent.type].includes(item.type)){
    return { status: true }
  } else {
    return { 
      status: false, 
      detail: `Cannot drop ${parseItemType(item.type)} on ${parseItemType(parent.type)}` 
    };
  }
}
