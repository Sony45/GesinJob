import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public user: any;
  public users = [];
  constructor() { }

  onGetAllUsers() {
    return new Promise((resolve, reject) => {
      firebase.default.firestore().collection('users').get().then(
        (users) => {
          if (users.empty) { reject('empty'); } else {
            users.docs.forEach(user => {
              this.users[user.data().uid] = {
                uid: user.data().uid,
                displayName: typeof user.data().displayName === 'undefined' ? null : user.data().displayName,
                photoURL: user.data().photoURL,
              };
            });
            resolve(this.users);
          }
        },
        (err) => reject(err)
      );
    });
  }

  onAddUser() {
    return new Promise((resolve, reject) => {
      firebase.default.firestore().collection('users').add(JSON.parse(JSON.stringify(this.user))).then(
        () => { resolve('ok'); },
        (error) => reject(error)
      );
        }
    );
  }

  getSearchUsers(strSearch: string) {
    return new Promise((resolve, reject) => {
      const strlength = strSearch.length;
      const strFrontCode = strSearch.slice(0, strlength - 1);
      const strEndCode = strSearch.slice(strlength - 1, strSearch.length);
      const startcode = strSearch;
      const endcode = strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);
      firebase.default.firestore().collection('users').where('displayName', '>=', startcode).where('displayName', '<', endcode )
      .orderBy('displayName', 'asc').get().then(
        (snaps) => {
          if (snaps.empty) {
             reject('empty');
          } else {
            // tslint:disable-next-line:prefer-const
            let users = [];
            snaps.docs.forEach(user => {
              if (user.data().uid !== firebase.default.auth().currentUser.uid) {
                users.push(user.data());
              }
            });
            resolve(users);
          }
        },
       () => reject('connexion 2')
      );
    });
  }

  onUpdateUser() {
    return new Promise((resolve, reject) => {
    firebase.default.auth().useDeviceLanguage();
    firebase.default.firestore().collection('users').where('uid', '==', this.user.uid)
          .get().then(
            (snap) => {
                  firebase.default.firestore().collection('users').doc(snap.docs[0].id).
                  update(JSON.parse(JSON.stringify(this.user))).then(() => {
                    resolve('update');
                  }, (err) => { reject('erreur update fire'); });
            },
            (err) => { reject('erreur update fire'); }
          );
    });
  }

  async onGetUser(id) {
    return new Promise(async (resolve, reject) => {
      await firebase.default.firestore().collection('users').where('uid', '==', id).get().then(
        (user) =>  {
          if (user.empty) {
            reject('empty');
          } else {
            resolve(user.docs[0].data());
          }
        },
        (err) => { reject('error'); }
      );
    });
  }

  getUsersFromArray(array) {
   return new Promise((resolve, reject) => {
    firebase.default.firestore().collection('users').where('uid', 'in', array).get().then(
      (snaps) => {
        // tslint:disable-next-line:prefer-const
        let users = [];
        if (snaps.empty) {
          reject('empty');
        } else {
            snaps.docs.forEach(user => {
              users.push(user.data());
            });
            resolve(users);
        }
      },
      (err) => { reject('connexion'); }
    );
   });
  }
}
