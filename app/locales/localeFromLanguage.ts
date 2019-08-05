const SUPPORTED_LOCALES = ["en", "es"]

export const localeFromLanguage = (language: string) => {
  const locale = language.split("-")[0]
  return SUPPORTED_LOCALES.includes(locale) ? locale : SUPPORTED_LOCALES[0]
}