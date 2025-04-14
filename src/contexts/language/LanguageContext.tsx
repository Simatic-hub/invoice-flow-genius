
import React, { createContext, useState, useEffect } from 'react';
import { Language, LanguageContextType, TranslationKey } from './types';
import { translations } from './translations';

const defaultLanguage: Language = 'en';

export const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: TranslationKey) => key,
});

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get from localStorage or use default
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || defaultLanguage;
  });
  
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('language', language);
    
    // Dispatch event to notify components that language has changed
    window.dispatchEvent(new Event('language-changed'));
    
    // Set HTML lang attribute
    document.documentElement.setAttribute('lang', language);
  }, [language]);
  
  const t = (key: TranslationKey): string => {
    if (translations[language]?.[key]) {
      return translations[language][key];
    }
    
    // Fallback to English if the key doesn't exist in the current language
    if (translations['en']?.[key]) {
      return translations['en'][key];
    }
    
    // If all else fails, return the key itself
    return key;
  };
  
  const value = {
    language,
    setLanguage,
    t
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
