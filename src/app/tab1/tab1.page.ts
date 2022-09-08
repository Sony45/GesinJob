import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';
import { NotificationService } from '../services/notification/notification.service';
import { PostService } from '../services/post/post.service';
import { PwaService } from '../services/pwa/pwa.service';
import { SnippetService } from '../services/snippet/snippet.service';
import { UserService } from '../services/user/user.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  public showBtn = false;
  slideOpts = {
    initialSlide: 1,
    speed: 400
  };
  public deferredPrompt;
  public categories: any[];
  users: any[] = [];
  public erreur = {users: null, posts: null};
  loader: boolean;
  posts: any[] = [];
  public loading: any;
  public error = false;
  public search = false;
  public searching = false;
  public imageFond = 'https://firebasestorage.googleapis.com/v0/b/orange-eaad6.appspot.com/o/bg.jpg?alt=media&token=313f1f28-66a6-48b9-b158-777a8f423dc8';
  public textSearch: string;
  constructor(public userService: UserService, public router: Router,
              public postService: PostService,
              public Pwa: PwaService, public alertController: AlertController,
              public notif: NotificationService,
              public snip: SnippetService, public loadingController: LoadingController) {}
  async ngOnInit() {
    await this.snip.Initialise();
    await this.onGetCategories();
    this.loadingController.dismiss();
  }

  installPwa(): void {
    this.Pwa.promptEvent.prompt();
  }

  onDayMsg() {
    this.snip.welcome = true;
  }

  onShow(id) {
    this.router.navigateByUrl(`/tabs/list/${id}`);
  }
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Add to Home Screen',
      message: '<img src=\"../../assets/imgs/logo40x40.png\"/> <h4><strong>GesinJob</strong></h4>',
      buttons: [
        {
          text: 'Anular',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Instalar',
          handler: () => {
            this.add_to_home();
          }
        }
      ]
    });

    await alert.present();
    return 'tesy';
  }

  async onGetCategories() {
    firebase.default.firestore().collection('categories').get().then(
      (categ) => {
        if (categ.empty) {
          this.error = true;
          this.loading.dismiss();
        } else {
          // tslint:disable-next-line:prefer-const
          let arr = [];
          categ.docs.forEach(cat => {
            arr.push({id: cat.id, name: cat.data().name, image: cat.data().image});
          });
          this.categories = arr;
          this.postService.categories = this.categories;
          this.error = false;
          this.loading.dismiss();
        }
      },
      () => {
        this.error = true;
        this.loading.dismiss();
      }
    );
  }

  async doRefresh(event) {
    this.loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await this.loading.present();
    await this.onGetCategories();
    event.target.complete();
  }

  async Initialise() {
    this.loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await this.loading.present();
    if (firebase.default.auth().signInAnonymously) {
      this.onGetCategories();
    } else {
      this.userService.onGetUser(firebase.default.auth().currentUser.uid).then(
        () => { this.onGetCategories(); },
        (err) => {
          if (err === 'empty') {
             this.loading.dismiss();
             this.router.navigateByUrl('/missed');
          } else {
            this.loading.dismiss();
            this.snip.toast('Error al cargar, inténtalo de nuevo');
          }
        }
      );
    }
  }


  ionViewWillEnter(){
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later on the button event.
      this.deferredPrompt = e;
    // Update UI by showing a button to notify the user they can add to home screen
      this.showBtn = true;
    });
    // button click event to show the promt
    window.addEventListener('appinstalled', (event) => {
    //  alert('installed');
    });
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // alert('display-mode is standalone');
    }
  }

  add_to_home(){
    // debugger;
    // hide our user interface that shows our button
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          alert('User accepted the prompt');
        } else {
          alert('User dismissed the prompt');
        }
        this.deferredPrompt = null;
      });
  }

  onSearchChange(text: string) {
    this.searching = false;
    // tslint:disable-next-line:curly
    if (text !== null && text.length > 0) {
      this.searching = false;
      this.snip.textSearch = text;
      this.searching = true;
      this.onSearch();
    } else{
      this.searching = false;
    }
  }

  onCancel() {
    this.searching = false;
    this.search = false;
  }

  // SEARCH
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
                  this.erreur.users = 'Usuario no encontrado';
                  reject('erreur');
                } else {
                  this.users = [];
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
          this.erreur.users = 'Error al cargar, actualice la página.';
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
                  this.erreur.posts = 'Ninguna publicación';
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
          this.erreur.users = 'Error al cargar, actualice la página.';
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

  onShowPost(i) {
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
          content: 'Me gusta',
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

  onShowPicture(image) {
    this.snip.showPicture(image);
  }

}
