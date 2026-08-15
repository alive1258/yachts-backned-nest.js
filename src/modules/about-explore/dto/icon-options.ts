/**
 * Allowed icon keys for an About Explore card — kept in sync with the
 * lucide-react components rendered by the icon map on the frontend
 * (frontend/src/utils/aboutExploreIcons.tsx).
 */
export const ABOUT_EXPLORE_ICONS = [
  'Building2',
  'Leaf',
  'Users',
  'Handshake',
  'Newspaper',
  'Compass',
  'ShieldCheck',
  'Anchor',
  'Globe',
  'Award',
  'MapPin',
  'Star',
] as const;

export type AboutExploreIcon = (typeof ABOUT_EXPLORE_ICONS)[number];
