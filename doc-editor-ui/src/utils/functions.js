export function randomID(length) {
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

// Format number of bytes to string
export function formatSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  // Round the size to two decimal places
  const roundedSize = size.toFixed(2);

  // Remove unnecessary trailing zeros
  const formattedSize = parseFloat(roundedSize).toString();

  return `${formattedSize} ${sizes[i]}`;
}

export function getColorClass(value) {
  if (value <= 60) {
    return 'green';
  } else if (value <= 90) {
    return 'orange';
  } else {
    return 'red';
  }
};

const removeEmptyProps = (obj) => {
  return Object.entries(obj)
    .filter(([key, value]) => value !== undefined && (typeof value !== 'object' || Object.keys(value).length > 0))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const filterObjArray = (arr, skipKeys = []) => {
  return arr
    .map(obj => removeEmptyProps(obj, skipKeys))  // Remove empty and undefined properties from each object
    .filter(obj =>                                // Filter out objects that have nothing except skipped keys
      Object.keys(obj).some(key => !skipKeys.includes(key))
    );
};


// ====================================================================
// Unit converters

// Convert CSS value to mm
export const convertToMM = (value, baseFontSizePx = 16) => {
  const cmToMm = 10;
  const inchToMm = 25.4;
  const pxToInch = 1 / 96;
  const ptToInch = 1 / 72;
  const pcToInch = 1 / 6;

  if (typeof value === "number"){
    return value
  }
  const match = value.match(/^([0-9.]+)(cm|mm|in|px|pt|pc|rem|em)$/);
  if (!match) {
    return null;
  }
  const numericValue = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case "cm":
      return numericValue * cmToMm;
    case "mm":
      return numericValue;
    case "in":
      return numericValue * inchToMm;
    case "px":
      return numericValue * pxToInch * inchToMm;
    case "pt":
      return numericValue * ptToInch * inchToMm;
    case "pc":
      return numericValue * pcToInch * inchToMm;
    case "rem":
    case "em":
      const pxValue = numericValue * baseFontSizePx;
      return pxValue * pxToInch * inchToMm;
    default:
      return null;
  }
}

// Convert CSS value to pt
export const convertToPT = (value, baseFontSizePx = 16) => {
  const inchToPt = 72;
  const cmToInch = 1 / 2.54;
  const mmToInch = 1 / 25.4;
  const pxToInch = 1 / 96;
  const pcToInch = 1 / 6;

  if (typeof value === "number"){
    return value
  }
  const match = value.match(/^([0-9.]+)(cm|mm|in|px|pt|pc|rem|em)$/);
  if (!match) {
    return null;
  }

  const numericValue = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case "cm":
      return numericValue * cmToInch * inchToPt;
    case "mm":
      return numericValue * mmToInch * inchToPt;
    case "in":
      return numericValue * inchToPt;
    case "px":
      return numericValue * pxToInch * inchToPt;
    case "pt":
      return numericValue;
    case "pc":
      return numericValue * pcToInch * inchToPt;
    case "rem":
    case "em":
      const pxValue = numericValue * baseFontSizePx;
      return pxValue * pxToInch * inchToPt;
    default:
      return null;
  }
}

// Convert CSS value to px
export const convertToPX = (value, baseFontSizePx = 16) => {
  const inchToPx = 96;
  const cmToInch = 1 / 2.54;
  const mmToInch = 1 / 25.4;
  const ptToInch = 1 / 72;
  const pcToInch = 1 / 6;

  if (typeof value === "number"){
    return value
  }
  const match = value.match(/^([0-9.]+)(cm|mm|in|px|pt|pc|rem|em)$/);
  if (!match) {
    return null;
  }

  const numericValue = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case "cm":
      return numericValue * cmToInch * inchToPx;
    case "mm":
      return numericValue * mmToInch * inchToPx;
    case "in":
      return numericValue * inchToPx;
    case "px":
      return numericValue;
    case "pt":
      return numericValue * ptToInch * inchToPx;
    case "pc":
      return numericValue * pcToInch * inchToPx;
    case "rem":
    case "em":
      return numericValue * baseFontSizePx;
    default:
      return null;
  }
}