import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import {
  Language,
  LanguageCode,
  availableLanguages,
  languageCodeMapping,
} from '../interfaces/language';
import { registerLocaleData } from '@angular/common';
import localArJo from '@angular/common/locales/ar-JO';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private _selectedLanguage: LanguageCode = LanguageCode.English;

  private subject: Subject<Language> = new Subject<Language>();

  constructor(
    protected translate: TranslateService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    if (isPlatformBrowser(platformId)) {
      registerLocaleData(localArJo);

      const localStorageLanguage = localStorage.getItem('Language');

      if (localStorageLanguage && languageCodeMapping[localStorageLanguage]) {
        this._selectedLanguage = languageCodeMapping[localStorageLanguage];
      } else {
        this._selectedLanguage = LanguageCode.English; // Defaulting to English
        if (localStorageLanguage != null) {
          console.error(
            'Language code not found in mapping:',
            localStorageLanguage
          );
        }
      }
      this.translate.setDefaultLang(this._selectedLanguage.toString());
    }
  }

  get selectedLanguage(): LanguageCode {
    return this._selectedLanguage;
  }

  changeLanguage(language: LanguageCode): void {
    this._selectedLanguage = language;
    localStorage.setItem('Language', language.toString());
    this.translate.setDefaultLang(this._selectedLanguage.toString());
    this.subject.next(availableLanguages.get(language)!);
  }

  onChange(): Observable<Language> {
    return this.subject.asObservable();
  }

  get dir(): 'ltr' | 'rtl' {
    return availableLanguages.get(this.selectedLanguage)!.direction;
  }
}
