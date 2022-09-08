import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { PostService } from 'src/app/services/post/post.service';
import { SnippetService } from 'src/app/services/snippet/snippet.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-show',
  templateUrl: './show.page.html',
  styleUrls: ['./show.page.scss'],
})
export class ShowPage implements OnInit, OnDestroy {
  public data = [ {i: 0}, {i: 0}, {i: 0}, {i: 0}, {i: 0}, {i: 0} ];
  public validation = false;
  public comment = null;
  public post: any;
  public subComment = null;
  public subComState = []; // state of sub comment
  public user = { displayName: null, photoURL: null };
  public loading = true;
  public erreur = null;
  slideOpts = {
    initialSlide: 1,
    speed: 400
  };
  constructor(public postService: PostService,
              public loadingController: LoadingController,
              public snip: SnippetService, public router: Router,
              public us: UserService,
              public notif: NotificationService, public userService: UserService) { }
  ngOnDestroy(): void {
    this.snip.postRestrict = false;
  }
  onShowPicture(image) {
    this.snip.showPicture(image);
  }
  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
    this.user.displayName = firebase.default.auth().currentUser.displayName;
    this.user.photoURL = firebase.default.auth().currentUser.photoURL ? firebase.default.auth().currentUser.photoURL : '../../../assets/imgs/user.png';
    if (this.postService.post){
      console.log(this.postService.post);
      if (this.postService.post.comments.length > 0) {
        this.postService.post.comments.forEach((element, index) => {
          this.subComState[index] = false;
        });
      }
      this.userService.onGetUser(this.postService.post.uid).then(
        (user: any) => {
          this.postService.post.displayName = user.displayName;
          this.postService.post.photoURL = user.photoURL;
          this.snip.postRestrict = true;
          this.post = this.postService.post;
          this.erreur = null;
          this.loading = false;
          this.us.onGetAllUsers().then(
            (users) => {
              console.log('All users', this.us.users);
              loading.dismiss();
            },
            (err) => {
              this.snip.postRestrict = true;
              this.post = this.postService.post;
              this.erreur = 'Error de cargar...';
              this.loading = false;
              loading.dismiss(); }
          );
        },
        () => {
          this.snip.postRestrict = true;
          this.post = this.postService.post;
          this.erreur = 'Error de cargar...';
          this.loading = false;
          loading.dismiss(); }
      );
    } else {
      loading.dismiss();
      this.loading = false;
      this.router.navigateByUrl('/tabs/tab1');
    }
  }

  onAddComment() {
    if (firebase.default.auth().currentUser.isAnonymous) {
      this.snip.onOpenRestrict();
   } else {
    const data = {
      date: Date.now(),
      postId: this.post.id,
      content: this.comment,
      userImage: firebase.default.auth().currentUser.photoURL ? firebase.default.auth().currentUser.photoURL : null,
      userName: firebase.default.auth().currentUser.displayName,
      uid: firebase.default.auth().currentUser.uid
    };
    this.post.comments.push(data);
    this.postService.post = this.post;
    this.postService.updatePost().then(
      () => {
        this.comment = null;
        const dat = {
          postId: this.post.id,
          content: 'dejó un comentario',
          image: this.post.medias ? this.post.medias.media1 : null,
          photoURL: firebase.default.auth().currentUser.photoURL,
          displayName: firebase.default.auth().currentUser.displayName,
          date: Date.now(),
          postUid: this.post.uid,
          commentUid: firebase.default.auth().currentUser.uid,
          read: false
        };
        if (this.post.uid !== firebase.default.auth().currentUser.uid) {
          this.notif.addNotification(dat).then(
            () => { this.updateCommented(this.post.id); },
            () => {}
          );
        } else { this.updateCommented(this.post.id); }
      },
      () => this.snip.toast('Problema de conexión. Inténtalo de nuevo')
     );
    }
  }

  onCheckText(text: string) {
    if (text.length > 0) {
      this.comment = text;
      this.validation = true;
    } else {
      this.comment =  null;
      this.validation = false;
    }
  }

  onContent(text: string) {
    if (text.length > 0) {
      this.comment = text;
      this.validation = true;
    } else {
      this.comment =  null;
      this.validation = false;
    }
  }

  checkLike() {
    if (firebase.default.auth().currentUser.isAnonymous) {
      return false;
   } else {
    if (this.post.likes.length === 0) {
      return false;
    } else {
      if (this.post.likes.includes(firebase.default.auth().currentUser.uid)) {
        return true;
      } else {
        return false;
      }
    }
  }
  }

  onAddLike() {
    if (firebase.default.auth().currentUser.isAnonymous) {
      this.snip.onOpenRestrict();
   } else {
    this.post.likes.push(firebase.default.auth().currentUser.uid);
    this.postService.post = this.post;
    this.postService.updatePost().then(
      () => {
        const data = {
          postId: this.post.id,
          content: 'Me gusta tu aporte',
          image: this.post.medias ? this.post.medias.media1 : null,
          photoURL: firebase.default.auth().currentUser.photoURL,
          displayName: firebase.default.auth().currentUser.displayName,
          date: Date.now(),
          postUid: this.post.uid,
          likeUid: firebase.default.auth().currentUser.uid,
          read: false
        };
        if (this.post.uid !== firebase.default.auth().currentUser.uid) {
          this.notif.addNotification(data).then(
            () => {},
            () => {}
          );
        }
      },
      () => this.snip.toast('Problema de conexión. Inténtalo de nuevo')
    );
   }
  }

  onRemoveLike() {
    for ( let i = 0; i < this.post.likes.length; i++){
      if ( this.post.likes[i] === firebase.default.auth().currentUser.uid) {
        this.post.likes.splice(i, 1);
      }
   }
    this.postService.post = this.post;
    this.postService.updatePost().then(
    () => {},
    () => this.snip.toast('Problema de conexión. Inténtalo de nuevo')
   );
  }

  onGetLength(arr: any[]) {
    if (!arr) {
      return 0;
    } else {
      return arr.length;
    }
  }

  onShowProfile(uid) {
    this.router.navigateByUrl(`/profile/${uid}`);
  }

  checkLengthText(text: string) {
    return this.snip.onLengthText(text);
   }
   getShortText(text: string) {
     return this.snip.onGetTextShort(text);
   }

   onChangeLong(i) {
     this.post.longText = !this.post.longText;
   }

   async updateCommented(postId) {
    this.userService.onGetUser(firebase.default.auth().currentUser.uid).then(
      (user: any) => {
        if (user.iCommented) {
          user.iCommented.push(postId);
        } else {
          user.iCommented = [`${postId}`];
        }
        this.userService.onUpdateUser().then(
        () => {},
        () => {}
        );
      },
      () => {}
    );
   }

   // SUB COMMENT
   onShowSub(i) {
     console.log('click', i);
     console.log('state', this.subComState[i]);
     this.subComState[i] = !this.subComState[i];
     console.log('state', this.subComState[i]);
   }

   onCheckTextSub(text: string) {
      if (text.length > 0) {
        this.subComment = text;
      } else {
        this.subComment = null;
      }
   }

   onAddSub(i) {
    if (firebase.default.auth().currentUser.isAnonymous) {
      this.snip.onOpenRestrict();
   } else {
     if (this.subComment) {
      const data = {
        date: Date.now(),
        postId: this.post.id,
        content: this.subComment,
        userImage: firebase.default.auth().currentUser.photoURL ? firebase.default.auth().currentUser.photoURL : null,
        userName: firebase.default.auth().currentUser.displayName,
        uid: firebase.default.auth().currentUser.uid
      };
      if (typeof this.post.comments[i].comments === 'undefined') {
        this.post.comments[i].comments = [];
        this.post.comments[i].comments[0] = data;
      } else {
        this.post.comments[i].comments.push(data);
      }
      this.postService.post = this.post;
      this.postService.updatePost().then(
        () => {
          this.subComment = null;
          const dat = {
            postId: this.post.id,
            content: 'respondió a un comentario',
            image: this.post.medias ? this.post.medias.media1 : null,
            photoURL: firebase.default.auth().currentUser.photoURL,
            displayName: firebase.default.auth().currentUser.displayName,
            date: Date.now(),
            postUid: this.post.uid,
            commentUid: firebase.default.auth().currentUser.uid,
            read: false
          };
          if (this.post.uid !== firebase.default.auth().currentUser.uid) {
            this.notif.addNotification(dat).then(
              () => { this.updateCommented(this.post.id); },
              () => {}
            );
          } else { this.updateCommented(this.post.id); }
        },
        () => this.snip.toast('Problema de conexión. Inténtalo de nuevo')
      );
      }
    }
   }

}
