import path from "node:path";
import { fileURLToPath } from "node:url";

import { applySeoToSite } from "./seo-utils.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outputRoot = path.join(root, "webflow-site");

const result = await applySeoToSite({
  outputRoot,
  productionOrigin: "https://aetherisstudio.com",
});

console.log(
  `Applied SEO, crawlability, and analytics consent updates to ${result.pages} pages using GTM ${result.tagManagerId}.`,
);
