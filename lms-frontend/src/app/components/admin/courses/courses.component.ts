import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CourseService, Course } from '../../../services/course.service';

import { SearchFilterPipe } from '../../../pipes/search-filter.pipe';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SearchFilterPipe, AutoFocusDirective],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit, OnDestroy {
  courses: Course[] = [];

  showAddForm = false;
  showDeleteConfirm = false;

  editingCourseId: number | null = null;
  deletingCourseId: number | null = null;

  newCourseTitle = '';
  newCourseUrl = '';
  newCourseType = '';
  newCourseSubject = '';
  newCourseFaculty = '';
  newCourseYear: number | null = null;
  newCourseSemester: number | null = null;
  isSaving = false;
  isDeleting = false;
  isSaved = false;

  searchQuery = '';

  // Dropdown states for Add Form
  typeDropdownOpen = false;
  subjectDropdownOpen = false;
  facultyDropdownOpen = false;
  yearDropdownOpen = false;
  semDropdownOpen = false;

  // Search Terms for Add Form Dropdowns
  searchModalType = '';
  searchModalSubject = '';
  searchModalFaculty = '';
  searchModalYear = '';
  searchModalSemester = '';

  // Search Filters
  filterSubjects: string[] = ['All Subjects'];
  selectedFilterSubject: string = 'All Subjects';
  isFilterSubjectOpen = false;
  searchFilterSubject = '';

  filterFaculties: string[] = ['All Faculties'];
  selectedFilterFaculty: string = 'All Faculties';
  isFilterFacultyOpen = false;
  searchFilterFaculty = '';

  filterYears: string[] = ['All Years'];
  selectedFilterYear: string = 'All Years';
  isFilterYearOpen = false;
  searchFilterYear = '';

  filterSemesters: string[] = ['All Semesters'];
  selectedFilterSemester: string = 'All Semesters';
  isFilterSemOpen = false;
  searchFilterSem = '';

  // Dropdown data
  faculties = [
    'Faculty of Arts',
    'Faculty of Commerce and Business Management',
    'Faculty of Sciences',
    'Faculty of Social Sciences',
    'Faculty of Education'
  ];

  // Dropdown data
  courseTypes = ['PG', 'UG', 'Diploma', 'Certificate Programmes', 'Professional Programmes', 'Ph.D'];
  years = [1, 2, 3];
  semesters = [1, 2, 3, 4, 5, 6];

  subjectsMap: { [key: string]: string[] } = {
    'PG': [
      'Economics', 'History', 'Political Science', 'Public Administration', 'Sociology',
      'Journalism and Mass Communication', 'English', 'Hindi', 'Telugu', 'Urdu',
      'Psychology', 'Mathematics / Applied Mathematics', 'Botany', 'Chemistry',
      'Environmental Science', 'Physics', 'Zoology', 'Master of Commerce', 'Library Science',
      'Computer Applications', 'M.Ed', 'Geography', 'Statistics', 'Geology'
    ],
    'UG': [
      'Economics', 'History', 'Political Science', 'Public Administration', 'Sociology',
      'Psychology', 'Journalism', 'Geography', 'Telugu', 'English', 'Hindi', 'Urdu',
      'Mathematics', 'Statistics', 'Computer Application', 'Physics', 'Chemistry',
      'Geology', 'Botany', 'Zoology', 'Commerce', 'Library Science', 'Environmental Science',
      'B.Ed', 'B.Ed Spl'
    ],
    'Diploma': [
      'Diploma in Financial Management (DFM)', 'Diploma in Marketing Management (DMM)',
      'Diploma in Operations Management (DOM)', 'Diploma in Human Resource Management (DHRM)',
      'Diploma in Environmental Studies (DES)', 'Diploma in Human Rights (DHR)',
      'Diploma in Women’s Studies (DWS)', 'Diploma in Culture & Heritage Tourism (DCHT)',
      'Diploma in International Relations (DIR)', 'Diploma in Digital Journalism (DDJ)'
    ],
    'Certificate Programmes': [
      'Certificate Programme in Literacy Community Development (CPLCD)',
      'Certificate Programme in NGO’s Management (CNGOM)',
      'Certificate Programme in Early Childhood Care & Education (CECE)'
    ],
    'Professional Programmes': [
      'Master of Business Administration (MBA) – New Syllabus',
      'MBA (Hospital & Health Care Management) – with AHERF, Hyderabad',
      'Master’s Degree in Library & Information Science (MLISc)',
      'Bachelor’s Degree in Library & Information Science (BLISc)',
      'Bachelor of Education (B.Ed)'
    ],
    'Ph.D': []
  };

  constructor(private courseService: CourseService) { }

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses = data.sort((a, b) => (b.id || 0) - (a.id || 0));
        this.extractCourseFilters();
      },
      error: (err) => console.error('Error loading courses', err)
    });
  }

  ngOnDestroy() {
    // Failsafe ensuring application locks unlock organically if navigation interrupts modal instances implicitly!
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnter(event: KeyboardEvent) {
    if (this.showAddForm && !this.isSaving && !this.isSaved) {
      if (this.isFormValid()) {
        event.preventDefault();
        this.saveCourse();
      }
    } else if (this.showDeleteConfirm && !this.isDeleting && !this.isSaved) {
      event.preventDefault();
      this.confirmDelete();
    }
  }

  extractCourseFilters() {
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

    this.filterSubjects = ['All Subjects', ...Array.from(uniqueSubjects).sort()];
    this.filterFaculties = ['All Faculties', ...Array.from(uniqueFaculties).sort()];
    this.filterYears = ['All Years', ...Array.from(uniqueYears).sort((a, b) => a - b).map(y => y.toString())];
    this.filterSemesters = ['All Semesters', ...Array.from(uniqueSemesters).sort((a, b) => a - b).map(s => s.toString())];
  }

  get availableSubjects(): string[] {
    return this.subjectsMap[this.newCourseType] || [];
  }

  get requiresSubjectAndTerms(): boolean {
    return !!this.newCourseType && this.newCourseType !== 'Ph.D';
  }

  get filteredCourses(): Course[] {
    return this.courses.filter(c => {
      const subjectMatch = this.selectedFilterSubject === 'All Subjects' || c.subject === this.selectedFilterSubject;
      const facultyMatch = this.selectedFilterFaculty === 'All Faculties' || c.faculty === this.selectedFilterFaculty;
      const yearMatch = this.selectedFilterYear === 'All Years' || (c.courseYear && c.courseYear.toString() === this.selectedFilterYear);
      const semMatch = this.selectedFilterSemester === 'All Semesters' || (c.semester && c.semester.toString() === this.selectedFilterSemester);
      const searchMatch = !this.searchQuery || c.title.toLowerCase().includes(this.searchQuery.toLowerCase());

      return subjectMatch && facultyMatch && yearMatch && semMatch && searchMatch;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-btn') && !target.closest('.custom-dropdown') && !target.closest('.dropdown-inner-search')) {
      this.typeDropdownOpen = false;
      this.subjectDropdownOpen = false;
      this.facultyDropdownOpen = false;
      this.yearDropdownOpen = false;
      this.semDropdownOpen = false;

      this.isFilterSubjectOpen = false;
      this.isFilterFacultyOpen = false;
      this.isFilterYearOpen = false;
      this.isFilterSemOpen = false;
    }
  }

  toggleFilterDropdown(dropdown: 'subject' | 'faculty' | 'year' | 'semester', event: Event) {
    event.stopPropagation();
    if (dropdown === 'subject') {
      this.isFilterSubjectOpen = !this.isFilterSubjectOpen;
      this.isFilterFacultyOpen = false;
      this.isFilterYearOpen = false;
      this.isFilterSemOpen = false;
    } else if (dropdown === 'faculty') {
      this.isFilterFacultyOpen = !this.isFilterFacultyOpen;
      this.isFilterSubjectOpen = false;
      this.isFilterYearOpen = false;
      this.isFilterSemOpen = false;
    } else if (dropdown === 'year') {
      this.isFilterYearOpen = !this.isFilterYearOpen;
      this.isFilterSubjectOpen = false;
      this.isFilterFacultyOpen = false;
      this.isFilterSemOpen = false;
    } else if (dropdown === 'semester') {
      this.isFilterSemOpen = !this.isFilterSemOpen;
      this.isFilterSubjectOpen = false;
      this.isFilterFacultyOpen = false;
      this.isFilterYearOpen = false;
    }
  }

  setFilterSubject(sub: string) {
    this.selectedFilterSubject = sub;
    this.isFilterSubjectOpen = false;
  }

  setFilterFaculty(fac: string) {
    this.selectedFilterFaculty = fac;
    this.isFilterFacultyOpen = false;
  }

  setFilterYear(yr: string) {
    this.selectedFilterYear = yr;
    this.isFilterYearOpen = false;
  }

  setFilterSem(sem: string) {
    this.selectedFilterSemester = sem;
    this.isFilterSemOpen = false;
  }

  toggleTypeDropdown(event: Event) {
    event.stopPropagation();
    this.typeDropdownOpen = !this.typeDropdownOpen;
    this.subjectDropdownOpen = false;
    this.facultyDropdownOpen = false;
    this.yearDropdownOpen = false;
    this.semDropdownOpen = false;
  }

  toggleSubjectDropdown(event: Event) {
    event.stopPropagation();
    this.subjectDropdownOpen = !this.subjectDropdownOpen;
    this.typeDropdownOpen = false;
    this.facultyDropdownOpen = false;
    this.yearDropdownOpen = false;
    this.semDropdownOpen = false;
  }

  toggleFacultyDropdown(event: Event) {
    event.stopPropagation();
    this.facultyDropdownOpen = !this.facultyDropdownOpen;
    this.typeDropdownOpen = false;
    this.subjectDropdownOpen = false;
    this.yearDropdownOpen = false;
    this.semDropdownOpen = false;
  }

  toggleYearDropdown(event: Event) {
    event.stopPropagation();
    this.yearDropdownOpen = !this.yearDropdownOpen;
    this.typeDropdownOpen = false;
    this.subjectDropdownOpen = false;
    this.facultyDropdownOpen = false;
    this.semDropdownOpen = false;
  }

  toggleSemDropdown(event: Event) {
    event.stopPropagation();
    this.semDropdownOpen = !this.semDropdownOpen;
    this.typeDropdownOpen = false;
    this.subjectDropdownOpen = false;
    this.facultyDropdownOpen = false;
    this.yearDropdownOpen = false;
  }

  selectType(type: string) {
    this.newCourseType = type;
    this.newCourseSubject = ''; // Reset subject when type changes
    this.typeDropdownOpen = false;

    if (type === 'Ph.D') {
      this.newCourseYear = null;
      this.newCourseSemester = null;
    }
  }

  selectSubject(sub: string) {
    this.newCourseSubject = sub;
    this.subjectDropdownOpen = false;
  }

  selectFaculty(fac: string) {
    this.newCourseFaculty = fac;
    this.facultyDropdownOpen = false;
  }

  selectYear(yr: number | null) {
    this.newCourseYear = yr;
    this.yearDropdownOpen = false;
  }

  selectSem(sem: number | null) {
    this.newCourseSemester = sem;
    this.semDropdownOpen = false;
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
      document.body.style.overflow = '';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }

  openEditForm(course: Course) {
    this.editingCourseId = course.id!;
    this.newCourseTitle = course.title;
    this.newCourseType = course.type;
    this.newCourseSubject = course.subject || '';
    this.newCourseFaculty = course.faculty || '';
    this.newCourseYear = course.courseYear || null;
    this.newCourseSemester = course.semester || null;
    this.newCourseUrl = course.url;
    this.showAddForm = true;
    document.body.style.overflow = 'hidden';
  }

  isFormValid(): boolean {
    if (!this.newCourseTitle.trim() || !this.newCourseUrl.trim() || !this.newCourseType) {
      return false;
    }
    if (this.requiresSubjectAndTerms && !this.newCourseSubject) {
      return false; // Subject is mandatory unless Ph.D
    }
    return true;
  }

  showSnackbar = false;
  snackbarMessage = '';

  saveCourse() {
    if (this.isFormValid()) {
      this.isSaving = true;
      this.isSaved = false;
      const payload: Course = {
        title: this.newCourseTitle,
        type: this.newCourseType,
        subject: this.requiresSubjectAndTerms ? this.newCourseSubject : null,
        faculty: this.newCourseFaculty || null,
        courseYear: this.requiresSubjectAndTerms ? this.newCourseYear : null,
        semester: this.requiresSubjectAndTerms ? this.newCourseSemester : null,
        url: this.newCourseUrl
      };

      if (this.editingCourseId) {
        this.courseService.updateCourse(this.editingCourseId, payload).subscribe({
          next: () => {
            this.loadCourses();
            this.isSaving = false;
            this.isSaved = true;
            this.triggerSnackbar('Course successfully updated!');
            setTimeout(() => {
              this.toggleAddForm();
              this.isSaved = false;
            }, 1000);
          },
          error: (err) => {
            console.error('Error updating course', err);
            this.isSaving = false;
          }
        });
      } else {
        this.courseService.addCourse(payload).subscribe({
          next: () => {
            this.loadCourses();
            this.isSaving = false;
            this.isSaved = true;
            this.triggerSnackbar('Course added successfully!');
            setTimeout(() => {
              // Instead of closing the modal, simply scrub inputs dynamically preparing subsequent bulk entries identically!
              this.resetForm();
              this.isSaved = false;
            }, 1000);
          },
          error: (err) => {
            console.error('Error adding course', err);
            this.isSaving = false;
          }
        });
      }
    }
  }

  triggerSnackbar(message: string) {
    this.snackbarMessage = message;
    this.showSnackbar = true;
    setTimeout(() => {
      this.showSnackbar = false;
    }, 3000);
  }

  promptDelete(id: number) {
    this.deletingCourseId = id;
    this.showDeleteConfirm = true;
    document.body.style.overflow = 'hidden';
  }

  cancelDelete() {
    this.deletingCourseId = null;
    this.showDeleteConfirm = false;
    document.body.style.overflow = '';
  }

  confirmDelete() {
    if (this.deletingCourseId) {
      this.isDeleting = true;
      this.isSaved = false;
      this.courseService.deleteCourse(this.deletingCourseId).subscribe({
        next: () => {
          this.courses = this.courses.filter(c => c.id !== this.deletingCourseId);
          this.isDeleting = false;
          this.isSaved = true;
          setTimeout(() => {
            this.cancelDelete();
            this.isSaved = false;
          }, 1000);
        },
        error: (err) => {
          console.error('Error deleting course', err);
          this.isDeleting = false;
        }
      });
    }
  }

  resetForm() {
    this.editingCourseId = null;
    this.newCourseTitle = '';
    this.newCourseType = '';
    this.newCourseSubject = '';
    this.newCourseFaculty = '';
    this.newCourseYear = null;
    this.newCourseSemester = null;
    this.newCourseUrl = '';

    this.searchModalType = '';
    this.searchModalSubject = '';
    this.searchModalFaculty = '';
    this.searchModalYear = '';
    this.searchModalSemester = '';

    this.typeDropdownOpen = false;
    this.subjectDropdownOpen = false;
    this.facultyDropdownOpen = false;
    this.yearDropdownOpen = false;
    this.semDropdownOpen = false;
  }
}
