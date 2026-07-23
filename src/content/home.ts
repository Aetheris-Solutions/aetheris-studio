export type Discipline = {
  index: string;
  name: string;
  description: string;
  outputs: string[];
};

export type EngagementAct = {
  range: string;
  title: string;
  description: string;
};

export type DiagnosticStage = {
  index: string;
  title: string;
  description: string;
};

export const QUALIFICATION_URL = '#qualification';

export const disciplines: Discipline[] = [
  {
    index: '01',
    name: 'Storefront',
    description: 'Platform, merchandising, product discovery and international experience.',
    outputs: ['Shopify', 'UX architecture', 'Internationalisation']
  },
  {
    index: '02',
    name: 'Measurement',
    description: 'Trusted tracking, commercial economics, catalog health and decision-ready reporting.',
    outputs: ['Analytics', 'Attribution', 'Commercial scoreboard']
  },
  {
    index: '03',
    name: 'Demand',
    description: 'Paid acquisition, search, content and market intelligence connected to the same priorities.',
    outputs: ['Paid growth', 'SEO & GEO', 'Market intelligence']
  },
  {
    index: '04',
    name: 'Conversion',
    description: 'UX, CRO and experimentation focused on the moments that shape revenue.',
    outputs: ['Experimentation', 'Journey design', 'Merchandising']
  },
  {
    index: '05',
    name: 'Retention',
    description: 'Lifecycle, CRM and content designed around customer value—not isolated sends.',
    outputs: ['Lifecycle', 'CRM', 'Content systems']
  }
];

export const engagementActs: EngagementAct[] = [
  {
    range: 'Days 01—30',
    title: 'Establish the work.',
    description: 'Confirm baselines, owners and the first deliverables required by the selected workstreams.'
  },
  {
    range: 'Days 31—60',
    title: 'Implement the priorities.',
    description: 'Complete the agreed work across the two to four workstreams with the clearest rationale.'
  },
  {
    range: 'Days 61—90',
    title: 'Install the operating rhythm.',
    description: 'Validate delivery and leave ownership, reporting and the next decisions in place.'
  }
];

export const diagnosticStages: DiagnosticStage[] = [
  {
    index: '01',
    title: 'Trust the evidence.',
    description: 'Establish what can be trusted across measurement, economics, funnel, catalog and technical health.'
  },
  {
    index: '02',
    title: 'Map the opportunity.',
    description: 'Locate the commercial leaks, dependencies and work with the clearest impact-to-effort rationale.'
  },
  {
    index: '03',
    title: 'Order the next 90 days.',
    description: 'Define the priority workstreams, owners, scoreboard and decisions required to move.'
  }
];
