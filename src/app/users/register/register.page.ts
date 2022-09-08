import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import * as firebase from 'firebase';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SnippetService } from 'src/app/services/snippet/snippet.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  public validation: boolean;
  public error = { name: null, email: null, password: null, phone: null };
  public imgAdded: false;
  public loading = false;
  public userForm: FormGroup;
  public user = { uid: null, displayName: null, email: null, phoneNumber: null };
  public formData = { name: null, email: null, password: null, phone: null };
  constructor(public formBuilder: FormBuilder, public loader: LoadingController,
              public userService: UserService, public authService: AuthService,
              public navCtrl: NavController, public snip: SnippetService,
              public location: Location, public router: Router,
              public alertController: AlertController) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required, Validators.email],
      password: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  handleFileInput(event) {

  }

  async terminos() {
    const alert = await this.alertController.create({
      cssClass: 'alerta',
      header: 'Terminos y condiciones',
      subHeader: 'GesinJob',
      message: '1. Recibimos, recopilamos y almacenamos cualquier información que ingrese a GesinJob o nos brindes.<br> 2. ¿porque? para brindar a nuestros usuarios asistencia continua y soporte técnico - Para cumplir con las leyes y regulaciones aplicables. <br> 3.no publiques contenido falso o violento, nos reservamos el derecho de bloquear tu cuenta <br> 4. para cerrar tu cuenta contáctanos a gesinjob@gmail.com',
      buttons: ['acepto']
    });
    await alert.present();
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
    } else if (!text.match(mailformat)) {
       this.error.email = 'Formato de correo electrónico incorrecto';
    }else {
      this.error.email = null;
      this.formData.email = text;
    }
  }

  checkPassword(text: string) {
    if (text.length === 0) {
      this.error.password = 'Este campo es obligatorio';
    }
    else if (text.length  < 6) {
      this.error.password = 'la contraseña debe contener al menos 6 caracteres';
    } else {
      this.error.password = null;
      this.formData.password = text;
    }
  }

  checkPhone(num: number){

  }

  async onRegister() {
    const loading = await this.loader.create({
       message: 'Cargando...'
     });
    await loading.present();
    this.user.displayName = this.formData.name;
    this.user.email = this.formData.email;
    if (this.formData.phone) { this.user.phoneNumber = this.formData.phone; }
    this.authService.signUpUser(this.formData.email, this.formData.password).then(
      (uid) => {
        this.user.uid = uid;
        this.userService.user = this.user;
        this.userService.onAddUser().then(
          (dat) => { this.snip.toast('¡Bienvenido a GesinJob!');
                     loading.dismiss();
                     this.navCtrl.navigateRoot('/tabs/tab1');
          }, () => {
            loading.dismiss();
            this.navCtrl.navigateRoot('/tabs/tab1');
          }
        );
      },
      () => {
        this.snip.toast('Error al cargar, inténtalo de nuevo.', 3000);
        loading.dismiss();
      }
    );
  }

  async onGoogle() {
    const loading = await this.loader.create({
      message: 'Cargando...'
    });
    await loading.present();
    this.authService.GoogleAuth().then(
      async (user) => {
        this.userService.onGetUser(firebase.default.auth().currentUser.uid).then(
          () => {
            loading.dismiss();
            this.navCtrl.navigateRoot('/tabs/tab1');
                },
          (err) => {
            if (err === 'empty') {
              this.user.uid = firebase.default.auth().currentUser.uid;
              this.user.displayName = firebase.default.auth().currentUser.displayName;
              this.user.email = firebase.default.auth().currentUser.email;
              this.userService.user = this.user;
              this.userService.onAddUser().then(
                (dat) => { this.snip.toast('¡Bienvenido a GesinJob!');
                           loading.dismiss();
                           this.navCtrl.navigateRoot('/tabs/tab1');
                }, () => {
                  loading.dismiss();
                  this.navCtrl.navigateRoot('/tabs/tab1');
                }
              );
            } else {
              loading.dismiss();
              this.snip.toast('Error al cargar, inténtalo de nuevo');
            }
          }
        );
                         },
      () => { this.snip.toast('Error al cargar, inténtalo de nuevo.', 3000);
              loading.dismiss(); }
    );
  }

  async onVisitor() {
    const loading = await this.loader.create({
      message: 'Iniciar sesión...'
    });
    await loading.present();
    this.authService.onSignAnonyme().then(
      () =>  {
        this.snip.toast('Has ingresado como visitante');
        loading.dismiss();
        this.navCtrl.navigateRoot('/tabs/tab1');
      },
      () => {
        this.snip.toast('Error al cargar, inténtalo de nuevo.', 3000);
        loading.dismiss();
      }
    );
  }

  onLogin() {
    this.navCtrl.navigateRoot('/login');
  }

  onGoBack() {
    this.location.back();
  }
}
