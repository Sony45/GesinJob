import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SnippetService } from '../services/snippet/snippet.service';

@Component({
  selector: 'app-showpicture',
  templateUrl: './showpicture.page.html',
  styleUrls: ['./showpicture.page.scss'],
})
export class ShowpicturePage implements OnInit {

  constructor(public snip: SnippetService, public modalCtrl: ModalController) { }

  ngOnInit() {
  }

  onClose() {
   this.modalCtrl.dismiss();
  }
}
