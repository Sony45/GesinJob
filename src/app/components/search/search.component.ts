import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { PostService } from 'src/app/services/post/post.service';
import { SnippetService } from 'src/app/services/snippet/snippet.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  // @Input() tex: string;
  users: any[] = [];
  error = {users: null, posts: null};
  loader: boolean;
  posts: any[] = [];
  currentText = null;
  constructor(public userService: UserService, public postService: PostService,
              public snip: SnippetService, public router: Router, public notif: NotificationService) { }
  ngOnDestroy(): void {
    this.posts = [];
    this.users = [];
  }

  ngOnInit() {
    this.currentText = this.snip.textSearch;
    this.onSearch();
  }

  onSearch() {
    this.onSearchPosts().then(
      () => this.onSearchUsers().then(() => {}, () => {}),
      () => this.onSearchUsers().then(() => {}, () => {})
    );
  }

  onSearchUsers() {
    return new Promise((resolve, reject) => {
      this.users = [];
      firebase.default.firestore().collection('users').get().then(
        (users) => {
                if (users.empty) {
                  this.error.users = 'Usuario no encontrado';
                  reject('erreur');
                } else {
                  users.docs.forEach(user => {
                    if (user.data().displayName) {
                      const str: string = user.data().displayName.toLowerCase();
                      if (str.search(this.snip.textSearch.toLowerCase()) !== -1) {
                        this.users.push(user.data());
                      }
                    }
                  });
                  resolve('ok');
                }
        },
        () => {
          this.error.users = 'Error al cargar, actualice la página.';
          reject('erreur');
        }
      );
    });
    // this.userService.getSearchUsers(this.tex).then(
    //   (pos: any[]) => {  if (pos.length === 0) { this.users = pos; this.error = 'Usuario no encontrado'; this.loader = false; }
    //                      else {this.users = pos; this.error = null;
    //                     // tslint:disable-next-line:align
    //                     this.loader = false; } },
    //   (err) => { if (err === 'empty') { this.error = 'Usuario no encontrado'; } else
    //              { this.error = 'Error al cargar, actualice la página.'; }
    //              this.loader = false; }
    // );
  }

  onSearchPosts() {
    return new Promise((resolve, reject) => {
      this.posts = [];
      firebase.default.firestore().collection('posts').orderBy('date', 'desc').get().then(
        (posts) => {
                if (posts.empty) {
                  this.error.posts = 'Ninguna publicación';
                  reject('erreur');
                } else {
                  posts.docs.forEach((post, i) => {
                      if (post.data().content) {
                        const str: string = post.data().content.toLowerCase();
                        if (str.search(this.snip.textSearch.toLowerCase()) !== -1) {
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
                                                    resolve(posts);
                                      }
                        });
                      } else {
                        if ((i + 1) === posts.docs.length) {
                          resolve(posts);
                         }
                      }
                      } else {
                        if ((i + 1) === posts.docs.length) {
                          resolve(posts);
                         }
                      }
                  });
                  resolve('ok');
                }
        },
        () => {
          this.error.users = 'Error al cargar, actualice la página.';
          reject('erreur');
        }
      );
    });
    // this.postService.getSearchPosts(this.tex).then(
    //   (pos) => { this.posts = pos; this.error = null;
    //              this.loader = false; },
    //   (err) => { if (err === 'empty') { this.error = 'Ninguna publicación en esta categoría'; } else
    //              { this.error = 'Error al cargar, actualice la página.'; }
    //              this.loader = false; }
    // );
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
          content: 'Comento tu aporte',
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

  onChat(uid) {
    this.router.navigateByUrl(`/chat/${uid}`);
  }

}
