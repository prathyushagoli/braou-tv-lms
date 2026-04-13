import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CourseService, Course } from '../../../services/course.service';
import { SearchFilterPipe } from '../../../pipes/search-filter.pipe';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';

@Component({
  selector: 'app-user-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchFilterPipe, AutoFocusDirective],
  templateUrl: './user-courses.component.html',
  styleUrls: ['./user-courses.component.css']
})
export class UserCoursesComponent implements OnInit {
  courses: Course[] = [];
  isLoading: boolean = true;
  filteredCourses: Course[] = [];
  searchQuery: string = '';

  courseTypes: string[] = ['All Courses', 'UG', 'PG', 'Ph.D', 'Diploma', 'Certificate Programmes', 'Professional Programmes'];
  activeType: string = 'All Courses';

  subjects: string[] = ['All Subjects'];
  selectedSubject: string = 'All Subjects';
  isSubjectDropdownOpen = false;
  searchSubject = '';

  faculties: string[] = ['All Faculties'];
  selectedFaculty: string = 'All Faculties';
  isFacultyDropdownOpen = false;
  searchFaculty = '';

  years: string[] = ['All Years'];
  selectedYear: string = 'All Years';
  isYearDropdownOpen = false;
  searchYear = '';

  semesters: string[] = ['All Semesters'];
  selectedSemester: string = 'All Semesters';
  isSemesterDropdownOpen = false;
  searchSemester = '';

  constructor(
    private courseService: CourseService,
    private sanitizer: DomSanitizer,
    private eRef: ElementRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.courseService.getCourses().subscribe({
      next: (data: Course[]) => {
        this.courses = data.sort((a, b) => (b.id || 0) - (a.id || 0));
        this.isLoading = false;
        this.extractFilters();

        this.route.queryParams.subscribe(params => {
          if (params['faculty']) {
            this.activeType = 'All Courses';
            this.selectedFaculty = params['faculty'];
          }
          this.filterCourses();
        });
      },
      error: (err: any) => {
        console.error('Error fetching university courses', err);
        this.isLoading = false;
      }
    });
  }

  extractFilters() {
    const uniqueSubjects = new Set<string>();
    const uniqueFaculties = new Set<string>();
    const uniqueYears = new Set<number>();
    const uniqueSemesters = new Set<number>();

    this.courses.forEach(c => {
      if (c.subject) uniqueSubjects.add(c.subject);
      if (c.faculty) uniqueFaculties.add(c.faculty);
      if (c.courseYear) uniqueYears.add(c.courseYear);
      if (c.semester) uniqueSemesters.add(c.semester);
    });

    this.subjects = ['All Subjects', ...Array.from(uniqueSubjects).sort()];
    this.faculties = ['All Faculties', ...Array.from(uniqueFaculties).sort()];
    this.years = ['All Years', ...Array.from(uniqueYears).sort((a, b) => a - b).map(y => y.toString())];
    this.semesters = ['All Semesters', ...Array.from(uniqueSemesters).sort((a, b) => a - b).map(s => s.toString())];
  }

  setActiveTab(type: string) {
    this.activeType = type;
    this.selectedSubject = 'All Subjects';
    this.selectedFaculty = 'All Faculties';
    this.selectedYear = 'All Years';
    this.selectedSemester = 'All Semesters';
    this.filterCourses();
  }

  selectSubject(sub: string) {
    this.selectedSubject = sub;
    this.isSubjectDropdownOpen = false;
    this.filterCourses();
  }

  selectFaculty(fac: string) {
    this.selectedFaculty = fac;
    this.isFacultyDropdownOpen = false;
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

  toggleDropdown(dropdown: 'subject' | 'faculty' | 'year' | 'semester', event: Event) {
    event.stopPropagation();
    if (dropdown === 'subject') {
      this.isSubjectDropdownOpen = !this.isSubjectDropdownOpen;
      this.isFacultyDropdownOpen = false;
      this.isYearDropdownOpen = false;
      this.isSemesterDropdownOpen = false;
    } else if (dropdown === 'faculty') {
      this.isFacultyDropdownOpen = !this.isFacultyDropdownOpen;
      this.isSubjectDropdownOpen = false;
      this.isYearDropdownOpen = false;
      this.isSemesterDropdownOpen = false;
    } else if (dropdown === 'year') {
      this.isYearDropdownOpen = !this.isYearDropdownOpen;
      this.isSubjectDropdownOpen = false;
      this.isFacultyDropdownOpen = false;
      this.isSemesterDropdownOpen = false;
    } else if (dropdown === 'semester') {
      this.isSemesterDropdownOpen = !this.isSemesterDropdownOpen;
      this.isSubjectDropdownOpen = false;
      this.isFacultyDropdownOpen = false;
      this.isYearDropdownOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-btn') && !target.closest('.custom-dropdown') && !target.closest('.dropdown-inner-search')) {
      this.isSubjectDropdownOpen = false;
      this.isFacultyDropdownOpen = false;
      this.isYearDropdownOpen = false;
      this.isSemesterDropdownOpen = false;
    }
  }

  activeVideoId: number | undefined = undefined;

  filterCourses() {
    this.filteredCourses = this.courses.filter(c => {
      const typeMatch = this.activeType === 'All Courses' || (c.type && c.type.toLowerCase() === this.activeType.toLowerCase());
      const subjectMatch = this.selectedSubject === 'All Subjects' || c.subject === this.selectedSubject;
      const facultyMatch = this.selectedFaculty === 'All Faculties' || c.faculty === this.selectedFaculty;
      const yearMatch = this.selectedYear === 'All Years' || (c.courseYear && c.courseYear.toString() === this.selectedYear);
      const semMatch = this.selectedSemester === 'All Semesters' || (c.semester && c.semester.toString() === this.selectedSemester);
      const searchMatch = !this.searchQuery || c.title.toLowerCase().includes(this.searchQuery.toLowerCase());

      return typeMatch && subjectMatch && facultyMatch && yearMatch && semMatch && searchMatch;
    });
    this.activeVideoId = undefined;
  }
  playVideo(courseId: number | undefined) {
    this.activeVideoId = courseId;
  }

  extractVideoId(url: string | undefined): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  getSafeUrl(url: string | undefined): SafeResourceUrl | null {
    const videoId = this.extractVideoId(url);
    if (!videoId) return null;
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
