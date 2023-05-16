import { createI18n } from "vue-i18n";
import zh from "./zh";
import en from "./en";

const i18n = createI18n({
  locale: "zh", // 定义默认语言为中文
  legacy: false,
  globalInjection: true,
  locale: navigator.language ?? 'en' ,
  fallbackLocale: 'en',
  messages: {
    zh,
    en,
  },
});

export default i18n;