import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public router: Router, public aus: AuthService, public userService: UserService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return new Promise((resolve, reject) => {
        // this.userService.onGetUser(firebase.default.auth().currentUser.uid).then(
        //   () => { resolve(true); },
        //   (err) => {
        //     if (err === 'empty') {
        //       this.router.navigate(['/missed']);
        //       resolve(true);
        //     }
        //   }
        // );
        firebase.default.auth().onAuthStateChanged((user: firebase.default.User) => {
          if (user && !user.isAnonymous) {
            resolve(true);
          } else if (user) { resolve(true); } else {
            this.router.navigateByUrl('/present');
            resolve(false);
          }
        });
      });
  }
}
