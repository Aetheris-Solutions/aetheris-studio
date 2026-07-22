export type ProofStatus = 'Production verified' | 'Operating archive verified' | 'Live system verified';

export type ProofIndexEntry = {
  index: string;
  id: string;
  name: string;
  category: string;
  summary: string;
  href: string;
  status: ProofStatus;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  logo?: {
    src: string;
    alt: string;
  };
};

export type CaseStudy = {
  index: string;
  id: string;
  name: string;
  category: string;
  headline: string;
  description: string;
  role: string;
  scope: string[];
  evidence: string[];
  outcome: string;
  claimLimit: string;
  status: ProofStatus;
  logo: {
    src: string;
    alt: string;
  };
  primaryImage: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  secondaryImage?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  capture: string;
  liveUrl?: string;
};

export type AgentProof = {
  index: string;
  id: string;
  name: string;
  category: string;
  description: string;
  scope: string[];
  evidence: string[];
  captureFacts: string[];
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  capture: string;
};

export const proofIndexEntries: ProofIndexEntry[] = [
  {
    index: '01',
    id: 'thats-it',
    name: 'That’s It',
    category: 'Headless Shopify · Live commerce',
    summary: 'A brand and three-language commerce system released to production.',
    href: '#case-thats-it',
    status: 'Production verified',
    image: {
      src: '/proof/thatsit-live-home.png',
      alt: 'The live That’s It multilingual storefront, captured in production.',
      width: 1512,
      height: 827,
    },
    logo: { src: '/proof/thatsit-logo.jpg', alt: 'That’s It by Fabrizio Rosa' },
  },
  {
    index: '02',
    id: 'cielo',
    name: 'Cielo 1914',
    category: 'Premium retail · Content operations',
    summary: 'A structured publishing system for luxury watch content and campaign-ready assets.',
    href: '#case-cielo',
    status: 'Operating archive verified',
    image: {
      src: '/cases/cielo-violet-watch.webp',
      alt: 'A violet-dial watch used in Cielo 1914 content operations.',
      width: 768,
      height: 1344,
    },
    logo: { src: '/proof/cielo-1914-logo.png', alt: 'Cielo Gioielli Milano 1914' },
  },
  {
    index: '03',
    id: 'google-agent',
    name: 'Google Agent',
    category: 'In-house system · Measurement & search',
    summary: 'A live cross-source cockpit with baselines, evidence and a controlled work queue.',
    href: '#agent-google',
    status: 'Live system verified',
    image: {
      src: '/proof/google-agent-live-cockpit.png',
      alt: 'Google Agent production cockpit showing an aggregate impact tracker.',
      width: 1512,
      height: 768,
    },
  },
  {
    index: '04',
    id: 'social-agent',
    name: 'Social Agent',
    category: 'In-house system · Content operations',
    summary: 'Brand context, editorial production, scheduling and approval in one governed queue.',
    href: '#agent-social',
    status: 'Live system verified',
    image: {
      src: '/proof/social-agent-live-queue.png',
      alt: 'Social Agent production read-only queue for Cielo 1914.',
      width: 1512,
      height: 766,
    },
  },
  {
    index: '05',
    id: 'lead-gen-agent',
    name: 'Lead Gen Agent',
    category: 'In-house system · Commercial operations',
    summary: 'Signals, scoring, human approvals and CRM reconciliation kept in one operating ledger.',
    href: '#agent-lead-gen',
    status: 'Live system verified',
    image: {
      src: '/proof/lead-gen-agent-live-aggregate.png',
      alt: 'Lead Gen Agent live aggregate operations dashboard with no personal records visible.',
      width: 1512,
      height: 827,
    },
  },
];

export const caseStudies: CaseStudy[] = [
  {
    index: '01',
    id: 'case-thats-it',
    name: 'That’s It',
    category: 'Brand system · Headless Shopify · International commerce',
    headline: 'A branded commerce system—not a reskinned template.',
    description:
      'Aetheris connected brand identity, catalog, search, customer accounts, booking, cart and checkout in one headless Shopify experience across English, Italian and Spanish.',
    role: 'Brand system, experience architecture and end-to-end technical delivery.',
    scope: ['Brand identity', 'Headless Shopify', 'EN / IT / ES', 'Catalog & search', 'Booking', 'GTM & technical SEO'],
    evidence: ['Live production storefront', 'Canonical source repository', 'Aetheris-authored brand manual'],
    outcome: 'A multilingual commerce system released to production and available to customers.',
    claimLimit: 'Production proves delivery. No revenue or conversion uplift is claimed without an approved baseline and period.',
    status: 'Production verified',
    logo: { src: '/proof/thatsit-logo.jpg', alt: 'That’s It by Fabrizio Rosa logo' },
    primaryImage: {
      src: '/proof/thatsit-live-home.png',
      alt: 'That’s It live production homepage showing the atelier-led brand and commerce experience.',
      width: 1512,
      height: 827,
    },
    capture: 'Live storefront capture · 22 July 2026',
    liveUrl: 'https://thatsitbeauty.com/en',
  },
  {
    index: '02',
    id: 'case-cielo',
    name: 'Cielo 1914',
    category: 'Premium retail · Content operations',
    headline: 'Turning luxury brand material into a controlled publishing system.',
    description:
      'Aetheris structures retailer guidelines, official campaign material, editorial copy and scheduled content families into a traceable operating archive for Cielo 1914.',
    role: 'Content operations, editorial system and campaign-ready asset orchestration.',
    scope: ['Brand governance', 'Asset curation', 'Content families', 'Editorial copy', 'Scheduling', 'Approval workflow'],
    evidence: ['2026 operating archive', 'Four structured content kits', 'Live Social Agent production queue'],
    outcome: 'A repeatable content operation with source material, drafts, schedules and governance attached to the work.',
    claimLimit: 'This case does not claim Shopify delivery or commercial uplift. Third-party campaign media remains governed by retailer usage rights.',
    status: 'Operating archive verified',
    logo: { src: '/proof/cielo-1914-logo.png', alt: 'Cielo Gioielli Milano 1914 logo' },
    primaryImage: {
      src: '/cases/cielo-violet-watch.webp',
      alt: 'Violet-dial watch content used in the Cielo 1914 operating archive.',
      width: 768,
      height: 1344,
    },
    secondaryImage: {
      src: '/cases/cielo-storefront.webp',
      alt: 'Cielo 1914 retail storefront.',
      width: 550,
      height: 550,
    },
    capture: 'Operating archive reviewed · 22 July 2026',
  },
];

export const agentProofs: AgentProof[] = [
  {
    index: '01',
    id: 'agent-google',
    name: 'Google Agent',
    category: 'Measurement, search & technical health',
    description:
      'A read-only operating cockpit connecting GA4, Search Console, Merchant Center, PageSpeed, technical SEO, baselines and controlled work items.',
    scope: ['Cross-source snapshots', 'Impact tracker', 'Technical SEO queue', 'Human-approved review artifacts'],
    evidence: ['Production Railway deployment', 'Canonical source repository', 'Authenticated read-only cockpit'],
    captureFacts: ['7 sources tracked', '17-day impact window', '38 open technical findings at capture'],
    image: {
      src: '/proof/google-agent-live-cockpit.png',
      alt: 'Google Agent live cockpit showing baseline-versus-current evidence for That’s It.',
      width: 1512,
      height: 768,
    },
    capture: 'Production · read-only capture · 22 July 2026',
  },
  {
    index: '02',
    id: 'agent-social',
    name: 'Social Agent',
    category: 'Brand intelligence & content operations',
    description:
      'A tenant-scoped system connecting brand rules, catalog context, editorial production, scheduling and a publisher handoff behind approval gates.',
    scope: ['Per-client brand brain', 'Editorial queue', 'Scheduling', 'Publisher handoff', 'Human approval'],
    evidence: ['Production Railway deployment', 'Canonical source repository', 'Production read-only queue'],
    captureFacts: ['Cielo 1914 tenant selected', '59 draft items in the operating queue', 'No automatic publishing claim'],
    image: {
      src: '/proof/social-agent-live-queue.png',
      alt: 'Social Agent production read-only queue for Cielo 1914.',
      width: 1512,
      height: 766,
    },
    capture: 'Production · read-only capture · 22 July 2026',
  },
  {
    index: '03',
    id: 'agent-lead-gen',
    name: 'Lead Gen Agent',
    category: 'Signals, approval & CRM operations',
    description:
      'A signal-to-decision workflow connecting source ingestion, deterministic scoring, Telegram approval, provider reconciliation and Attio as the commercial source of truth.',
    scope: ['Signal ingestion', 'Lead scoring', 'Human approval', 'Attio sync', 'Provider reconciliation'],
    evidence: ['Production Railway deployment', 'Canonical source repository', 'Live aggregate dashboard'],
    captureFacts: ['2,485 pipeline records', '30 approval decisions in 7 days', 'No personal records shown in this capture'],
    image: {
      src: '/proof/lead-gen-agent-live-aggregate.png',
      alt: 'Lead Gen Agent live aggregate operations dashboard with personal records excluded.',
      width: 1512,
      height: 827,
    },
    capture: 'Production · aggregate capture · 22 July 2026',
  },
];
