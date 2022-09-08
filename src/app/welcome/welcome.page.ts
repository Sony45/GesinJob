import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';
import { SnippetService } from '../services/snippet/snippet.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {
  public message = null;
  public error = null;
  constructor(public snip: SnippetService,
              public loadingController: LoadingController, public router: Router) { }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
    firebase.default.firestore().collection('messages').where('date', '==', Date.now() as number).limit(1)
    .get().then(
      (snap) => { if (snap.empty) { this.error = 'No hay mensaje hoy. ¡Gracias!'; loading.dismiss(); }
                  else { this.message = snap.docs[0].data().content;  loading.dismiss(); } },
      () => { this.error = 'Error al cargar ...'; loading.dismiss(); }
    );
  }

  onClose() {
    this.router.navigateByUrl('/tabs/tab1');
  }

}
