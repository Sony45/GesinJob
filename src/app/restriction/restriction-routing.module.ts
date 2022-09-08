import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RestrictionPage } from './restriction.page';

const routes: Routes = [
  {
    path: '',
    component: RestrictionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RestrictionPageRoutingModule {}
