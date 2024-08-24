export const generateId = () => {
  /* Generate a random number between 0 and 10000 */
  return Math.floor(Math.random() * 10001);
};

export const formatNumber = (value: number): string => {
  const thousand = 1000;
  const million = thousand * 1000;
  const billion = million * 1000;
  if (value < thousand) {
    return value.toString();
  } else if (value < million) {
    const formattedVal = (value / thousand).toFixed(1);
    return `${formattedVal}K`;
  } else if (value < billion) {
    const formattedVal = (value / million).toFixed(1);
    return `${formattedVal}M`;
  } else {
    const formattedVal = (value / billion).toFixed(1);
    return `${formattedVal}B`;
  }
};
