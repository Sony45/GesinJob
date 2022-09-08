import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { PostService } from 'src/app/services/post/post.service';
import { SnippetService } from 'src/app/services/snippet/snippet.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit, OnDestroy {
  public posts: any;
  public loading: any;
  public categoryId: any;
  public dataLoader = [{i: 0}, {i: 0}, {i: 0}, {i: 0}, {i: 0}, {i: 0}, {i: 0}];
  public error = null;
  public user: any;
  public loader = false;
  slideOpts = {
    initialSlide: 1,
    speed: 400
  };
  constructor(private actRoute: ActivatedRoute, public router: Router,
              public loadingController: LoadingController, public notif: NotificationService,
              public postService: PostService, public snip: SnippetService) { }
  ngOnDestroy(): void {
    this.snip.postRestrict = false;
  }

  onShowPicture(image) {
    this.snip.showPicture(image);
  }
  async ngOnInit() {
    if (!this.actRoute.snapshot.params.categoryId) {
       this.router.navigateByUrl('/tabs/tab1');
    } else {
      this.snip.postRestrict = true;
      this.loading = await this.loadingController.create({
        message: 'Cargando...'
      });
      await this.loading.present();
      this.categoryId = this.actRoute.snapshot.params.categoryId;
      this.onGetPosts();
    }
  }

  onSearchChange(text: string) {
    this.loader = true;
    // this.postService.getSearchPosts(text).then(
    //   (pos) => { this.posts = pos; this.error = null;
    //              this.loader = false; },
    //   (err) => { if (err === 'empty') { this.error = 'Ninguna publicación en esta categoría'; } else
    //              { this.error = 'Error al cargar, actualice la página.'; }
    //              this.loader = false; }
    // );

    this.posts = [];
    firebase.default.firestore().collection('posts').orderBy('date', 'desc').get().then(
      (posts) => {
              if (posts.empty) {
                this.error = 'Ninguna publicación';
                this.loader = false;
              } else {
                posts.docs.forEach((post, i) => {
                    if (post.data().content) {
                      const str: string = post.data().content.toLowerCase();
                      if (str.search(text.toLowerCase()) !== -1) {
                      firebase.default.firestore().collection('users').where('uid', '==', post.data().uid).limit(1).get().then(
                        (users) => { const user = users.docs[0];
                                     this.posts.push({
                                  id: post.id,
                                  content: post.data().content,
                                  date: post.data().date,
                                  medias: typeof post.data().medias !== 'undefined' ? post.data().medias : null,
                                  uid: post.data().uid,
                                  photoURL: typeof user.data().photoURL !== 'undefined' ? user.data().photoURL : null,
                                  displayName: typeof user.data().displayName !== 'undefined' ? user.data().disiplayName : null,
                                  likes: typeof post.data().likes !== 'undefined' ? post.data().likes : [],
                                  comments: typeof post.data().comments !== 'undefined' ? post.data().comments : []
                                                });
                                     if ((i + 1) === posts.docs.length) {
                                      this.error = null;
                                      this.loader = false;
                                    }
                      });
                    } else {
                      if ((i + 1) === posts.docs.length) {
                        this.error = null;
                        this.loader = false;
                       }
                    }
                    } else {
                      if ((i + 1) === posts.docs.length) {
                        this.error = null;
                        this.loader = false;
                       }
                    }
                });
                this.error = null;
                this.loader = false;
              }
      },
      () => {
        this.error = 'Error al cargar, actualice la página.';
        this.loader = false;
      }
    );
  }

  onGetPosts() {
     this.postService.getPosts(this.categoryId).then((pos) => { 
        this.posts = pos; 
        this.posts.sort(function(a,b) {
          if(a.date<b.date)
            return 1;
            else if (a.date>b.date)
            return -1;
            else
            return 0;
        });
        console.log(this.posts); 
        this.error = null; 
        this.loading.dismiss(); 
      },
       (err) => { if (err === 'empty') { this.error = 'Ninguna plaza en este departamento'; }
                  else { this.error = 'Error al cargar, actualice la página.'; }
                  this.loading.dismiss(); }
     );
  }

  onGetPostsNext() {
    this.postService.getPostsNext(this.categoryId, this.posts).then(
      (pos) => { this.posts = pos; },
      () => { }
    );
  }

  async doRefresh(event) {
    this.loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await this.loading.present();
    await this.onGetPosts();
    this.loading.dismiss();
    event.target.complete();
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

  checkLengthText(text: string) {
   return this.snip.onLengthText(text);
  }

  getShortText(text: string) {
    return this.snip.onGetTextShort(text);
  }

  onChangeLong(i) {
    this.posts[i].longText = !this.posts[i].longText;
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
