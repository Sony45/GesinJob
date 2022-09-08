import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoMissedPage } from './info-missed.page';

const routes: Routes = [
  {
    path: '',
    component: InfoMissedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoMissedPageRoutingModule {}
