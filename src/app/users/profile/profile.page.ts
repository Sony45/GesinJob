import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { SnippetService } from 'src/app/services/snippet/snippet.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  public user: any;
  public restrict = false;
  public uid = null;

  constructor(public userService: UserService, public actRoute: ActivatedRoute, public snips: SnippetService) { }

  ngOnInit() {
    if (firebase.default.auth().currentUser.isAnonymous) {
      this.restrict  = true;
   } else {
    this.uid = this.actRoute.snapshot.params.userId;
  }
  }

}
