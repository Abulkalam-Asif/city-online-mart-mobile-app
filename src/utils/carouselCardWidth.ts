/**
 * Width of a product card in a sideways row (home sections, similar products).
 * About 37% of the screen, so two cards fit and a good part of the third shows at the edge,
 * which tells the customer the row scrolls. The 40% used before left only a sliver of it.
 */
export const getCarouselCardWidth = (screenWidth: number) =>
  Math.max(130, Math.min(200, screenWidth * 0.37));
