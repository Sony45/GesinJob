import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { AlertController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase';
import { NotificationService } from '../services/notification/notification.service';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  public deferredPrompt;
  constructor(public router: Router,
              public notifService: NotificationService, private messagingService: NotificationService,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController,
              readonly swPush: SwPush
  ) {
    this.notifService.getToken();
    this.onGetMessage();
    Notification.requestPermission().then(() => console.log('granted notification'), () => console.log('No granted notification'));
    this.listeNoti();
    const blob = new Blob([
      // tslint:disable-next-line:quotemark
      "onmessage = (e) => { setInterval(() => { this.notifService.listenNotification().onSnapshot((snaps) => { snaps.docChanges().forEach((change) => { if (change.type === 'added') {  change.doc.data();const dt = { body: `...${change.doc.data().content}`, icon: change.doc.data().image ? change.doc.data().image : '../../assets/imgs/logo.png', vibrate: [200, 100, 200, 100, 200, 100, 200], tag: 'notificacìon', displayName: `${change.doc.data().displayName}; self.postMessage(dt);  }  }); } ); }, 10000);}"
    ]);
    const blobURL = window.URL.createObjectURL(blob);
    const worker = new Worker(blobURL);

    worker.addEventListener('message', (wR: any) => {
        // workerReponse is simply `message` which was passed in self.postMessage(message)
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(`${wR.displayName}`, {
          body: wR.body,
          icon: wR.icon,
          vibrate: wR.vibrate,
          tag:  wR.tag,
        });
      });
    });
  }
onGetMessage() {
  firebase.default.messaging().onMessage((payload) => {
    console.log('Message received. ', payload);
  });
}

  ngOnInit(){
  }

  onAdd() {
   this.router.navigateByUrl('/tabs/tab2');
  }


  listeNoti() {
    navigator.serviceWorker.ready.then((registration) => {
      this.notifService.listenNotification().onSnapshot(
        (snaps) => {
          snaps.docChanges().forEach((change) => {
            if (change.type === 'added') {
              change.doc.data();
              registration.showNotification(`${change.doc.data().displayName}`, {
                body: `...${change.doc.data().content}`,
                icon: change.doc.data().image ? change.doc.data().image : '../../assets/imgs/logo.png',
                vibrate: [200, 100, 200, 100, 200, 100, 200],
                tag: 'notificacìon'
              });
            }
          });
        },
      );
    });
  }

}
