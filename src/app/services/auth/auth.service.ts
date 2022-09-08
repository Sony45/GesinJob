import * as firebase from 'firebase';
import 'firebase/auth';        // for authentication
import 'firebase/firestore';
import { Injectable, Inject, forwardRef } from '@angular/core';
import { Platform, LoadingController, AlertController } from '@ionic/angular';
import { UserService } from '../user/user.service';
import { User } from 'src/app/models/user';
// import { NativeStorage } from '@ionic-native/native-storage/ngx';
// import { Camera, CameraOptions} from '@ionic-native/camera/ngx';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(public platform: Platform,
              public loading: LoadingController,
              public alert: AlertController) { }
  // Sign out
  async signOut() {
      await firebase.default.auth().signOut();
  }

  // Sign anonimous
  onSignAnonyme() {
    return new Promise((resolve, reject) => {
      firebase.default.auth().signInAnonymously().then(
        () => resolve('ok'),
        (err) => {  reject('error'); }
      );
    });
  }

  // Sign in with Google
  GoogleAuth() {
    return new Promise((resolve, reject) => {
      this.AuthLogin(new firebase.default.auth.GoogleAuthProvider()).then(
        (user) => { resolve(user); },
        () => reject('error')
      );
    });
  }

  // Sign in with Facebook
  FacebookAuth() {
    return this.AuthLogin(new firebase.default.auth.FacebookAuthProvider());
  }

  // Auth logic to run auth providers
  AuthLogin(provider) {
    firebase.default.auth().languageCode = 'es_ES';
    return firebase.default.auth().signInWithPopup(provider);
  }

  // Sign up
  signInUser(email, passwd) {
    return new Promise((resolve, reject) => {
    firebase.default.auth().useDeviceLanguage();
    firebase.default.auth().signInWithEmailAndPassword(email, passwd)
    .then(res => {
        resolve(res);
    }, err => reject(err));  });
  }

  // sign up
  signUpUser(email, passwd) {
  return new Promise((resolve, reject) => {
    firebase.default.auth().useDeviceLanguage();
    firebase.default.auth().createUserWithEmailAndPassword(email, passwd)
    .then(res => {
        this.emailVerification().then(
          () => resolve(res.user.uid)
        );
    }, err => reject(err)); });
  }

  // verification email
  emailVerification() {
    return new Promise((resolve, reject) => {
      firebase.default.auth().currentUser.sendEmailVerification().then(
        () => {
          resolve('ok');
        }, () => {
          resolve('ok');
        }
      );
    });
  }

  // reset
  resetPassword(email) {
      return new Promise((resolve, reject) => {
      firebase.default.auth().useDeviceLanguage();
      firebase.default.auth().sendPasswordResetEmail(email).then(() => {
            // Email sent.
            resolve('Messsage envoyé,\n Veuillez consulter votre boite mail pour la réiniatilisation!');
          }, (error) => {
            // An error happened.
            reject(error);
          });
      });
  }

  updateUser(user) {
    return new Promise((resolve, reject) => {
          firebase.default.auth().currentUser.updateProfile(user).then(
                                      () => {
                                        resolve('Informations enrégistrées !!!'); },
                                      (error) => reject(error) );
    });
  }


  onUpdateEmail(user: User) {
    return new Promise((resolve, reject) => {
    firebase.default.auth().useDeviceLanguage();
    firebase.default.auth().currentUser.updateEmail(user.email).then(
      () => { resolve('ok'); },
      (err) => reject(err.messsage)
    );
    }); 
  }

  onUpdatePassword(pwd) {
    return new Promise((resolve, reject) => {
      firebase.default.auth().useDeviceLanguage();
      firebase.default.auth().currentUser.updatePassword(pwd).then(
        () => resolve('Update password!'),
        (err) => reject(err.messsage)
      );
    });
  }
}
