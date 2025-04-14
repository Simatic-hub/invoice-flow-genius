
export type Language = 'en' | 'nl' | 'fr';

export type TranslationKey = string;

export type TranslationRecord = Record<TranslationKey, string>;

export type TranslationsObject = Record<Language, TranslationRecord>;

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}
