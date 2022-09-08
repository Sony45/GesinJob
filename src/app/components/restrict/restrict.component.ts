import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SnippetService } from 'src/app/services/snippet/snippet.service';

@Component({
  selector: 'app-restrict',
  templateUrl: './restrict.component.html',
  styleUrls: ['./restrict.component.scss'],
})
export class RestrictComponent implements OnInit {
  public status = false;
  constructor(public snip: SnippetService, public router: Router, public modalCtrl: ModalController) { }

  ngOnInit() {
    this.status = this.snip.postRestrict;
  }

  onRegister() {
    this.router.navigateByUrl('/register');
  }

  onClose() {
    this.modalCtrl.dismiss();
  }
}
