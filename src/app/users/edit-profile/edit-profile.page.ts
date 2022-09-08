import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import * as firebase from 'firebase';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SnippetService } from '../../services/snippet/snippet.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  public error = { main: null, email: null, name: null, bio: null, password: null, phone: null };
  public formData = { email: null, name: null, bio: null, password: null, phone: null };
  public user: any;
  public loading = true;
  public bio: any;
  public uploading = false;
  constructor(public snip: SnippetService, public location: Location,
              public authService: AuthService, public userService: UserService,
              public loader: LoadingController, public router: Router, public navCtrl: NavController) { }

  ngOnInit() {
    if (firebase.default.auth().currentUser.isAnonymous) {
      this.router.navigateByUrl('/restriction');
   } else {
    this.userService.onGetUser(firebase.default.auth().currentUser.uid).then(
      (user: User) => { this.user = user; this.userService.user = user;
                        this.bio = this.user.bio ? this.user.bio : ''; this.loading = false; },
      () => { this.error.main = 'No se pudo cargar, inténtalo de nuevo.'; this.loading = false; }
    );
   }
  }

  checkName(text: string) {
    if (text.length === 0) {
      this.error.name = 'Este campo es obligatorio';
    } else {
      this.error.name = null;
      this.formData.name = text;
    }
  }

  checkEmail(text: string) {
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (text.length === 0) {
      this.error.email = 'Este campo es obligatorio';
      this.formData.email = null;
    } else if (!text.match(mailformat)) {
       this.error.email = 'Formato de correo electrónico incorrecto';
       this.formData.email = null;
    }else {
      this.error.email = null;
      this.formData.email = text;
    }
  }

  checkBio(text: string) {
      this.formData.bio = text;
  }

  checkPassword(text: string) {
    if (text.length === 0) {
      this.error.password = 'Esta campo es obligatorio';
      this.formData.password = null;
    }
    else if (text.length  < 6) {
      this.error.password = 'la contraseña debe contener al menos 6 caracteres';
      this.formData.password = null;
    } else {
      this.error.password = null;
      this.formData.password = text;
    }
  }

  checkPhone(num: number){
    if (num !== null) {
      this.formData.phone = num;
    }
  }

  async onSave() {
    const loading = await this.loader.create({
       message: 'Cargando...'
     });
    await loading.present();
    if (this.formData.name) {
      this.userService.user.displayName = this.formData.name;
      await this.authService.updateUser({displayName: this.formData.name}).then(
        () => {},
        () => {}
      );
    }

    if (this.formData.email) {
        this.userService.user.email = this.formData.email;
        await this.authService.onUpdateEmail(this.formData.email).then(
          () => {
          },
          () => {}
        );
    }

    if (this.formData.password) {
      await this.authService.onUpdatePassword(this.formData.password).then(
        () => { },
        () => { }
      );
    }

    if (this.formData.phone) {
      this.userService.user.phoneNumber = this.formData.phone;
      await this.authService.updateUser({phoneNumber: this.formData.phone}).then(
        () => {},
        () => {}
      );
    }

    if (this.formData.bio) {
      this.userService.user.bio = this.formData.bio;
    }

    this.userService.onUpdateUser().then(
      () => {  this.snip.toast('Actualizado');
               loading.dismiss(); },
      () => {   this.snip.toast('Error al cargar, inténtalo de nuevo.', 3000);
                loading.dismiss(); }
    );
  }

  onGoBack() {
    this.location.back();
  }

  handleFileInput(files) {
    this.uploading = true;
    this.snip.uploadFiles(files.item(0)).then(
      (url) => { this.userService.user.photoURL = url;
                 this.authService.updateUser({ photoURL:url}).then(
                   () => this.userService.onUpdateUser().then(
                     () => { this.user = this.userService.user;
                             this.snip.toast('Foto actualizada'); 
                             this.uploading = false; 
                            },
                     () => {  
                       this.snip.toast('Error de carga, inténtalo de nuevo'); 
                       this.uploading = false; 
                      }
                   ),
                   () => {  
                     this.snip.toast('Error de carga, inténtalo de nuevo'); 
                     this.uploading = false; }
                 ); 
                },

      () => {  this.snip.toast('Error de carga, inténtal'); 
      this.uploading = false; }
    );
}

}
