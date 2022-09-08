import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ModalController, LoadingController, MenuController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-reset',
  templateUrl: './reset.page.html',
  styleUrls: ['./reset.page.scss'],
})
export class ResetPage implements OnInit, OnDestroy {
  public subs: Subscription;
  validation = false;
  public disconnection: Subscription;
  email: string = null; error = null; success = null;
  constructor(public plt: Platform, public location: Location, public modalController: ModalController,
              public loader: LoadingController, public aus: AuthService,
              public menuCtrl: MenuController,
              public alert: AlertController) {
    }

    ngOnDestroy(): void {
      this.subs.unsubscribe();
      this.disconnection.unsubscribe();
    }
  ngOnInit() {
    this.menuCtrl.enable(false);
  }

  onGoBack() {
    this.location.back();
  }

  onCheckEmail(value: string) {
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (value.match(mailformat)) {
      this.error = null;
      this.email = value;
      this.validation = true;
      this.success = null;
    } else {
      this.error = 'Formato de correo inválido';
      this.success = null;
      this.validation = false;
    }
  }

  async onRecove() {
    const loading = await this.loader.create({
      message: 'Cargando...'
    });
    await loading.present();
    this.aus.resetPassword(this.email).then(
       () => {
        this.success = '¡Revise su correo electrónico para restablecer su contraseña!';
        loading.dismiss();
      }, (err) => { this.error = 'No hay ningún registro de usuario que corresponda a este identificador. Inténtalo de nuevo';
                    loading.dismiss(); }
    );
  }


}
