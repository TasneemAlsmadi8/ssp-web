import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class UserConfirmationService {
  constructor(private translate: TranslateService) {}

  confirmAction(
    title: string,
    text: string,
    confirmButtonText: string = 'Ok',
    cancelButtonText: string = 'Cancel'
  ): Observable<boolean> {
    return new Observable((observer) => {
      this.translate
        .get([title, text, confirmButtonText, cancelButtonText])
        .subscribe((translations) => {
          Swal.fire({
            title: translations[title],
            text: translations[text],
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: translations[confirmButtonText],
            cancelButtonText: translations[cancelButtonText],
          }).then((result) => {
            observer.next(result.isConfirmed);
            observer.complete();
          });
        });
    });
  }

  showLoading(title: string, text: string) {
    this.translate.get([title, text]).subscribe((translations) => {
      Swal.fire({
        title: translations[title],
        text: translations[text],
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
    });
  }

  showSuccess(title: string, text: string, confirmButtonText: string = 'Ok') {
    this.translate
      .get([title, text, confirmButtonText])
      .subscribe((translations) => {
        Swal.fire({
          title: translations[title],
          text: translations[text],
          icon: 'success',
          confirmButtonText: translations[confirmButtonText],
        });
      });
  }

  showError(title: string, text: string, confirmButtonText: string = 'Ok') {
    this.translate
      .get([title, text, confirmButtonText])
      .subscribe((translations) => {
        Swal.fire({
          title: translations[title],
          text: translations[text],
          icon: 'error',
          confirmButtonText: translations[confirmButtonText],
        });
      });
  }
}
