export enum LanguageCode {
  English = 'en-US',
  Arabic = 'ar-JO',
}

export interface Language {
  code: LanguageCode;
  direction: 'ltr' | 'rtl';
  name: string;
}

export const languageCodeMapping: { [key: string]: LanguageCode } = {
  'en-US': LanguageCode.English,
  'ar-JO': LanguageCode.Arabic,
};

export const availableLanguages = new Map<LanguageCode, Language>([
  [
    LanguageCode.English,
    { code: LanguageCode.English, direction: 'ltr', name: 'English' },
  ],
  [
    LanguageCode.Arabic,
    { code: LanguageCode.Arabic, direction: 'rtl', name: 'Arabic' },
  ],
]);
