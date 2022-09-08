import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PresentPage } from './present.page';

const routes: Routes = [
  {
    path: '',
    component: PresentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PresentPageRoutingModule {}
