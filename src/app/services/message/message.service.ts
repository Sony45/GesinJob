import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Message } from 'src/app/models/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public msg: Message;
  public listMsg: Message[];
  public newMsg = false;
  public msgs = [];
  limitIChat = 15;

  constructor() { }
  onSendMessage(data) {
    return new Promise((Resolve, reject) => {
      const user = firebase.default.auth().currentUser;
      firebase.default.firestore().collection('chats').add(JSON.parse(JSON.stringify(data))).then(() => {
        Resolve('Bien ajouté!'); },
        (error) => reject(error));
    });
  }

  onDeleteMessage() {
    return new Promise((resolve, reject) => {
      const user = firebase.default.auth().currentUser;
      firebase.default.firestore().collection('chats').where('senderId', '==', user.uid)
      .where('receiverId', '==', this.msg.receiverId).get().then(
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (doc.id === this.msg.id) {
                const cityRef = firebase.default.firestore().collection('likes').doc(doc.id);
                cityRef.delete();
                resolve('ok');
            }
          });
       },
       (error) => reject('ok')
      );
    });
  }

  onGetUsersId() {
    return new Promise((Resolve, reject) => {
      const user = firebase.default.auth().currentUser;
      firebase.default.firestore().collection('chats')
      .where('senderId', '==', user.uid).orderBy('date', 'asc').get().then((data) => {
        // tslint:disable-next-line:prefer-const
        let listMsg = [];
        // tslint:disable-next-line:prefer-const
        let msgs = [];
        if (!data.empty) {
          data.forEach((doc) => {
            listMsg.push(doc.data().receiverId);
            msgs[doc.data().receiverId] = { content: doc.data().content, date: doc.data().date };
           });
        }
        const first = data.docs.length;
        firebase.default.firestore().collection('chats').where('receiverId', '==', user.uid).orderBy('date', 'asc')
        .get().then(
          (data1) => {
          if (!data1.empty) {
              data1.forEach((doc) => {
                listMsg.push(doc.data().senderId);
                msgs[doc.data().senderId] = { content: doc.data().content, date: doc.data().date };
                if (listMsg.length === (first + data1.docs.length)) {
                  this.msgs = msgs;
                  Resolve(listMsg);
                }
               });
          } else {
            if (listMsg.length > 0) {
              this.msgs = msgs;
              Resolve(listMsg);
            } else {
              reject('empty');
            }
          }
        },
        () => reject('connexion'));
      },
      () => reject('connexion'));
    });
  }

  onListMessage(id) {
    return new Promise((Resolve, reject) => {
      const user = firebase.default.auth().currentUser;
      firebase.default.firestore().collection('chats').where('senderId', 'in', [id, user.uid])
      .where('receiverId', '==', id).get().then((data) => {
        // tslint:disable-next-line:prefer-const
        let listMsg = [];
        if (!data.empty) {
          data.forEach((doc) => {
            listMsg.push(doc.data());
          });
        }

        firebase.default.firestore().collection('chats').where('senderId', 'in', [id, user.uid])
        .where('receiverId', '==', user.uid).get().then((data1) => {
          if (!data1.empty) {
              data1.forEach((doc) => {
              listMsg.push(doc.data());
            });
          }

          if (listMsg === null || listMsg.length === 0) { reject('empty'); } else {
             // tslint:disable-next-line:arrow-return-shorthand
              this.listMsg = listMsg.sort((a, b) => { return a.date - b.date; });
              Resolve(listMsg);
          }

        },
        () => reject('connexion'));
      },
      () => reject('connexion'));
    });
  }

  onListenMessage(id) {
    const user = firebase.default.auth().currentUser;
    return firebase.default.firestore().collection('chats').where('senderId', 'in', [id, user.uid])
    .where('receiverId', '==', user.uid);
    /*.onSnapshot((querySnapshot) => {
      querySnapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
        }
      });
    }); */
  }

  onListenUsers() {
    const user = firebase.default.auth().currentUser;
    return firebase.default.firestore().collection('chats').where('receiverId', '==', user.uid);
  }

  onUpdateRead(id) {
    const user = firebase.default.auth().currentUser;
    firebase.default.firestore().collection('chats').where('senderId', 'in', [id]).where('receiverId', '==', user.uid)
    .get().then(
      (querySnapshot) => {
        querySnapshot.forEach(doc => {
          // tslint:disable-next-line:prefer-const
          let user3 = doc.data(); user3.read = true;
          firebase.default.firestore().collection('chats').doc(doc.id).update(JSON.parse(JSON.stringify(user3))).then(
            () => {},
            () => {});
        });
      }
    );
  }

  onGetUsersChat() {
    return new Promise((resolve, reject) => {
      const user = firebase.default.auth().currentUser;
      // all msg sended
      firebase.default.firestore().collection('chats').where('senderId', '==', user.uid).orderBy('createAt', 'desc').get().then(
        (snapSended) => {
          // tslint:disable-next-line:prefer-const
          let msgs = [];
          if (!snapSended.empty) {
            snapSended.forEach( doc => { msgs.push(
              {
                uid: doc.data().receiverId,
                msg: doc.data().content,
                type: doc.data().type,
                date: doc.data().date,
                read:  doc.data().read,
                createAt: doc.data().createAt
              }); });
          }
          // all msg received
          firebase.default.firestore().collection('chats').where('receiverId', '==', user.uid).orderBy('createAt', 'desc').get().then(
            (snapReceived) => {
              if (!snapReceived.empty) {
                snapReceived.forEach( doc => { msgs.push(
                {
                  uid: doc.data().senderId,
                  msg: doc.data().content,
                  type: doc.data().type,
                  date: doc.data().date,
                  read:  doc.data().read,
                  createAt: doc.data().createAt
                }); });
              }

              // check messages
              if (msgs.length > 0) {
                 msgs = msgs.sort((a, b) => {
                  return b.date - a.date;
                 });

                 // remove duplication
                 // tslint:disable-next-line:prefer-const
                 let setObj = new Set(); // create key value pair from array of array
                 msgs = msgs.reduce((acc, item) => {
                    if (!setObj.has(item.uid)){
                      setObj.add(item.uid);
                      acc.push(item);
                    }
                    return acc;
                 }, []);

                 // find users
                 msgs.forEach(msg => {
                   firebase.default.firestore().collection('users').where('uid', '==', msg.uid).limit(1).get().then(
                     (users) => {
                       msg.displayName = users.docs[0].data().displayName;
                       msg.photoURL = users.docs[0].data().photoURL ? users.docs[0].data().photoURL : null;
                     },
                     ()  => reject('connection')
                   );
                 });
                 resolve(msgs);
              } else {
                reject('empty');
              }
            },
            () => reject('connection')
          );
        },
        () => reject('connection')
      );
    });
  }

  checkRead() {
    return new Promise((resolve, reject) => {
      const user = firebase.default.auth().currentUser;
      firebase.default.firestore().collection('chats').where('receiverId', '==', user.uid).get().then(
        (chats) => {
          if (chats.empty) {
            reject('empty');
          } else {
            chats.docs.forEach(chat => {
              if (!chat.data().read) {
                this.newMsg = true;
              }
            });
            resolve('ok');
          }
        },
        () => reject('connexion')
      );
    });
  }

  updateRead() {
    return new Promise((resolve, reject) => {
      const user = firebase.default.auth().currentUser;
      firebase.default.firestore().collection('chats').where('receiverId', '==', user.uid).get().then(
        (chats) => {
          if (chats.empty) {
            reject('empty');
          } else {
            chats.docs.forEach(chat => {
              if (!chat.data().read) {
                 chat.ref.update({read: true}).then(
                   () => { this.newMsg = false; resolve('ok'); },
                   () => reject('connexion')
                 );
              }
            });
            resolve('ok');
          }
        },
        () => reject('connexion')
      );
    });
  }

}
