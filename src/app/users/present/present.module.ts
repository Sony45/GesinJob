import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PresentPageRoutingModule } from './present-routing.module';

import { PresentPage } from './present.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PresentPageRoutingModule
  ],
  declarations: [PresentPage]
})
export class PresentPageModule {}
