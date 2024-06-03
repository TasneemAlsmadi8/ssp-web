import { Component, OnInit } from '@angular/core';
import { faUser, faUserGear } from '@fortawesome/free-solid-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/interfaces/user';
import { LanguageService } from '../../shared/services/language.service';
import {
  Language,
  languageCodeMapping,
} from '../../shared/interfaces/language';
import { LocalUserService } from '../../shared/services/local-user.service';
import { takeUntil } from 'rxjs';
import { DestroyBaseComponent } from 'src/app/shared/base/destroy-base.component';

@Component({
  selector: 'app-layout',
  // standalone: true,
  // imports: [],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends DestroyBaseComponent implements OnInit {
  faBars = faBars;
  faUser = faUser;
  faGears = faUserGear;
  isSideBarDefault = false;
  isProfileMenuOpen = false;

  isLoggedIn = false;
  user!: User;
  selectedLang!: string;
  selectedLangDir!: 'ltr' | 'rtl';

  constructor(
    private authService: AuthService,
    private languageService: LanguageService,
    private localUserService: LocalUserService
  ) {
    super();
    this.selectedLang = this.languageService.selectedLanguage;
    this.selectedLangDir = this.languageService.dir;
    this.languageService.onChange().subscribe((language: Language) => {
      this.selectedLang = language.code.toString();
      this.selectedLangDir = language.direction;
    });
  }
  ngOnInit(): void {
    if (this.isUserLoggedIn()) {
      this.isLoggedIn = true;
      this.user = this.getUser();
    } else {
      this.isLoggedIn = false;
      this.user = {
        id: '',
        code: '',
        fullName: '',
        position: '',
      };
    }
  }

  toggleSideBar() {
    this.isSideBarDefault = !this.isSideBarDefault;
  }

  toggleProfileMenuOpen() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }

  getUser(): User {
    return this.localUserService.getUser();
  }

  isUserLoggedIn(): boolean {
    let isLoggedin = false;
    this.authService
      .checkLogin()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => (isLoggedin = value));
    return isLoggedin;
  }

  changeLanguage(lang: string) {
    this.languageService.changeLanguage(languageCodeMapping[lang]);
  }
}
