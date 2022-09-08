import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, MenuController, LoadingController, NavController, AlertController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SnippetService } from 'src/app/services/snippet/snippet.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-present',
  templateUrl: './present.page.html',
  styleUrls: ['./present.page.scss'],
})
export class PresentPage implements OnInit {
  public disconnection: Subscription;
  public loading; public subs: Subscription;
  constructor(public modalController: ModalController, public menuCtrl: MenuController,
              public authService: AuthService, public loader: LoadingController,
              public snip: SnippetService, public navCtrl: NavController,
              public alert: AlertController,
              public plt: Platform, public router: Router) {
              }
  ngOnInit() {
    this.onLoader();
  }

  slides= [
    {
      img: '../../../assets/imgs/looking.jpg',
      titulo: 'Encuentra el empleo ideal<br>para ti',
    },
    {
      img: '../../../assets/imgs/talent.jpg',
      titulo: 'El mejor talento para tu<br>empresa',
    },
    {
      img: '../../../assets/imgs/team.jpg',
      titulo: 'Comparte una oportunidad laboral<br>- Despeguemos! -',
    }
  ];

  onLogin() {
     this.router.navigateByUrl('/login');
  }

  onRegister() {
    this.router.navigateByUrl('/register');
  }

 async  onAnonyme() {
    this.router.navigateByUrl('tabs/tab1');
    await this.loading.present();
    this.authService.onSignAnonyme().then(
      () => { this.snip.toast('¡Has iniciado sesión como visitante!');
              this.loading.dismiss();
              this.navCtrl.navigateRoot('/tabs/tab1'); },
      async (err) => {  await this.loading.dismiss();
                        this.snip.toast('Error al cargar, inténtalo de nuevo');
                 }
    );
  }

  async onLoader() {
    this.loading = await this.loader.create({
      message: 'Cargando...'
    });
  }

}
