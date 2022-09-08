import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RestrictionPageRoutingModule } from './restriction-routing.module';

import { RestrictionPage } from './restriction.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RestrictionPageRoutingModule
  ],
  declarations: [RestrictionPage]
})
export class RestrictionPageModule {}
