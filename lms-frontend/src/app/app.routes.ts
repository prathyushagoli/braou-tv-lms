import { Routes } from '@angular/router';
import { UserLayoutComponent } from './components/user/user-layout/user-layout.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: UserLayoutComponent, // Shell component loaded initially
    children: [
      { path: '', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
      { path: 'about', loadComponent: () => import('./components/user/about/about.component').then(m => m.AboutComponent) },
      { path: 'archive', loadComponent: () => import('./components/user/archive/user-archive.component').then(m => m.UserArchiveComponent) },
      { path: 'schedules', loadComponent: () => import('./components/user/schedules/user-schedules.component').then(m => m.UserSchedulesComponent) },
      { path: 'events', loadComponent: () => import('./components/user/events/user-events.component').then(m => m.UserEventsComponent) },
      { path: 'programmes', loadComponent: () => import('./components/user/programmes/user-programmes.component').then(m => m.UserProgrammesComponent) },
      { path: 'courses', loadComponent: () => import('./components/user/courses/user-courses.component').then(m => m.UserCoursesComponent) },
      { path: 'live', loadComponent: () => import('./components/user/live/user-live.component').then(m => m.UserLiveComponent) }
    ]
  },
  { path: 'admin', loadComponent: () => import('./components/admin/login/login.component').then(m => m.AdminLoginComponent) },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: 'live-stream', loadComponent: () => import('./components/admin/live-stream/live-stream.component').then(m => m.LiveStreamComponent) },
      { path: 'programmes', loadComponent: () => import('./components/admin/programmes/programmes.component').then(m => m.ProgrammesComponent) },
      { path: 'events', loadComponent: () => import('./components/admin/events/events.component').then(m => m.EventsComponent) },
      { path: 'archive', loadComponent: () => import('./components/admin/archive/archive.component').then(m => m.ArchiveComponent) },
      { path: 'schedules', loadComponent: () => import('./components/admin/schedule/schedule.component').then(m => m.ScheduleComponent) },
      { path: 'courses', loadComponent: () => import('./components/admin/courses/courses.component').then(m => m.CoursesComponent) },
      { path: 'contact', loadComponent: () => import('./components/admin/contact/contact.component').then(m => m.ContactComponent) }
    ]
  }
];