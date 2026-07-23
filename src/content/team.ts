export type AtelierRole = {
  index: string;
  role: string;
  responsibility: string;
  outputs: string[];
};

export type ResponsiveTeamImage = {
  avif: string;
  webp: string;
  fallback: string;
  width: number;
  height: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  responsibility: string;
  disciplines: string[];
  profileUrl?: string;
  portrait: {
    painted: ResponsiveTeamImage;
    real: ResponsiveTeamImage;
    paintedPosition?: string;
    realPosition?: string;
  };
};

export type TeamProfilePlaceholder = {
  slot: string;
  label: string;
  note: string;
};

export const atelierRoles: AtelierRole[] = [
  {
    index: '01',
    role: 'Commerce lead',
    responsibility: 'Owns the commercial thesis, scope, priorities and decision cadence.',
    outputs: ['Commercial brief', '90-day roadmap'],
  },
  {
    index: '02',
    role: 'Shopify engineering',
    responsibility: 'Owns storefront architecture, integrations, performance and release quality.',
    outputs: ['Storefront delivery', 'Technical systems'],
  },
  {
    index: '03',
    role: 'UX & CRO',
    responsibility: 'Owns journey evidence, conversion hypotheses and experience design.',
    outputs: ['Journey design', 'Experiment backlog'],
  },
  {
    index: '04',
    role: 'Paid acquisition',
    responsibility: 'Owns media economics, feed quality and paid-growth learning loops.',
    outputs: ['Acquisition plan', 'Media scoreboard'],
  },
  {
    index: '05',
    role: 'Search & content',
    responsibility: 'Owns demand intelligence, discoverability and content operations.',
    outputs: ['Search system', 'Editorial operations'],
  },
  {
    index: '06',
    role: 'Retention & analytics',
    responsibility: 'Owns lifecycle, measurement trust and the shared commercial view.',
    outputs: ['Lifecycle system', 'Measurement layer'],
  },
];

/**
 * Public roster only.
 *
 * Add a person here only after the corresponding entry in
 * docs/TEAM-ASSET-REGISTER.md is marked READY. Consent and rights metadata
 * deliberately stay out of the client bundle.
 */
export const teamMembers: TeamMember[] = [];

/**
 * These entries reserve layout space only. They intentionally contain no names,
 * portraits or role assignments until each individual publication pass is approved.
 */
export const teamProfilePlaceholders: TeamProfilePlaceholder[] = [
  { slot: 'I', label: 'Portrait reserved', note: 'Identity and image approval pending' },
  { slot: 'II', label: 'Portrait reserved', note: 'Identity and image approval pending' },
  { slot: 'III', label: 'Portrait reserved', note: 'Identity and image approval pending' },
  { slot: 'IV', label: 'Portrait reserved', note: 'Identity and image approval pending' },
  { slot: 'V', label: 'Portrait reserved', note: 'Identity and image approval pending' },
  { slot: 'VI', label: 'Portrait reserved', note: 'Identity and image approval pending' },
];
