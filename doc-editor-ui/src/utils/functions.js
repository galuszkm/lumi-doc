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
