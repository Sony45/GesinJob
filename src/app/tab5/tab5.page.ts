import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit {
  public uid: any;
  public restrict = false;
  constructor(public router: Router) { }

  ngOnInit() {
    if (firebase.default.auth().currentUser.isAnonymous) {
       this.restrict  = true;
    } else {
    this.uid = firebase.default.auth().currentUser.uid;
   }
  }

}
