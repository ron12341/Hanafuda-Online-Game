const getCardSize = () => {
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  if (width <= 600) return "small";
  return "medium";
};

const getHandCardSize = handCardCount => {
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  // Only use xsmall when necessary on mobile with many cards
  if (width <= 480 && handCardCount > 5) {
    return "xsmall";
  }
  // Use normal card size logic otherwise
  if (width <= 480) return "small";
  if (width <= 600) return "small";
  return "medium";
};

export { getCardSize, getHandCardSize };
