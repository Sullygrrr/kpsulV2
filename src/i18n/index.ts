import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import des traductions des différentes langues
import ar from './locales/ar';
import de from './locales/de';
import en from './locales/en';
import es from './locales/es';
import fr from './locales/fr';
import it from './locales/it';
import ja from './locales/ja';
import ko from './locales/ko';
import pt from './locales/pt';
import zh from './locales/zh';

// Définition des langues disponibles
export const languages = {
  ar: { name: 'العربية', dir: 'rtl' },
  de: { name: 'Deutsch', dir: 'ltr' },
  en: { name: 'English', dir: 'ltr' },
  es: { name: 'Español', dir: 'ltr' },
  fr: { name: 'Français', dir: 'ltr' },
  it: { name: 'Italiano', dir: 'ltr' },
  ja: { name: '日本語', dir: 'ltr' },
  ko: { name: '한국어', dir: 'ltr' },
  pt: { name: 'Português', dir: 'ltr' },
  zh: { name: '中文', dir: 'ltr' }
};

// Initialisation d'i18n avec les traductions
i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar,
      de,
      en,
      es,
      fr,
      it,
      ja,
      ko,
      pt,
      zh
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;