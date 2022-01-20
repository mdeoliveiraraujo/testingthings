import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface AuthResponseData {
  kind: string;
  id: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=GOTCHA',
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(catchError(this.handleError));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=GOTCHA',
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_NOT_FOUND': {
        errorMessage = 'Oh, you\'re not registered yet...';
        break;
      }
      case 'INVALID_PASSWORD': {
        errorMessage = 'Have you forgotten your password? Hmm...';
        break;
      }
      case 'USER_DISABLED': {
        errorMessage = 'Your account is disabled. Contact the admin (ME).';
        break;
      }
      case 'EMAIL_EXISTS':
        errorMessage = 'I\'m sure you\'ve got another email to use.';
        break;
      case 'OPERATION_NOT_ALLOWED':
        errorMessage = "Oops. You can't do this";
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        errorMessage = "Take a breath, a cup'o'coffee and try again later.";
        break;
    }
    return throwError(errorMessage);
  }
}
