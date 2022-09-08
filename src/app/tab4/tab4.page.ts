import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';
import { MessageService } from '../services/message/message.service';
import { SnippetService } from '../services/snippet/snippet.service';
import { UserService } from '../services/user/user.service';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  public data = [{i: 0}, {i: 0}, {i: 0}, {i: 0}, {i: 0}, {i: 0}, {i: 0}, {i: 0}];
  public users = [];
  public msgs = [];
  public error = null;
  public restrict = false;
  public search = false;
  public loader = true;
  public textLength = 0;
  constructor(public mesService: MessageService, public userService: UserService,
              public loadingController: LoadingController, public snip: SnippetService,
              public router: Router, public location: Location) { }

  ngOnInit() {
    if (firebase.default.auth().currentUser.isAnonymous) {
        this.restrict = true;
    } else {
        this.onGetUsers();
    }
  }

  async onGetUsers() {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
    this.mesService.onGetUsersId().then(
      (ids: any[]) => {
        this.msgs = this.mesService.msgs;
        this.userService.getUsersFromArray(ids).then(
          (users: any[]) => {
            this.users = users; this.error = null;
            loading.dismiss(); },
          () => {
            this.error = 'Falló al cargar. ¡Inténtalo de nuevo!';
            loading.dismiss();
          }
        );
      },
      (er) => { if (er === 'empty') {
        this.error = 'No hay mensajes, busque un usuario para iniciar una conversación';
        loading.dismiss();
      } else {
        this.error = 'Falló al cargar. ¡Inténtalo de nuevo!';
        loading.dismiss();
      } }
    );
  }

  onGetTime(date) {
    // return this.snip.getTime(date);
    return this.snip.getHoursMinute(date);
  }

  doRefresh(event) {
    this.onGetUsers();
    event.target.complete();
  }

  onChat(uid) {
    this.router.navigateByUrl(`/chat/${uid}`);
  }

  onGoBack() {
    this.location.back();
  }

  async onLive(text) {
    if (this.textLength === 0 || this.users.length === 0) {
    this.search = false;
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
    this.mesService.onGetUsersId().then(
      (ids: any[]) => {
        this.msgs = this.mesService.msgs;
        this.userService.getUsersFromArray(ids).then(
          (users: any[]) => {
            this.users = users; this.error = null;
            loading.dismiss(); },
          () => {
            this.error = 'Falló al cargar. ¡Inténtalo de nuevo!';
            loading.dismiss();
          }
        );
      },
      (er) => { if (er === 'empty') {
        this.error = 'No mensaje encontrado';
        loading.dismiss();
      } else {
        this.error = 'Falló al cargar. ¡Inténtalo de nuevo!';
        loading.dismiss();
      } }
    );
   }
  }

  onSearchChange(text: string) {
    this.loader = true;
    this.search = true;
    this.textLength = text.length;
    // this.userService.getSearchUsers(text).then(
    //   (pos: any[]) => {  if (pos.length === 0) { this.users = pos; this.error = 'Usuario no encontrado'; this.loader = false; }
    //                      else {this.users = pos; this.error = null;
    //                     // tslint:disable-next-line:align
    //                     this.loader = false; } },
    //   (err) => { if (err === 'empty') { this.error = 'Usuario no encontrado'; } else
    //              { this.error = 'Error al cargar, actualice la página.'; }
    //              this.loader = false; }
    // );
    if (this.textLength === 0) {
      this.users = [];
      this.error = 'Escribe algo ...';
    } else {
       this.users = [];
       firebase.default.firestore().collection('users').get().then(
          (users) => {
                  if (users.empty) {
                    this.users = []; this.error = 'Usuario no encontrado'; this.loader = false;
                  } else {
                    this.users = [];
                    users.docs.forEach(user => {
                      if (user.data().displayName) {
                        const str: string = user.data().displayName.toLowerCase();
                        if (str.search(text.toLowerCase()) !== -1 && user.data().uid !== firebase.default.auth().currentUser.uid) {
                          this.users.push(user.data());
                        }
                      }
                    });
                    this.error = null;
                    this.loader = false;
                  }
          },
          () => {
            this.error = 'Error al cargar, actualice la página.';
            this.loader = false;
          }
        );
    }
  }
}
