import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Notification } from 'src/app/models/notification';
// import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notification: Notification;
  public newNotif: boolean;
  token = null;

  constructor(/* private afMessaging: AngularFireMessaging */) {}
  getObject() {
   return firebase.default.messaging();
  }

  getToken() {
   firebase.default.messaging().getToken({vapidKey: 'BIq7hrrErD-sLWyx2gvII691FD7HoPGRi9vvtBIQXx8OX9QEhkSAu7X3uYz51F-ZaOJNAHbK3sdIacN25meYQoU'})
   .then((currentToken) => {
      if (currentToken) {
        console.log(currentToken);
        // sendTokenToServer(currentToken);
        // updateUIForPushEnabled(currentToken);
      } else {
        // Show permission request.
        console.log('No registration token available. Request permission to generate one.');
        // Show permission UI.
        // updateUIForPushPermissionRequired();
        // setTokenSentToServer(false);
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
      // showToken('Error retrieving registration token. ', err);
      // setTokenSentToServer(false);
    });
  }
  // requestPermission() {
  //   return this.afMessaging.requestToken.pipe(
  //     tap(token => {
  //       console.log('Store token to server: ', token);
  //     })
  //   );
  // }

  // getMessages() {
  //   return this.afMessaging.messages;
  // }

  // deleteToken() {
  //   if (this.token) {
  //     this.afMessaging.deleteToken(this.token);
  //     this.token = null;
  //   }
  // }

  addNotification(data){
    return new Promise((resolve, reject) => {
      const user = firebase.default.auth().currentUser;
      firebase.default.firestore().collection('notifications').add(JSON.parse(JSON.stringify(data))).then(() => {
        resolve('Bien ajouté!'); },
        (error) => reject(error));
    });
  }

  getNotifications() {
    return new Promise((resolve, reject) => {
      const user = firebase.default.auth().currentUser;
      firebase.default.firestore().collection('notifications').where('postUid', '==', user.uid).get().then(
        (notifs) => {
          if (notifs.empty) {
            reject('empty');
          } else {
            // tslint:disable-next-line:prefer-const
            let notifications = [];
            notifs.docs.forEach(notif => {
              if (!notif.data().type) {
                notifications.push(notif.data());
              }
            });
            resolve(notifications);
          }
        },
        () => reject('connexion')
      );
    });
  }

  listenNotification() {
    const user = firebase.default.auth().currentUser;
    return firebase.default.firestore().collection('notifications').where('postUid', '==', user.uid);
  }

  checkRead() {
    return new Promise((resolve, reject) => {
      const user = firebase.default.auth().currentUser;
      firebase.default.firestore().collection('notifications').where('postUid', '==', user.uid).get().then(
        (notifs) => {
          if (notifs.empty) {
            reject('empty');
          } else {
            // tslint:disable-next-line:prefer-const
            let notifications = [];
            notifs.docs.forEach(notif => {
              if (!notif.data().read) {
                this.newNotif = true;
              }
            });
            resolve(notifications);
          }
        },
        () => reject('connexion')
      );
    });
  }

  updateRead() {
    return new Promise((resolve, reject) => {
      const user = firebase.default.auth().currentUser;
      firebase.default.firestore().collection('notifications').where('postUid', '==', user.uid).get().then(
        (notifs) => {
          if (notifs.empty) {
            reject('empty');
          } else {
            // tslint:disable-next-line:prefer-const
            let notifications = [];
            notifs.docs.forEach(notif => {
              if (!notif.data().read) {
                 notif.ref.update({read: true}).then(
                   () => { this.newNotif = false; resolve('ok'); },
                   () => reject('connexion')
                 );
              }
            });
            resolve(notifications);
          }
        },
        () => reject('connexion')
      );
    });
  }

}
