import { NgModule  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfilComponent } from './profil/profil.component';
import { RestrictComponent } from './restrict/restrict.component';
import { WelcomeMessageComponent } from './welcome-message/welcome-message.component';
import { PostComponent } from './post/post.component';
import { TabComponent } from './tab/tab.component';
import { SearchComponent } from './search/search.component';
@NgModule({
    imports: [
      CommonModule,
      FormsModule,
      IonicModule],
    declarations: [ TabComponent, ProfilComponent, PostComponent, RestrictComponent, WelcomeMessageComponent,
    SearchComponent ],
    exports: [ TabComponent, ProfilComponent, PostComponent, RestrictComponent, WelcomeMessageComponent,
    SearchComponent ]
  })
  export class ComponentsModule {

  }
