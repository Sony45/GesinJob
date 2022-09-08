import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, ActionSheetController, LoadingController } from '@ionic/angular';
import * as firebase from 'firebase';
import {Location} from '@angular/common';
import { MessageService } from 'src/app/services/message/message.service';
import { SnippetService } from 'src/app/services/snippet/snippet.service';
import { UserService } from 'src/app/services/user/user.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  img = '../../assets/chat/chat1.jpg';
  @ViewChild('content') content: IonContent;
  @ViewChild('chat_input') messageInput: ElementRef;
  public loader = { send: false, page: true };
  public erreur = null;
  public currentUser: any; // sender
  public messageText: any;
  public instanceUser: any; // receivers
  public listMsg = [];
  public loading: any;

  constructor(private actRoute: ActivatedRoute, public actionSheetController: ActionSheetController,
              public loadingController: LoadingController,
              public location: Location, public notif: NotificationService,
              public snips: SnippetService, public msgService: MessageService, public userService: UserService) {
  }

  async ngOnInit() {
    this.loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await this.loading.present();
    this.currentUser = firebase.default.auth().currentUser;
    const id = this.actRoute.snapshot.params.userId;
    await this.userService.onGetUser(id).then(
      (user) => { this.instanceUser = user; this.erreur = null;
                  this.getMessages(); this.loader.page = false; this.loading.dismiss(); },
      () => { this.loader.page = false; this.erreur = 'Error al cargar ...'; this.loading.dismiss(); this.snips.toast('Echec de chargement...'); }
    );
    this.listenMessages();
    // this.scrollToBottom();
  }

  scrollToBottom() {
    this.content.scrollToBottom(100);
  }

  ionViewWillLeave() {
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.scrollToBottom();
    }, 500);
  }

  onSendIMG(file) {
    this.loader.send = true;
    this.snips.uploadFile(file.item(0)).then(
      (url) => {
        const data = {
          content: url,
          type: 'image',
          senderId: firebase.default.auth().currentUser.uid,
          receiverId: this.actRoute.snapshot.params.userId,
          date: Date.now() };
        this.msgService.onSendMessage(data).then(
          () => { this.loader.send = false; this.getMessages(); },
          () => {  this.loader.send = false; this.snips.toast('Error de archivo. ¡Inténtalo de nuevo!'); }
        );
      }, () => {
        this.loader.send = false;
        this.snips.toast('Error de archivo. ¡Inténtalo de nuevo!');
      }
    );
  }

  onSendTEXT() {
    this.loader.send = true;
    const data = {
    content: this.messageText,
    type: 'text',
    senderId: firebase.default.auth().currentUser.uid,
    receiverId: this.actRoute.snapshot.params.userId,
    date: Date.now()
  };
    this.msgService.onSendMessage(data).then(
      () => { this.messageText = null; this.loader.send = false; this.getMessages();
              const notif = {
                type: 'message',
                content: 'te envié un mensaje',
                image: firebase.default.auth().currentUser.photoURL ? firebase.default.auth().currentUser.photoURL : null,
                photoURL: firebase.default.auth().currentUser.photoURL,
                displayName: firebase.default.auth().currentUser.displayName,
                date: Date.now(),
                postUid: this.actRoute.snapshot.params.userId,
                senderUid: firebase.default.auth().currentUser.uid,
                read: false
              };
              this.notif.addNotification(data).then(
                  () => {},
                  () => {}
                );
      },
      () => { this.loader.send = false; this.snips.toast('Error de archivo. ¡Inténtalo de nuevo!'); }
    );
  }

  onGoBack() {
    this.location.back();
  }

  onCheckMsg(msg) {
    if (msg && msg.length > 0) {
        this.messageText = msg;
    } else {
      this.messageText = null;
    }
  }

  async getMessages() {
   await this.msgService.onListMessage(this.instanceUser.uid).then(
     (msgs: any[]) => { this.listMsg = msgs; this.loader.page = false; this.erreur = null;
                        this.msgService.onUpdateRead(this.instanceUser.uid); },
     (err) => {
       if ( err === 'empty') {
          this.erreur = 'Sin conversación...';
       } else if ( err === 'connexion') {
          this.erreur = 'No cargar...';
       }
       this.loader.page = false;
      }
   );
  }

  listenMessages() {
     this.msgService.onListenMessage(this.instanceUser.uid).onSnapshot((querySnapshot) => {
      querySnapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          this.getMessages();
          this.snips.toast('Nuevo mensaje');
        }
      });
    });
  }

  open(url): void {
  //   // open lightbox
  //   this.lightbox.open([{
  //     src: url,
  //     caption: 'Imagen',
  //     thumb: url
  //  }]);
  }

  close(): void {
    // close lightbox programmatically
    // this.lightbox.close();
  }
}
