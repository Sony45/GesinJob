import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, NavController } from '@ionic/angular';
import * as firebase from 'firebase';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SnippetService } from 'src/app/services/snippet/snippet.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-info-missed',
  templateUrl: './info-missed.page.html',
  styleUrls: ['./info-missed.page.scss'],
})
export class InfoMissedPage implements OnInit {
  public validation = false;
  public error = { name: null, email: null, password: null, phone: null };
  public imgAdded: false;
  public loading = false;
  public userForm: FormGroup;
  public user = { uid: null, displayName: null, email: null };
  public formData = { name: null, email: null, password: null, phone: null };
  constructor(public formBuilder: FormBuilder, public loader: LoadingController,
              public userService: UserService, public authService: AuthService,
              public navCtrl: NavController, public snip: SnippetService) { }

  ngOnInit() {
    this.initForm();
    this.user.displayName = firebase.default.auth().currentUser ? firebase.default.auth().currentUser.displayName : null;
    this.user.email = firebase.default.auth().currentUser ? firebase.default.auth().currentUser.email : null;

  }

  initForm() {
    this.userForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required, Validators.email]
    });
  }

  handleFileInput(event) {

  }

  checkName(text: string) {
    if (text.length === 0) {
      this.error.name = 'Esta campo es obligatorio';
      this.user.displayName = null;
    } else {
      this.error.name = null;
      this.formData.name = text;
      this.user.displayName = text;
    }
  }

  checkEmail(text: string) {
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (text.length === 0) {
      this.error.email = 'Esta campo es obligatorio';
      this.user.email = null;
    } else if (!text.match(mailformat)) {
       this.error.email = 'Formato de correo electrónico incorrecto';
       this.user.email = null;
    }else {
      this.error.email = null;
      this.formData.email = text;
      this.user.email = text;
    }
  }

  onValidation() {
    if (this.user.displayName && this.user.email) {
      this.validation = true;
    } else {
      this.validation = false;
    }
  }

  async onRegister() {
    if (!this.user.displayName || !this.user.email) {
      this.snip.toast('Completa todos los campos');
    } else {
    const loading = await this.loader.create({
       message: 'Cargando...'
     });
    await loading.present();
    this.user.uid = firebase.default.auth().currentUser.uid;
    this.userService.user = this.user;
    this.userService.onAddUser().then(
          (dat) => { this.snip.toast('Estas registrado');
                     loading.dismiss();
                     this.navCtrl.navigateRoot('/tabs/tab1');
          }, () => {
            loading.dismiss();
            this.navCtrl.navigateRoot('/tabs/tab1');
          }
        );
   }
  }
}
