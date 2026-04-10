import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CourseService, Course } from '../../../services/course.service';

@Component({
  selector: 'app-user-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-courses.component.html',
  styleUrls: ['./user-courses.component.css']
})
export class UserCoursesComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  searchQuery: string = '';
  
  courseTypes: string[] = ['UG', 'PG', 'Ph.D', 'Diploma', 'Certificate', 'Professional'];
  activeType: string = 'UG';

  subjects: string[] = ['All Subjects'];
  selectedSubject: string = 'All Subjects';
  isSubjectDropdownOpen = false;

  years: string[] = ['All Years'];
  selectedYear: string = 'All Years';
  isYearDropdownOpen = false;

  semesters: string[] = ['All Semesters'];
  selectedSemester: string = 'All Semesters';
  isSemesterDropdownOpen = false;

  constructor(
    private courseService: CourseService,
    private sanitizer: DomSanitizer,
    private eRef: ElementRef
  ) {}

  ngOnInit() {
    this.courseService.getCourses().subscribe({
      next: (data: Course[]) => {
        this.courses = data;
        this.extractFilters();
        this.filterCourses();
      },
      error: (err: any) => console.error('Error fetching university courses', err)
    });
  }

  extractFilters() {
    const uniqueSubjects = new Set<string>();
    const uniqueYears = new Set<number>();
    const uniqueSemesters = new Set<number>();

    this.courses.forEach(c => {
      if (c.subject) uniqueSubjects.add(c.subject);
      if (c.courseYear) uniqueYears.add(c.courseYear);
      if (c.semester) uniqueSemesters.add(c.semester);
    });

    this.subjects = ['All Subjects', ...Array.from(uniqueSubjects).sort()];
    this.years = ['All Years', ...Array.from(uniqueYears).sort((a,b) => a-b).map(y => y.toString())];
    this.semesters = ['All Semesters', ...Array.from(uniqueSemesters).sort((a,b) => a-b).map(s => s.toString())];
  }

  setActiveTab(type: string) {
    this.activeType = type;
    this.selectedSubject = 'All Subjects';
    this.selectedYear = 'All Years';
    this.selectedSemester = 'All Semesters';
    this.filterCourses();
  }

  selectSubject(sub: string) {
    this.selectedSubject = sub;
    this.isSubjectDropdownOpen = false;
    this.filterCourses();
  }

  selectYear(yr: string) {
    this.selectedYear = yr;
    this.isYearDropdownOpen = false;
    this.filterCourses();
  }

  selectSemester(sem: string) {
    this.selectedSemester = sem;
    this.isSemesterDropdownOpen = false;
    this.filterCourses();
  }

  toggleDropdown(dropdown: 'subject' | 'year' | 'semester', event: Event) {
    event.stopPropagation();
    if (dropdown === 'subject') {
      this.isSubjectDropdownOpen = !this.isSubjectDropdownOpen;
      this.isYearDropdownOpen = false;
      this.isSemesterDropdownOpen = false;
    } else if (dropdown === 'year') {
      this.isYearDropdownOpen = !this.isYearDropdownOpen;
      this.isSubjectDropdownOpen = false;
      this.isSemesterDropdownOpen = false;
    } else if (dropdown === 'semester') {
      this.isSemesterDropdownOpen = !this.isSemesterDropdownOpen;
      this.isSubjectDropdownOpen = false;
      this.isYearDropdownOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isSubjectDropdownOpen = false;
      this.isYearDropdownOpen = false;
      this.isSemesterDropdownOpen = false;
    }
  }

  filterCourses() {
    this.filteredCourses = this.courses.filter(c => {
      const typeMatch = c.type.toLowerCase() === this.activeType.toLowerCase();
      const subjectMatch = this.selectedSubject === 'All Subjects' || c.subject === this.selectedSubject;
      const yearMatch = this.selectedYear === 'All Years' || (c.courseYear && c.courseYear.toString() === this.selectedYear);
      const semMatch = this.selectedSemester === 'All Semesters' || (c.semester && c.semester.toString() === this.selectedSemester);
      const searchMatch = !this.searchQuery || c.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return typeMatch && subjectMatch && yearMatch && semMatch && searchMatch;
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
