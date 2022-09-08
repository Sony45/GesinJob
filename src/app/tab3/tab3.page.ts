import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';
import { PostService } from '../services/post/post.service';
import { SnippetService } from '../services/snippet/snippet.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  public error = false;
  public errors = null; // text
  public loading: any;
  public idsCategories = [];
  public categories: any[];
  initImg = null;
  afterImg = null;
  public post = { uid: null, categoryId: null, content: null, medias:
                { media1: null , media2: null, media3: null, media4: null, media5: null},
                  date: null };
  public restrict = false;
  constructor(public postService: PostService, public loadingController: LoadingController,
              private imageCompress: NgxImageCompressService,
              public snip: SnippetService, public router: Router, public location: Location) {}
  async ngOnInit(): Promise<void> {
    if (firebase.default.auth().currentUser.isAnonymous) {
      this.restrict = true;
    } else {
      if (this.postService.categories) {
        this.categories = this.postService.categories;
      } else {
        this.loading = await this.loadingController.create({
          message: 'Cargando...'
        });
        await this.loading.present();
        this.onGetCategories();
      }
    }
  }

  onContent(text: string) {
    if (text.length > 0) {
      this.post.content = text;
    } else {
      this.post.content =  null;
    }
  }

  async onAdd() {
    if (!this.post.content && !this.post.medias.media1) {
      this.snip.toast('Completa todos los campos');
    } else {
    this.loading = await this.loadingController.create({
      message: 'Añadiendo en progreso...'
    });
    await this.loading.present();
    if (this.idsCategories.length < 1) {
      this.errors = 'Por favor elija un departamento';
      this.loading.dismiss();
    } else if (!this.post.content && ! this.post.medias.media1) {
      this.errors = 'Agregue texto o imagen a tu publicación';
      this.loading.dismiss();
    } else {
      this.errors = null;
      this.post.date = Date.now();
      this.post.uid = firebase.default.auth().currentUser.uid;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.idsCategories.length; i++) {
        this.post.categoryId = this.idsCategories[i] ;
        this.postService.post = this.post;
        this.postService.addPost().then(
          () => { if (this.idsCategories.length === (i + 1)) {
            this.loading.dismiss(); this.snip.toast('Agregado exitosamente');
            this.router.navigateByUrl(`/tabs/list/${this.post.categoryId}`);
          } },
          () => {
            if (this.idsCategories.length === (i + 1)) {
              this.loading.dismiss(); this.snip.toast('Falló al cargar. Inténtalo de nuevo');
            }}
        );
      }

    }
   }
  }

  async handleFileInput(file = null) {
    this.imageCompress.uploadFile().then(({image, orientation}) => {
      this.imageCompress.compressFile(image, orientation, 50, 50).then(
        async (result) => {
          this.loading = await this.loadingController.create({
            message: 'Carga de imagen...'
          });
          await this.loading.present();
          this.snip.uploadFile(result).then(
            (url) => {
              console.log(url);
              if (!this.post.medias.media1) { this.post.medias.media1 = url; } else
              if (!this.post.medias.media2) { this.post.medias.media2 = url; } else
              if (!this.post.medias.media3) { this.post.medias.media3 = url; } else
              if (!this.post.medias.media4) { this.post.medias.media4 = url; } else
              if (!this.post.medias.media5) { this.post.medias.media5 = url; }
              console.log(this.post);
              this.loading.dismiss(); },
            () => { this.loading.dismiss(); this.snip.toast('Falló al cargar. Inténtalo de nuevo'); }
          );
        }
      );
    });
  }

  onCategory(text: any[]) {
    this.idsCategories = text;
  }

  onComment(text: string) {
    if (text.length > 0) {
       this.post.content = text;
    } else {
       this.post.content = null;
    }
  }

  onGetCategories() {
    firebase.default.firestore().collection('categories').get().then(
      (categ) => {
        if (categ.empty) {
          this.error = true;
          this.loading.dismiss();
        } else {
          // tslint:disable-next-line:prefer-const
          let arr = [];
          categ.docs.forEach(cat => {
            arr.push({id: cat.id, name: cat.data().name, image: cat.data().image  });
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

  onGoBack() {
    this.location.back();
  }

  compressFile() {
      this.imageCompress.uploadFile().then(({image, orientation}) => {
        this.initImg = image;
        console.warn('size in bytes was:', this.imageCompress.byteCount(image));
        this.imageCompress.compressFile(image, orientation, 50, 50).then(
          result => {
            this.afterImg = result;
            console.warn('size in bytes was:', this.imageCompress.byteCount(result));
          }
        );
      });
  }

}
