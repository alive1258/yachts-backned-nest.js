/**
 * Allowed icon keys for a Portfolio card — kept in sync with the
 * lucide-react components rendered by the icon map on the frontend
 * (frontend/src/utils/portfolioIcons.tsx).
 */
export const PORTFOLIO_ICONS = [
  'Users2',
  'PartyPopper',
  'Sailboat',
  'Gem',
  'Anchor',
  'Ship',
  'Compass',
  'Waves',
  'Star',
  'Heart',
  'Briefcase',
  'Camera',
] as const;

export type PortfolioIcon = (typeof PORTFOLIO_ICONS)[number];
