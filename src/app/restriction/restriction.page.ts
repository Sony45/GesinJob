import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SnippetService } from '../services/snippet/snippet.service';

@Component({
  selector: 'app-restriction',
  templateUrl: './restriction.page.html',
  styleUrls: ['./restriction.page.scss'],
})
export class RestrictionPage implements OnInit {

  constructor(public router: Router, public snip: SnippetService, public modalCtrl: ModalController) { }

  ngOnInit() {
  }

  onRegister() {
    this.modalCtrl.dismiss();
    this.router.navigateByUrl('/register');
  }

  onClose() {
    this.modalCtrl.dismiss();
  }

}
