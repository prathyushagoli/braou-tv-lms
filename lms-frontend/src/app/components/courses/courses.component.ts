import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ ADD THIS
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-courses',
  standalone: true, // ✅ IMPORTANT
  imports: [CommonModule], // ✅ ADD THIS
  templateUrl: './courses.component.html'
})
export class CoursesComponent implements OnInit {

  courses: any[] = [];

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(data => {
      this.courses = data;
    });
  }
}