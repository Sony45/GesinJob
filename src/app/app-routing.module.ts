import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./users/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./users/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'reset',
    loadChildren: () => import('./users/reset/reset.module').then( m => m.ResetPageModule)
  },
  {
    path: 'profile/:userId',
    canActivate: [AuthGuard],
    loadChildren: () => import('./users/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'edit-profile',
    canActivate: [AuthGuard],
    loadChildren: () => import('./users/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'chat/:userId',
    canActivate: [AuthGuard],
    loadChildren: () => import('./chats/chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'edit',
    loadChildren: () => import('./posts/edit/edit.module').then( m => m.EditPageModule)
  },
  {
    path: 'missed',
    loadChildren: () => import('./users/info-missed/info-missed.module').then( m => m.InfoMissedPageModule)
  },
  {
    path: 'restriction',
    loadChildren: () => import('./restriction/restriction.module').then( m => m.RestrictionPageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then( m => m.WelcomePageModule)
  },
  {
    path: 'tab3',
    loadChildren: () => import('./tab3/tab3.module').then( m => m.Tab3PageModule)
  },
  {
    path: 'present',
    loadChildren: () => import('./users/present/present.module').then( m => m.PresentPageModule)
  },
  {
    path: 'list/:categoryId',
    loadChildren: () => import('./posts/list/list.module').then( m => m.ListPageModule)
  },
  {
    path: 'show',
    loadChildren: () => import('./posts/show/show.module').then( m => m.ShowPageModule)
  },
  {
    path: 'showpicture',
    loadChildren: () => import('./showpicture/showpicture.module').then( m => m.ShowpicturePageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
