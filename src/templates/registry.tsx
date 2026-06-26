import type { Site } from "@/lib/types";
import { RoyalIndianSite } from "./royal-indian";
import { EngagementSite } from "./engagement";
import { BirthdaySite } from "./birthday";
import { BabyShowerSite } from "./baby-shower";
import { AnniversarySite } from "./anniversary";
import { CorporateSite } from "./corporate";
import { CustomSite } from "./custom";

/**
 * Maps a templateId to its React renderer. Pure-data catalog (gallery, defaults)
 * lives in ./catalog.
 */
type TemplateComponent = (props: {
  site: Site;
  lang?: string;
}) => React.ReactNode;

const RENDERERS: Record<string, TemplateComponent> = {
  "royal-indian": RoyalIndianSite,
  engagement: EngagementSite,
  birthday: BirthdaySite,
  "baby-shower": BabyShowerSite,
  anniversary: AnniversarySite,
  corporate: CorporateSite,
  custom: CustomSite,
};

export function SiteRenderer({ site, lang }: { site: Site; lang?: string }) {
  const Component = RENDERERS[site.templateId] ?? RoyalIndianSite;
  return <Component site={site} lang={lang} />;
}

export function hasRenderer(templateId: string): boolean {
  return templateId in RENDERERS;
}
