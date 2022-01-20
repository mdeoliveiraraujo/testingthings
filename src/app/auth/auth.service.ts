import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Subject } from 'rxjs';
import { User } from './user.model';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = new Subject<User>();

  constructor(private http: HttpClient) {}

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>('GOTCHA', {
        email: email,
        password: password,
        returnSecureToken: true,
      })
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>('GOTCHA', {
        email: email,
        password: password,
        returnSecureToken: true,
      })
      .pipe(catchError(this.handleError),tap((resData) => {
        this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
      }));
  }

  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    this.user.next(user);
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_NOT_FOUND': {
        errorMessage = "Oh, you're not registered yet...";
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
        errorMessage = "I'm sure you've got another email to use.";
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
