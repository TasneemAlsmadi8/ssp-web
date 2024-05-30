import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UserConfirmationService {

  confirmAction(title: string, text: string, confirmButtonText: string = 'Ok', cancelButtonText: string = 'Cancel'): Observable<boolean> {
    return new Observable(observer => {
      Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
      }).then((result) => {
        observer.next(result.isConfirmed);
        observer.complete();
      });
    });
  }

  showLoading(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
  }

  showSuccess(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
    });
  }

  showError(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'error',
    });
  }
}
