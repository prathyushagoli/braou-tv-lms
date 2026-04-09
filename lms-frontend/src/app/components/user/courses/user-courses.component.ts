import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CourseService, Course } from '../../../services/course.service';

@Component({
  selector: 'app-user-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-courses.component.html',
  styleUrls: ['./user-courses.component.css']
})
export class UserCoursesComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  
  courseTypes: string[] = ['UG', 'PG', 'Ph.D', 'Diploma', 'Certificate', 'Professional'];
  activeType: string = 'UG';

  subjects: string[] = ['All Subjects'];
  selectedSubject: string = 'All Subjects';

  constructor(
    private courseService: CourseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.courseService.getCourses().subscribe({
      next: (data: Course[]) => {
        this.courses = data;
        this.extractSubjects();
        this.filterCourses();
      },
      error: (err: any) => console.error('Error fetching university courses', err)
    });
  }

  extractSubjects() {
    const unique = new Set<string>();
    this.courses.forEach(c => {
      if (c.subject) unique.add(c.subject);
    });
    this.subjects = ['All Subjects', ...Array.from(unique).sort()];
  }

  setActiveTab(type: string) {
    this.activeType = type;
    this.selectedSubject = 'All Subjects'; // reset on type swap
    this.filterCourses();
  }

  onSubjectChange(event: any) {
    this.selectedSubject = event.target.value;
    this.filterCourses();
  }

  filterCourses() {
    this.filteredCourses = this.courses.filter(c => {
      const typeMatch = c.type.toLowerCase() === this.activeType.toLowerCase();
      const subjectMatch = this.selectedSubject === 'All Subjects' || c.subject === this.selectedSubject;
      return typeMatch && subjectMatch;
    });
  }

  extractVideoId(url: string | undefined): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  getSafeUrl(url: string | undefined): SafeResourceUrl | null {
    const videoId = this.extractVideoId(url);
    if (!videoId) return null;
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
