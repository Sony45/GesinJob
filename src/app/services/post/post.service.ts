import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  public post: any;
  public id: any; // id post to edit, delete, signal
  public uid: any; // id user of current post
  // public posts: Post[];
  public categories: any[];
  constructor(public userService: UserService) { }

  onGetPost(id) {
    return new Promise((resolve, reject) => {
      firebase.default.firestore().collection('posts').doc(id).get().then(
        (post) => {
          this.post = {  id: post.id,
            content: post.data().content,
            date: post.data().date,
            medias: post.data().medias ? post.data().medias : null,
            uid: post.data().uid,
            longText: this.longText(post.data().content as string),
            likes: post.data().likes ? post.data().likes : [],
            saves: post.data().saves ? post.data().saves : [],
            comments: post.data().comments ? post.data().comments : []
          };
          resolve(this.post);
        }, (err) => reject(err.message)
      );
    });
  }

  getUserPosts(uid) {
    return new Promise((resolve, reject) => {
      firebase.default.firestore().collection('posts').where('uid', '==', uid).orderBy('date', 'desc').get().then(
        async (snaps) => {
          if (snaps.empty) {
             reject('empty');
          } else {
            // tslint:disable-next-line:prefer-const
              let posts = [];
              firebase.default.firestore().collection('users').where('uid', '==', uid).limit(1).get().then(
                (users) => { const user = users.docs[0];
                             snaps.docs.forEach((post, i) => {
                              if (posts.length === 0) {
                                console.log('2');
                                posts.push({
                                  id: post.id,
                                  content: post.data().content,
                                  date: post.data().date,
                                  medias: post.data().medias,
                                  uid: post.data().uid,
                                  photoURL: user.data().photoURL,
                                  displayName: user.data().displayName,
                                  longText: this.longText(post.data().content as string),
                                  likes: post.data().likes ? post.data().likes : [],
                                  saves: post.data().saves ? post.data().saves : [],
                                  comments: post.data().comments ? post.data().comments : []
                                });
                                if ((i + 1) === snaps.docs.length) {
                                   resolve(posts);
                                }
                              } else {
                                console.log('3');
                                let exist = false;
                                posts.forEach(po => {
                                  if (post.data().content === po.content || post.data().medias === po.medias) {
                                    exist = true;
                                  }
                                });

                                if (!exist) {
                                  posts.push({
                                    id: post.id,
                                    content: post.data().content,
                                    date: post.data().date,
                                    medias: post.data().medias,
                                    uid: post.data().uid,
                                    photoURL: user.data().photoURL,
                                    displayName: user.data().displayName,
                                    longText: this.longText(post.data().content as string),
                                    likes: post.data().likes ? post.data().likes : [],
                                    saves: post.data().saves ? post.data().saves : [],
                                    comments: post.data().comments ? post.data().comments : []
                                  });
                                } else { exist = false; }
                                if ((i + 1) === snaps.docs.length) {
                                  resolve(posts);
                                }
                              }

                              // if (posts.length === snaps.docs.length) {
                              //     resolve(posts);
                              // }
                             }); // end foreach
              });
          }
        },
       () => reject('connexion')
      );
    });
  }

  getPostsCommented(ids: any[]) {
    return new Promise((resolve, reject) => {
      // tslint:disable-next-line:prefer-const
      let posts = [];
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < ids.length; i++) {
        firebase.default.firestore().collection('posts').doc(ids[i]).get().then(
          async (post) => {
                firebase.default.firestore().collection('users').where('uid', '==', post.data().uid).limit(1).get().then(
                  (users) => { const user = users.docs[0];
                               posts.push({
                                            id: post.id,
                                            content: post.data().content,
                                            date: post.data().date,
                                            medias: post.data().medias,
                                            uid: post.data().uid,
                                            photoURL: user.data().photoURL,
                                            displayName: user.data().displayName,
                                            longText: this.longText(post.data().content as string),
                                            likes: post.data().likes ? post.data().likes : [],
                                            saves: post.data().saves ? post.data().saves : [],
                                            comments: post.data().comments ? post.data().comments : []
                                          });
                               if (posts.length === ids.length) {
                                 resolve(posts);
                               }
                });
          },
         () => reject('connexion')
        );
      }
     });
  }

  getPosts(catId: any) {
    return new Promise((resolve, reject) => {
      firebase.default.firestore().collection('posts').where('categoryId', '==', catId).orderBy('date', 'desc').limit(20).get().then(
        async (snaps) => {
          if (snaps.empty) {
             reject('empty');
          } else {
            // tslint:disable-next-line:prefer-const
            let posts = [];
            await snaps.docs.forEach(post => {
              firebase.default.firestore().collection('users').where('uid', '==', post.data().uid).limit(1).get().then(
                
                 (users) => { const user = users.docs[0];
                             posts.push({
                                          id: post.id,
                                          content: post.data().content,
                                          date: post.data().date,
                                          medias: post.data().medias,
                                          uid: post.data().uid,
                                          photoURL: user.data().photoURL,
                                          displayName: user.data().displayName,
                                          longText: this.longText(post.data().content as string),
                                          likes: post.data().likes ? post.data().likes : [],
                                          saves: post.data().saves ? post.data().saves : [],
                                          comments: post.data().comments ? post.data().comments : []
                                        });
                             if (posts.length === snaps.docs.length) {
                               resolve(posts);
                             }
              }); }
              );
          }
        },
       () => reject('connexion')
      );
    });
  }

  getPostsNext(catId, posts) {
    return new Promise((resolve, reject) => {
      firebase.default.firestore().collection('posts').doc(posts[posts.length - 1].id).get().then(
        (pos) => {
          firebase.default.firestore().collection('posts').where('categoryId', '==', catId)
          .orderBy('createAt', 'desc').startAfter(pos.ref).limit(20).get().then(
            async (snaps) => {
              // tslint:disable-next-line:prefer-const
              let usersId = [];
              if (snaps.empty) {
                 reject('empty');
              } else {
                await snaps.docs.forEach(post => {
                  firebase.default.firestore().collection('users').where('uid', '==', post.data().uid).limit(1).get().then(
                    (users) => { const user = users.docs[0];
                                 posts.push({
                                              id: post.id,
                                              content: post.data().content,
                                              date: post.data().date,
                                              medias: post.data().medias ? post.data().medias : null,
                                              uid: post.data().uid,
                                              longText: this.longText(post.data().content as string),
                                              photoURL: user.data().photoURL ? user.data().photoURL : null,
                                              displayName: user.data().displayName ? user.data().disiplayName : null,
                                              likes: post.data().likes ? post.data().likes : [],
                                              saves: post.data().saves ? post.data().saves : [],
                                              comments: post.data().comments ? post.data().comments : []
                                            }); },
                    () => reject('connexion')
                  );
                });
                resolve(posts);
              }
            },
           () => reject('connexion')
          );
        },
       () => reject('connexion')
      );
    });
  }

  addPost(){
    return new Promise((resolve, reject) => {
      firebase.default.firestore().collection('posts').add(JSON.parse(JSON.stringify(this.post))).then(() => {
        resolve('Bien ajouté!'); },
        (error) => reject(error));
    });
  }

  onDeletePost() {
    return new Promise((resolve, reject) => {
      if (firebase.default.firestore().collection('posts').doc(this.id).delete()) {
        resolve('Delete Posts!');
      } else {
        reject('Post not deleted!');
      }
    });
  }

  updatePost() {
    return new Promise((resolve, reject) => {
        if (firebase.default.firestore().collection('posts').doc(this.post.id).update(JSON.parse(JSON.stringify(this.post)))) {
          resolve('Post updated!');
        } else {
          reject('Error post updated!');
        }
    });
  }

  getSearchPosts(strSearch: string) {
    return new Promise((resolve, reject) => {
      const strlength = strSearch.length;
      const strFrontCode = strSearch.slice(0, strlength - 1);
      const strEndCode = strSearch.slice(strlength - 1, strSearch.length);
      const startcode = strSearch;
      const endcode = strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);
      firebase.default.firestore().collection('posts').where('content', '>=', startcode).where('content', '<', endcode )
      .orderBy('content', 'asc').orderBy('date', 'desc').get().then(
        (snaps) => {
          if (snaps.empty) {
             reject('empty');
          } else {
            // tslint:disable-next-line:prefer-const
            let posts = [];
            snaps.docs.forEach(post => {
              firebase.default.firestore().collection('users').where('uid', '==', post.data().uid).limit(1).get().then(
                (users) => { const user = users.docs[0];
                             posts.push({
                                          id: post.id,
                                          content: post.data().content,
                                          date: post.data().date,
                                          medias: typeof post.data().medias !== 'undefined' ? post.data().medias : null,
                                          uid: post.data().uid,
                                          photoURL: typeof user.data().photoURL !== 'undefined' ? user.data().photoURL : null,
                                          displayName: typeof user.data().displayName !== 'undefined' ? user.data().disiplayName : null,
                                          likes: typeof post.data().likes !== 'undefined' ? post.data().likes : [],
                                          comments: typeof post.data().comments !== 'undefined' ? post.data().comments : []
                                        });
                             if (posts.length === snaps.docs.length) {
                                          resolve(posts);
                            } else {
                            }
              }); },
                () => reject('connexion 1')
              );
          }
        },
       () => reject('connexion 2')
      );
    });
  }

  longText(text: string) {
    if (!text) {
      return false;
    } else {
      return text.length > 2500 ? false : true;
    }
  }

  getMyComments(uid) {
    return new Promise((resolve, reject) => {
      firebase.default.firestore().collection('posts').orderBy('date', 'desc').get().then(
        (posts) => {
          if (posts.empty) {
            reject('empty');
          } else {
            // tslint:disable-next-line:prefer-const
            let myComments = [];
            let i = 0;
            posts.docs.forEach((post) => {
              if (typeof post.data().comments !== 'undefined' && post.data().comments.length > 0 ) {
                post.data().comments.forEach(comment => {
                  if (comment.uid === uid) {
                    console.log(comment);
                    myComments.push(comment);
                  }
                });
              }
              i++;
              if (posts.docs.length === i) {
                resolve(myComments);
              }
            });
          }
        },
        (err) => reject('connexion')
      );
    });
  }

  onGetLibrairy() {
    return new Promise((resolve, reject) => {
      firebase.default.firestore().collection('posts').get().then(
        (snaps) => {
          if (snaps.empty) {
            reject('empty');
          } else {
            // tslint:disable-next-line:prefer-const
            let posts = []; let i = 0;
            snaps.docs.forEach((post: any) => {
              console.log(post.data());
              if (post.data().saves) {
                if (post.data().saves.includes(firebase.default.auth().currentUser.uid)) {
                    firebase.default.firestore().collection('users').where('uid', '==', post.data().uid).limit(1).get().then(
                      (users) => { const user = users.docs[0];
                                   posts.push({
                                                id: post.id,
                                                content: post.data().content,
                                                date: post.data().date,
                                                medias: post.data().medias,
                                                uid: post.data().uid,
                                                photoURL: user.data().photoURL,
                                                displayName: user.data().displayName,
                                                longText: this.longText(post.data().content as string),
                                                likes: post.data().likes ? post.data().likes : [],
                                                saves: post.data().saves ? post.data().saves : [],
                                                comments: post.data().comments ? post.data().comments : []
                                              });
                                   if (snaps.docs.length === (i + 1)) {
                                        if (posts.length === 0) {
                                          reject('empty');
                                        } else {
                                          resolve(posts);
                                        }
                                   } else { i++; }
                    },
                    (err) => reject('error'));
                } else {
                  if (snaps.docs.length === (i + 1)) {
                    if (posts.length === 0) {
                      reject('empty');
                    } else {
                      resolve(posts);
                    }
                 } else { i++; }
                }
              } else {
                if (snaps.docs.length === (i + 1)) {
                  if (posts.length === 0) {
                    reject('empty');
                  } else {
                    resolve(posts);
                  }
               } else { i++; }
              }
            });
          }
        },
        (err) => reject('error')
      );
  });
  }

}
