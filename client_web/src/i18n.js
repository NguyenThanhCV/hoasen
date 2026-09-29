import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import EN_TRANSTALTE from "./locales/en/translate";
import EN_MESSAGE from "./locales/en/message";
import VI_TRANSTALTE from "./locales/vi/translate";
import VI_MESSAGE from "./locales/vi/message";

const resources = {
  en: { translation: EN_TRANSTALTE, message: EN_MESSAGE },
  vi: { translation: VI_TRANSTALTE, message: VI_MESSAGE },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigate"],
      lookupQuerystring: "lng",
      lookupCookie: "lang",
      lookupLocalStorage: "lang",
      caches: ["localStorage", "cookie"],
    },
    lng: "vi",
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
