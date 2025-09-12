import { Routes } from '@angular/router'
import { ShelfComponent } from './pages/shelf/shelf.component'
import { AnalyseComponent } from './pages/analyse/analyse.component'
import { RoutinesComponent } from './pages/routines/routines.component'

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'shelf' },
  { path: 'shelf', component: ShelfComponent },
  { path: 'analyse', component: AnalyseComponent },
  { path: 'routines', component: RoutinesComponent },
]
