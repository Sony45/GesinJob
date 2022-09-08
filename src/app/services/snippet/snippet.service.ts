import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase';
import { RestrictionPage } from 'src/app/restriction/restriction.page';
import { ShowpicturePage } from 'src/app/showpicture/showpicture.page';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class SnippetService {
  public welcome = false;
  public loading: any;
  public postRestrict = false;
  public imageToShow = null;
  public textSearch = null;
  constructor(public toastController: ToastController, public router: Router,
              public modalController: ModalController, public loadingController: LoadingController,
              public userService: UserService) { }
  async toast(msg, time = 3000) {
    const toast = await this.toastController.create({
      message: msg,
      duration: time });
    toast.present();
  }

  capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  async showPicture(image) {
   this.imageToShow = image;
   const modal = await this.modalController.create({
    component: ShowpicturePage,
    cssClass: 'my-custom-class'
  });
   return await modal.present();
  }

  async onOpenRestrict() {
      const modal = await this.modalController.create({
        component: RestrictionPage,
        cssClass: 'my-custom-class'
      });
      return await modal.present();
  }

  // CHOOSE IMAGE LIBRARY
  onLibrary() {
    // let image: any;
    // const options: CameraOptions = {
    //   quality: 100,
    //   destinationType: this.camera.DestinationType.DATA_URL,
    //   encodingType: this.camera.EncodingType.JPEG,
    //   mediaType: this.camera.MediaType.PICTURE,
    //   targetWidth: 1000,
    //   targetHeight: 1000,
    //   sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    // };
    // this.camera.getPicture(options).then((imageData) => {
    //   // imageData is either a base64 encoded string or a file URI
    //   // If it's base64 (DATA_URL):
    //   image = 'data:image/jpeg;base64,' + imageData;
    //   }, (err) => {
    //   // Handle error
    //   });
    // return image;
  }
  //  CHOOSE IMAGE CAMERA
  onCamera() {
    // let image: any;
    // const options: CameraOptions = {
    //   quality: 100,
    //   destinationType: this.camera.DestinationType.DATA_URL,
    //   encodingType: this.camera.EncodingType.JPEG,
    //   mediaType: this.camera.MediaType.PICTURE,
    //   targetWidth: 1000,
    //   targetHeight: 1000,
    //   sourceType: this.camera.PictureSourceType.CAMERA
    // };
    // this.camera.getPicture(options).then((imageData) => {
    //   // imageData is either a base64 encoded string or a file URI
    //   // If it's base64 (DATA_URL):
    //   image = 'data:image/jpeg;base64,' + imageData;
    // }, (err) => {
    //   // Handle error
    // });
    // return image;
  }
  // UPLOAD  FILE
  uploadFile(file) {
    return new Promise(
      (resolve, reject) => {
      const storageRef = firebase.default.storage().ref();
      // Create a timestamp as filename
      const filename = Math.floor(Date.now() / 1000);
      // Create a reference to 'images/todays-date.jpg'
      const imageRef = storageRef.child(`usersPhotos/${filename}.jpg`);
      imageRef.putString(file, 'data_url')
          .then((snapshot) => {
                imageRef.getDownloadURL().then((url) => {
                  resolve(url); },
                  (err) => reject(err));
          },
          (err) => { reject(err); });
    });
}

uploadFiles(file) {
  return new Promise(
    (resolve, reject) => {
    const storageRef = firebase.default.storage().ref();
    // Create a timestamp as filename
    const filename = Math.floor(Date.now() / 1000);
    // Create a reference to 'images/todays-date.jpg'
    const imageRef = storageRef.child(`usersPhotos/${filename}.jpg`);
    imageRef.put(file).on(firebase.default.storage.TaskEvent.STATE_CHANGED,
      () => {
      }, (err) => { },
      () => resolve(imageRef.getDownloadURL()));
    });
}

  // DELETED FILE
  onDeleteFile(file) {
    const ref = firebase.default.storage().refFromURL(file);
    ref.delete().then(
      () => {},
      () => {
        const data = {deleteFile: file, date: new Date() };
        firebase.default.firestore().collection('errors').add(
          JSON.parse(JSON.stringify(data))
        );
      }
    );
  }

  //  GET DATE WITH TIMESTAMP
  getDate(timestamp) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = new Date(timestamp). toLocaleDateString('fr-FR', options);
    const date = dateString.split(' ');
    const day = date[1];
    const month = date[2];
    const year = date[3];
    // const day = date.getDate();
    // const month = date. toDateString().substring(4, 7);
    // const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  //  GET HOUR WITH TIMESTAMP
  getTime(timestamp) {
    const dateString = new Date(timestamp).toLocaleTimeString('fr-FR');
    const date = dateString.split(':');
    const hour = date[1];
    const minutes = date[2];
    const second = date[3];
    // const day = date.getDate();
    // const month = date. toDateString().substring(4, 7);
    // const year = date.getFullYear();
    return `${hour}:${minutes}`;
  }

  getHoursMinute(timestamp) {
    const date: Date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}`;
  }

  // get short text from long
  onGetTextShort(text: string) {
    return text.substring(0, 250);
  }

  // test if it's a long text
  onLengthText(text: string) {
  return (text.length > 250) ? true : false;
  }

  async Initialise() {
    this.loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await this.loading.present();
    if (firebase.default.auth().signInAnonymously) {
     // this.onGetCategories();
    } else {
     await this.onGetUser();
    }
  }

  async onGetUser() {
    await this.userService.onGetUser(firebase.default.auth().currentUser.uid).then(
      () => { // this.onGetCategories();
            },
      (err) => {
        if (err === 'empty') {
           this.loading.dismiss();
           this.router.navigateByUrl('/missed');
        } else {
          this.loading.dismiss();
          this.toast('Error al cargar, inténtalo de nuevo');
        }
      }
    );
  }
}
