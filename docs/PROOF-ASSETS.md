# Public proof asset and claim ledger

The dated captures below were created on 22 July 2026; the other rows identify
the exact marks and case media currently in the public bundle. They are used as
evidence, not decoration. SHA-256 values identify the files; they do not prove
authorship, client approval or third-party rights.

## Project-owner publication instruction

The project owner explicitly instructed this workstream that the That’s It and
Cielo names, marks, screenshots, dashboards and visible KPI facts may be
published. This is recorded as `AUTH-OWNER-001`.

`AUTH-OWNER-001` is an internal publication instruction. It is **not** a client
release, photographer release, retailer/brand licence, confidentiality waiver
or legal opinion. Those separate rights remain governed by the status below
and must be archived outside the public bundle.

## Exact asset manifest

| Asset ID | Public path | SHA-256 | Source / capture mode | Public boundary |
| --- | --- | --- | --- | --- |
| `AST-THI-CAP-001` | `public/proof/thatsit-live-home.png` | `2ab7018f19214b80472dea8524596d28e611fc5e0f6a911e00ccb0894bcdddc3` | `https://thatsitbeauty.com/en`; public production storefront | No account or customer data |
| `AST-THI-MARK-001` | `public/proof/thatsit-logo-256.webp` | `9d47708cccfbc98ffd1180f9f75dc00bba5cd90743f8938872f28095a0081e83` | Local Aetheris client archive; optimized derivative | Client mark only |
| `AST-THI-MARK-SRC-001` | `public/proof/thatsit-logo.jpg` | `79e1e916dc5eaeb972f0bce90513951f5802607553585c8649820a9c39cc0817` | Local Aetheris client archive | Source raster retained in bundle |
| `AST-CIE-MARK-001` | `public/proof/cielo-1914-logo-256.webp` | `68d6e069cd3ed6ca8e6b5bc6310eefb3c9efb200b37047364041e20c7cd68fe7` | Local Aetheris client archive; optimized derivative | Client/retailer mark only |
| `AST-CIE-MARK-SRC-001` | `public/proof/cielo-1914-logo.png` | `aca0cc120fde6cfda7a6bdfff58ed8f8cb3742e950139d0679fab59d8cf6666f` | Local Aetheris client archive | Source raster retained in bundle |
| `AST-CIE-MEDIA-001` | `public/cases/cielo-violet-watch.webp` | `b28dc0d9fdf567d9ad1bd9e4e64e9703d94bb296dbd12dad9e57114dc0a55c8e` | Cielo operating archive | Product/campaign image; no customer data |
| `AST-CIE-MEDIA-002` | `public/cases/cielo-storefront.webp` | `275d1dfe955821428f0b10a4fc0bec47bf3acd3ab8f77daae8889c99abb8d9e2` | Cielo operating archive | Retail storefront image |
| `AST-GA-CAP-001` | `public/proof/google-agent-live-cockpit.png` | `9599a1277614f2aa0e0673af70a67ac4b2be33aa7389c9de243e2b411df6991b` | Google Agent on Railway; authenticated production through a GET/HEAD-only local proxy | Aggregate impact view; no credentials or account secrets |
| `AST-SA-CAP-001` | `public/proof/social-agent-live-queue.png` | `0d4cb104ab08a2fa5a5d843c3a1fc74e94a9313a179bbf95b741b0df28f0354b` | Social Agent on Railway; production read-only preview | Tenant queue; no credentials or personal data |
| `AST-LGA-CAP-001` | `public/proof/lead-gen-agent-live-aggregate.png` | `875bfed159fa8ca5f528bd190d4d3b089b2dcaaac3d7f873dff92e98201201eb` | Lead Gen Agent on Railway; aggregate production view | Top-level totals only; no names, emails or record rows |

## Public claim ledger

Every quantitative fact is a dated capture fact, not a forecast, SLA or
ongoing guarantee.

| Claim ID | Public fact | Evidence | Verification boundary |
| --- | --- | --- | --- |
| `CLM-THI-001` | That’s It was live as a multilingual production storefront at capture | `AST-THI-CAP-001` plus public URL | Independently observable delivery state; no revenue or conversion claim |
| `CLM-CIE-001` | Cielo had a reviewed 2026 operating archive and four structured content kits | Internal operating archive; `AST-SA-CAP-001` supports the live queue only | The four-kit source ledger is not archived in this repository |
| `CLM-GA-001` | 7 sources tracked | `AST-GA-CAP-001` | Visible aggregate at 22 July 2026 |
| `CLM-GA-002` | 17-day impact window | `AST-GA-CAP-001` | Visible dated window; no causal uplift claim |
| `CLM-GA-003` | 38 open technical findings | `AST-GA-CAP-001` | Visible count at capture, not a current guarantee |
| `CLM-SA-001` | 59 draft items in the operating queue | `AST-SA-CAP-001` | Visible tenant count at capture; no automatic-publishing claim |
| `CLM-LGA-001` | 2,485 pipeline records | `AST-LGA-CAP-001` | Visible aggregate at capture; no personal records published |
| `CLM-LGA-002` | 30 approval decisions in 7 days | `AST-LGA-CAP-001` | Visible dated aggregate; underlying export not archived here |

Claims that rely on the canonical source repositories, an Aetheris-authored
brand manual or a private operating archive require those private references
in the internal handover. A screenshot alone does not prove authorship or the
full implementation scope.

## Rights and publication gate

| Rights scope | Owner instruction | Separate third-party evidence in repository | Current status |
| --- | --- | --- | --- |
| Aetheris-owned agent UI and code | `AUTH-OWNER-001`; Aetheris ownership stated in the project brief | No separate IP schedule is stored in this repository; canonical repository references must remain available internally | Owner-approved; internal provenance still required for handover |
| That’s It name, mark and storefront reproduction | `AUTH-OWNER-001` | No signed client/mark publication release archived here | External-rights evidence pending |
| Cielo name and mark | `AUTH-OWNER-001` | No signed client/retailer publication release archived here | External-rights evidence pending |
| Cielo product/campaign and storefront imagery | `AUTH-OWNER-001` | Photographer, retailer and upstream brand usage terms are not archived here | External-rights evidence pending |
| Cielo tenant context visible in Social Agent | `AUTH-OWNER-001` | No separate confidentiality/client approval record archived here | External-rights evidence pending |

No performance claim may be inferred from a deployment screenshot. Do not
describe the proof layer as legally incontestable until the pending
third-party evidence is archived and linked in the private release record.
