import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import * as firebase from 'firebase';
import { AuthService } from './services/auth/auth.service';
import { MessageService } from './services/message/message.service';
import { NotificationService } from './services/notification/notification.service';
import { PostService } from './services/post/post.service';
import { UserService } from './services/user/user.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SnippetService } from './services/snippet/snippet.service';
import { HttpClientModule } from '@angular/common/http';
import { InfoMissedPage } from './users/info-missed/info-missed.page';
import { User } from './models/user';
// import { CookieService } from 'ngx-cookie-service';
import { ComponentsModule } from './components/components.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { PwaService } from './services/pwa/pwa.service';
import * as firebase from 'firebase';
import { NgxImageCompressService } from 'ngx-image-compress';
// import { AngularFireModule } from '@angular/fire';
// import { AngularFireMessagingModule } from '@angular/fire/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyDCRdqs327dHMVdUiBmIppVZDx1OjxvysI',
  authDomain: 'orange-eaad6.firebaseapp.com',
  databaseURL: 'https://orange-eaad6.firebaseio.com',
  projectId: 'orange-eaad6',
  storageBucket: 'orange-eaad6.appspot.com',
  messagingSenderId: '1045181441184',
  appId: '1:1045181441184:web:6495ff95130d0a779495c5',
  measurementId: 'G-L69NY7ZQM4'
};

firebase.default.initializeApp(firebaseConfig);
firebase.default.analytics();

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [ BrowserModule, IonicModule.forRoot( { rippleEffect: false, mode: 'ios' }),
             AppRoutingModule, FormsModule, ReactiveFormsModule, HttpClientModule,
             ComponentsModule,
             // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
             ServiceWorkerModule.register('combined-sw.js', {
              enabled: environment.production,
            }),
             ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
            // AngularFireModule.initializeApp(environment.firebase),
            // AngularFireMessagingModule,
          ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthService,
    MessageService,
    NotificationService,
    PostService,
    UserService,
    SnippetService,
    InfoMissedPage,
    // Stripe,
     User,
    // Message,
    // Notification,
    // Post,
    // CookieService,
    PwaService,
    NgxImageCompressService,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
