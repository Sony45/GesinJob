import { Component, Input, OnInit } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import * as firebase from 'firebase';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SnippetService } from 'src/app/services/snippet/snippet.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
})
export class ProfilComponent implements OnInit {
  @Input() uid: string; // argument from main page
  public user;
  public userShowing: any;
  public segment = 'contribution';
  public loader = true;
  constructor(public navCtrl: NavController, public userService: UserService,
              public snip: SnippetService, public notif: NotificationService,
              public authService: AuthService, public loadingController: LoadingController) { }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
    this.user = firebase.default.auth().currentUser;
    this.userService.onGetUser(this.uid).then(
      (user) => { this.userShowing = user; loading.dismiss(); this.loader = false; },
      () => { loading.dismiss(); this.loader = false; }
    );
  }

  segmentChanged(ev) {
    this.segment = ev.detail.value;
  }

  onEdit() {
  this.navCtrl.navigateRoot('/edit-profile');
  }

  onLogout() {
   this.authService.signOut();
   this.navCtrl.navigateRoot('/present');
  }

  onChat(id) {
    this.navCtrl.navigateRoot(`/chat/${id}`);
  }

  onCheckFollow() {
    if (typeof this.userShowing === 'undefined') {
      return false;
    } else{
      if (this.userShowing.followers) {
        if (this.userShowing.followers.includes(this.user.uid)) {
          return true;
        } else {
          return false;
        }
      } else { return false; }
    }
  }

  onFollow() {
    if (typeof this.userShowing.followers === 'undefined') {
      this.userShowing.followers = [this.user.uid];
    } else {
      this.userShowing.followers.push(this.user.uid);
    }
    this.userService.user = this.userShowing;
    this.userService.onUpdateUser().then(
      () => {
        const dat = {
          postId: null,
          content: ' empieza a seguirte',
          image: null,
          photoURL:  firebase.default.auth().currentUser.photoURL,
          displayName:  firebase.default.auth().currentUser.displayName,
          date: Date.now(),
          postUid: firebase.default.auth().currentUser.uid,
          commentUid: firebase.default.auth().currentUser.uid,
          read: false
        };
        this.notif.addNotification(dat).then(
            () => {  },
            () => {}
          );
       },
      () => {}
    );
  }


  onUnFollow() {
    for ( let i = 0; i < this.userShowing.followers.length; i++){
      if ( this.userShowing.followers[i] === this.user.uid) {
        this.userShowing.followers.splice(i, 1);
      }
    }
    this.userService.user = this.userShowing;
    this.userService.onUpdateUser().then(
      () => {},
      () => {}
    );
  }

}
