export type AtelierRole = {
  index: string;
  role: string;
  responsibility: string;
  outputs: string[];
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
 * These entries reserve layout space only. They intentionally contain no names,
 * portraits or role assignments until the final team publication pass is approved.
 */
export const teamProfilePlaceholders: TeamProfilePlaceholder[] = [
  { slot: 'I', label: 'Profile reserved', note: 'Portrait and name pending approval' },
  { slot: 'II', label: 'Profile reserved', note: 'Portrait and name pending approval' },
  { slot: 'III', label: 'Profile reserved', note: 'Portrait and name pending approval' },
  { slot: 'IV', label: 'Profile reserved', note: 'Portrait and name pending approval' },
  { slot: 'V', label: 'Profile reserved', note: 'Portrait and name pending approval' },
  { slot: 'VI', label: 'Profile reserved', note: 'Portrait and name pending approval' },
];
