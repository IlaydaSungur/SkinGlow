import { Routes } from '@angular/router'
import { ShelfComponent } from './pages/shelf/shelf.component'
import { AnalyseComponent } from './pages/analyse/analyse.component'
import { RoutinesComponent } from './pages/routines/routines.component'
import { ProfileComponent } from './pages/profile/profile.component'
import { LoginComponent } from './pages/login/login.component'
import { SignupComponent } from './pages/signup/signup.component'
import { AuthGuard } from './core/auth.guard'

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'shelf' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'shelf', component: ShelfComponent, canActivate: [AuthGuard] },
  { path: 'analyse', component: AnalyseComponent, canActivate: [AuthGuard] },
  { path: 'routines', component: RoutinesComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
]
