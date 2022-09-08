import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ModalController, LoadingController, ActionSheetController } from '@ionic/angular';
import * as firebase from 'firebase';
import { Subscription } from 'rxjs';
import { Post } from 'src/app/models/post';
import { AuthService } from 'src/app/services/auth/auth.service';
import { PostService } from 'src/app/services/post/post.service';
import { SnippetService } from 'src/app/services/snippet/snippet.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage  implements OnInit, OnDestroy {
  public subs: Subscription;
  public post: Post;
  public loader = { image: false };
  public error = { content: null };
  public validation = false;

  constructor(public plt: Platform, public location: Location, public modalController: ModalController,
              public userService: UserService, public router: Router,
              public postService: PostService, public snips: SnippetService, public loading: LoadingController,
              public authService: AuthService, public actionSheetController: ActionSheetController ) {
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit() {
    if (firebase.default.auth().currentUser.isAnonymous) {
      this.router.navigateByUrl('/restriction');
   } else {
    this.postService.onGetPost(this.postService.id).then(
      () => { this.post = this.postService.post; },
      () => { this.snips.toast('Echec de connexion...'); }
    );
   }
  }

  goBack() {
    this.modalController.dismiss();
  }

  onCheckContent(value) {
      this.error.content  = null;
      this.post.content = value;
      this.validation = true;
  }

  async onAddPost() {
    const loading = await this.loading.create({
      message: ''
    });
    await loading.present();
    if (this.post.content.length < 8) {
      this.error.content = 'Veuillez donner un peu de detail';
      this.validation = false;
      loading.dismiss();
    } else
    {
      this.post.uid = firebase.default.auth().currentUser.uid;
      this.post.date = Date.now();
      this.post.createAt = new Date();
      this.postService.addPost().then(
        () => {
          this.snips.toast('Post publiée!', 3000);
          this.router.navigateByUrl('/tabs/tab1');
          loading.dismiss();
        },
        (err) => {
          this.snips.toast('Une erreur est survenue. Reessayez!!!');
          this.validation = false;
          loading.dismiss();
        }
      );
    }
  }

  // UPLOAD IMAGE
  async onImage() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choisir une image',
      buttons: [ {
        text: 'Depuis la galérie',
        icon: 'image-sharp',
        handler: () => {
          this.onUploadIMG(this.snips.onLibrary());
        }
      }, {
        text: 'Prendre une photo',
        icon: 'camera-sharp',
        handler: () => {
          this.onUploadIMG(this.snips.onCamera());
        }
      }]
    });
    await actionSheet.present();
  }

  onUploadIMG(file) {
    this.loader.image = true;
    this.snips.uploadFile(file).then(
      (url) => {
        let oldImg: any;
        if (this.post.medias.media1) {
          oldImg = this.post.medias.media1;
        }
        this.post.medias.media1 = url;
        this.authService.updateUser(this.userService.user).then(
          () => {
                this.loader.image = false;
                if (oldImg) {
                  this.snips.onDeleteFile(oldImg);
                  this.snips.toast('Image modifié!');
                }
          },
          () => {
            this.loader.image = false;
            this.snips.toast('Erreur de fichier. Reessayez!!!'); }
        );
        this.post.medias.media1 = url;
        this.loader.image = false;
      }, () => {
        this.loader.image = false;
        this.snips.toast('Erreur de fichier. Reessayez!!!');
      }
    );
  }

}
