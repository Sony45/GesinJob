import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoMissedPageRoutingModule } from './info-missed-routing.module';

import { InfoMissedPage } from './info-missed.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    InfoMissedPageRoutingModule
  ],
  declarations: [InfoMissedPage]
})
export class InfoMissedPageModule {}
