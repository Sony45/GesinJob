import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { PostService } from 'src/app/services/post/post.service';
import { SnippetService } from 'src/app/services/snippet/snippet.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
  @Input() uid: string;
  @Input() name: string;
  public posts = [];
  public loading: any;
  public categoryId: any;
  public dataLoader = [{i: 0}, {i: 0}, {i: 0}, {i: 0}, {i: 0}, {i: 0}, {i: 0}];
  public error = null;
  public user: any;
  public loader = true;
  slideOpts = {
    initialSlide: 1,
    speed: 400
  };
  constructor(public router: Router, public userService: UserService,
              public loadingController: LoadingController, public notif: NotificationService,
              public postService: PostService, public snip: SnippetService) { }

  ngOnInit() {
    if (this.name === 'userPosts') {
      this.onGetUserPosts();
    } else if (this.name === 'userComments') {
      this.onGetComments();
    } else if (this.name === 'userLibrairy') {
      this.onLibrairy();
    }
  }

  onGetUserPosts() {
     this.postService.getUserPosts(this.uid).then(
       (pos: any[]) => { this.posts = pos;
                         this.error = null; this.loader = false; },
       (err) => { if (err === 'empty') { this.error = 'No tienes ninguna publicación'; }
                  else { this.error = 'Error al cargar, actualice la página.'; }
                  this.loader = false; }
     );
  }

  onGetPostsNext() {
    this.postService.getUserPosts(this.uid).then(
      (pos: any[]) => { this.posts = pos; },
      () => { }
    );
  }

  onGetPostsCommented() {
    this.userService.onGetUser(this.uid).then(
      (user: any) => { if (user.iCommented) {
                          this.postService.getPostsCommented(user.iCommented).then(
                            (pos: any[]) => { this.posts = pos;  this.error = null;  },
                            () => { }
                          );
                       } else {
                        this.error = 'No hay artículos comentados';
                        this.loader = false;
                       }
      },
      () => { this.error = 'Error al cargar, actualice la página.';
              this.loader = false; }
    );
  }

  onGetComments() {
    this.postService.getMyComments(this.uid).then(
      (comments: any[]) => {
        if (comments.length === 0) {
          this.error = 'No hay artículos comentados';
          this.loader = false;
        } else {
          this.posts = [];
          this.userService.onGetUser(this.uid).then(
            (user: any) => {
              comments.forEach(com => {
                this.posts.push({
                    uid: com.uid,
                    photoURL: user.photoURL ? user.photoURL : null,
                    displayName: user.displayName ? user.displayName : null,
                    content: com.content,
                    postId: com.postId ? com.postId : null,
                    longText: false,
                    medias: { media1: null }
                   });
                });
              this.error = null;
              this.loader = false;
            },
            () => {
              this.error = 'Error al cargar, actualice la página.';
              this.loader = false;
            }
          );
        }
      },
      (err) => { this.error = 'Error al cargar, actualice la página.';
                 this.loader = false; }
    );
  }

  onShowPicture(image) {
    this.snip.showPicture(image);
  }

  async loadData(event) {
    if (!Number.isInteger(this.posts.length / 20)) {
      event.target.disabled = true;
    } else {
      await this.onGetPostsNext();
      event.target.complete();
    }
  }

  onShow(i) {
    this.postService.post = this.posts[i];
    this.router.navigateByUrl('/show');
  }

  checkLike(i) {
    if (firebase.default.auth().currentUser.isAnonymous) {
      return false;
   } else {
    if (this.posts[i].likes.length === 0) {
      return false;
    } else {
      if (this.posts[i].likes.includes(firebase.default.auth().currentUser.uid)) {
        return true;
      } else {
        return false;
      }
    }
  }
  }

  onAddLike(i) {
    if (firebase.default.auth().currentUser.isAnonymous) {
      this.snip.onOpenRestrict();
   } else {
      this.posts[i].likes.push(firebase.default.auth().currentUser.uid);
      this.postService.post = this.posts[i];
      this.postService.updatePost().then(
        () => { const data = {
          postId: this.posts[i].id,
          content: 'Me gusta tu aporte',
          image: this.posts[i].medias ? this.posts[i].medias.media1 : null,
          photoURL: firebase.default.auth().currentUser.photoURL,
          displayName: firebase.default.auth().currentUser.displayName,
          date: Date.now(),
          postUid: this.posts[i].uid,
          likeUid: firebase.default.auth().currentUser.uid,
          read: false
        };
                if (this.posts[i].uid !== firebase.default.auth().currentUser.uid) {
                this.notif.addNotification(data).then(
                  () => {},
                  () => {}
                );
        } },
        () => this.snip.toast('Problema de conexión. Inténtalo de nuevo')
      );
   }
  }

  onRemoveLike(ii) {
    for ( let i = 0; i < this.posts[ii].likes.length; i++){
      if ( this.posts[ii].likes[i] === firebase.default.auth().currentUser.uid) {
        this.posts[ii].likes.splice(i, 1);
      }
   }
    this.postService.post = this.posts[ii];
    this.postService.updatePost().then(
    () => { },
    () => this.snip.toast('Problema de conexión. Inténtalo de nuevo')
   );
  }

  onGetLength(arr: any[]) {
    return arr.length;
  }

  onShowProfile(uid) {
    this.router.navigateByUrl(`/profile/${uid}`);
  }

  async onShowPost(postId) {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
    this.postService.onGetPost(postId).then(
      (post) => { this.postService.post = post; loading.dismiss();
                  this.router.navigateByUrl('/show'); },
      () => {  loading.dismiss(); this.snip.toast('Falló al cargar. ¡Inténtalo de nuevo!'); }
    );
  }

  checkLengthText(text: string) {
   return this.snip.onLengthText(text);
  }
  getShortText(text: string) {
    return this.snip.onGetTextShort(text);
  }

  onChangeLong(i) {
    this.posts[i].longText = !this.posts[i].longText;
  }

  onLibrairy() {
    this.postService.onGetLibrairy().then(
      (pos: any[]) => { this.posts = pos;
                        this.error = null; this.loader = false; },
      (err) => { if (err === 'empty') { this.error = 'Librería vacía'; }
                 else { this.error = 'Error al cargar, actualice la página.'; }
                 this.loader = false; }
    );
  }


/* SAVE */
  onAddSave(i) {
    if (firebase.default.auth().currentUser.isAnonymous) {
      this.snip.onOpenRestrict();
   } else {
      this.posts[i].saves.push(firebase.default.auth().currentUser.uid);
      this.postService.post = this.posts[i];
      this.postService.updatePost().then(
        () => { const data = {
          postId: this.posts[i].id,
          content: 'agregó su publicación en la librería',
          image: this.posts[i].medias ? this.posts[i].medias.media1 : null,
          photoURL: firebase.default.auth().currentUser.photoURL,
          displayName: firebase.default.auth().currentUser.displayName,
          date: Date.now(),
          postUid: this.posts[i].uid,
          saveUid: firebase.default.auth().currentUser.uid,
          read: false
        };
                if (this.posts[i].uid !== firebase.default.auth().currentUser.uid) {
                this.notif.addNotification(data).then(
                  () => {},
                  () => {}
                );
        } },
        () => this.snip.toast('Problema de conexión. Inténtalo de nuevo')
      );
   }
  }

  onRemoveSave(ii) {
    for ( let i = 0; i < this.posts[ii].saves.length; i++){
      if ( this.posts[ii].saves[i] === firebase.default.auth().currentUser.uid) {
        this.posts[ii].saves.splice(i, 1);
      }
   }
    this.postService.post = this.posts[ii];
    this.postService.updatePost().then(
    () => { },
    () => this.snip.toast('Problema de conexión. Inténtalo de nuevo')
   );
  }

  checkSave(i) {
    if (firebase.default.auth().currentUser.isAnonymous) {
      return false;
   } else {
    if (this.posts[i].saves.length === 0) {
      return false;
    } else {
      if (this.posts[i].saves.includes(firebase.default.auth().currentUser.uid)) {
        return true;
      } else {
        return false;
      }
    }
  }
  }


}
