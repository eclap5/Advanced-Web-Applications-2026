import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en";
import fi from "./fi";

/**
 * Initialize i18n with translations.
 * Translations are defined in separate files (en.ts and fi.ts) for better organization.
 * These could be also divided into more controlled files i.e. en/profile.ts, en/login.ts etc. if the app grows larger
 */
void i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
    resources: {
        en: {
            translation: en,
        },
        fi: {
            translation: fi,
        },
    },
});

export default i18n;