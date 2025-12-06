export function parseToggleVariant(variant) {
  const parts = variant.split('-');
  return {
    position: parts[0], // 'left' or 'right'
    style: parts[1], // 'filled' or 'outlined'
  };
}
