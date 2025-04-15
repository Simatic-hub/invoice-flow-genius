
import { TranslationRecord } from "../../types";
import { commonTranslations } from "./common";
import { authTranslations } from "./auth";
import { invoiceTranslations } from "./invoice";
import { quoteTranslations } from "./quote";
import { settingsTranslations } from "./settings";
import { dashboardTranslations } from "./dashboard";
import { pricingTranslations } from "./pricing";
import { clientTranslations } from "./client";

// Merge all translation categories into a single English translation record
export const englishTranslations: TranslationRecord = {
  ...commonTranslations,
  ...authTranslations,
  ...invoiceTranslations,
  ...quoteTranslations,
  ...settingsTranslations,
  ...dashboardTranslations,
  ...pricingTranslations,
  ...clientTranslations
};
