/**
 * Allowed icon keys for a Sustainability Pillar card — kept in sync with the
 * lucide-react components rendered by the icon map on the frontend
 * (frontend/src/utils/sustainabilityPillarIcons.tsx).
 */
export const SUSTAINABILITY_PILLAR_ICONS = [
  'BatteryCharging',
  'Fish',
  'Recycle',
  'Sprout',
  'Leaf',
  'Droplets',
  'Zap',
  'Waves',
  'Sun',
  'Wind',
  'Anchor',
  'ShieldCheck',
] as const;

export type SustainabilityPillarIcon =
  (typeof SUSTAINABILITY_PILLAR_ICONS)[number];
