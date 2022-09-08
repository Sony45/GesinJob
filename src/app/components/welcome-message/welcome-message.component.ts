import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';
import { SnippetService } from 'src/app/services/snippet/snippet.service';

@Component({
  selector: 'app-welcome-message',
  templateUrl: './welcome-message.component.html',
  styleUrls: ['./welcome-message.component.scss'],
})
export class WelcomeMessageComponent implements OnInit {

  public message = null;
  public error = null;
  constructor(public snip: SnippetService,
              public loadingController: LoadingController, public router: Router) { }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
    firebase.default.firestore().collection('messages').get().then(
      (snap) => { if (snap.empty) { this.error = 'No hay mensaje hoy. ¡Gracias!'; loading.dismiss(); }
      else {
        const date = Date.now();
        // tslint:disable-next-line:prefer-const
        let exist = false;
        snap.docs.forEach(message => {
          const mesdate = message.data().date as unknown as string;
          if (mesdate.toString().substring(0, 5) === date.toString().substring(0, 5) ) {
            this.message = message.data().content;
            exist = true;
            this.error = null; loading.dismiss();
          }
        });
        if (!exist) {
            this.error = 'No hay mensaje hoy. ¡Gracias!'; loading.dismiss();
          }
         }  },
      () => { this.error = 'Error al cargar ...'; loading.dismiss(); }
    );
  }

  onClose() {
    this.snip.welcome = false;
  }


}
