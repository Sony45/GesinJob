import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';
import { NotificationService } from '../services/notification/notification.service';
import { PostService } from '../services/post/post.service';
import { SnippetService } from '../services/snippet/snippet.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{
  public notifications: any[];
  public error = null;
  public restrict = false;
  constructor(public notif: NotificationService, public router: Router,
              public snip: SnippetService, public location: Location,
              public loadingController: LoadingController, public postService: PostService) {}
  ngOnInit() {
    if (firebase.default.auth().currentUser.isAnonymous) {
      this.restrict = true;
   } else {
      this.onGetNotif();
   }
  }

 onShowUser(uid) {
   this.router.navigateByUrl(`/profile/${uid}`);
 }

  async onGetNotif() {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
    this.notif.getNotifications().then(
      (not: any[]) => { this.notifications = not; this.error = null; loading.dismiss(); },
      (err) => { if (err === 'empty') {
                     this.error = 'No se encontraron notificaciones';
                     loading.dismiss();
                  } else {
                     this.error = 'Problema de carga. Inténtalo de nuevo';
                     loading.dismiss();
                  }}
    );
  }

  async onOpen(postId) {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
    this.postService.onGetPost(postId).then(
      (pos) => { loading.dismiss(); this.router.navigateByUrl('/show'); },
      () => { loading.dismiss(); this.snip.toast('Problema de conexión. Inténtalo de nuevo'); }
    );
  }

  doRefresh(event) {
    this.onGetNotif();
  }

  onGoBack() {
    this.location.back();
  }

}
