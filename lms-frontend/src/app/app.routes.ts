import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminLoginComponent } from './components/admin/login/login.component';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { LiveStreamComponent } from './components/admin/live-stream/live-stream.component';
import { ProgrammesComponent } from './components/admin/programmes/programmes.component';
import { EventsComponent } from './components/admin/events/events.component';
import { ArchiveComponent } from './components/admin/archive/archive.component';
import { ScheduleComponent } from './components/admin/schedule/schedule.component';
import { CoursesComponent } from './components/admin/courses/courses.component';
import { ContactComponent } from './components/admin/contact/contact.component';
import { UserLayoutComponent } from './components/user/user-layout/user-layout.component';
import { AboutComponent } from './components/user/about/about.component';
import { UserArchiveComponent } from './components/user/archive/user-archive.component';
import { UserSchedulesComponent } from './components/user/schedules/user-schedules.component';
import { UserEventsComponent } from './components/user/events/user-events.component';
import { UserProgrammesComponent } from './components/user/programmes/user-programmes.component';
import { UserCoursesComponent } from './components/user/courses/user-courses.component';
import { UserLiveComponent } from './components/user/live/user-live.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: UserLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'archive', component: UserArchiveComponent },
      { path: 'schedules', component: UserSchedulesComponent },
      { path: 'events', component: UserEventsComponent },
      { path: 'programmes', component: UserProgrammesComponent },
      { path: 'courses', component: UserCoursesComponent },
      { path: 'live', component: UserLiveComponent }
    ]
  },
  { path: 'admin', component: AdminLoginComponent },
  { 
    path: 'admin', 
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'live-stream', component: LiveStreamComponent },
      { path: 'programmes', component: ProgrammesComponent },
      { path: 'events', component: EventsComponent },
      { path: 'archive', component: ArchiveComponent },
      { path: 'schedules', component: ScheduleComponent },
      { path: 'courses', component: CoursesComponent },
      { path: 'contact', component: ContactComponent }
    ]
  }
];