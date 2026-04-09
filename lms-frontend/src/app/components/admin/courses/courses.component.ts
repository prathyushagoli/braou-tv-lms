import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CourseService, Course } from '../../../services/course.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  
  showAddForm = false;
  showDeleteConfirm = false;
  
  editingCourseId: number | null = null;
  deletingCourseId: number | null = null;
  
  newCourseTitle = '';
  newCourseUrl = '';
  newCourseType = '';
  newCourseSubject = '';
  newCourseYear: number | null = null;
  newCourseSemester: number | null = null;

  searchQuery = '';

  // Dropdown states
  typeDropdownOpen = false;
  subjectDropdownOpen = false;
  yearDropdownOpen = false;
  semDropdownOpen = false;

  // Dropdown data
  courseTypes = ['PG', 'UG', 'Diploma', 'Certificate Programmes', 'Professional Programmes', 'Ph.D'];
  years = [1, 2, 3];
  semesters = [1, 2];

  subjectsMap: { [key: string]: string[] } = {
    'PG': [
      'Economics', 'History', 'Political Science', 'Public Administration', 'Sociology',
      'Journalism and Mass Communication', 'English', 'Hindi', 'Telugu', 'Urdu',
      'Psychology', 'Mathematics / Applied Mathematics', 'Botany', 'Chemistry',
      'Environmental Science', 'Physics', 'Zoology', 'Master of Commerce'
    ],
    'UG': [
      'Economics', 'History', 'Political Science', 'Public Administration', 'Sociology',
      'Psychology', 'Journalism', 'Geography', 'Telugu', 'English', 'Hindi', 'Urdu',
      'Mathematics', 'Statistics', 'Computer Application', 'Physics', 'Chemistry',
      'Geology', 'Botany', 'Zoology', 'Commerce'
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

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (data) => this.courses = data,
      error: (err) => console.error('Error loading courses', err)
    });
  }

  get availableSubjects(): string[] {
    return this.subjectsMap[this.newCourseType] || [];
  }
  
  get requiresSubjectAndTerms(): boolean {
    return !!this.newCourseType && this.newCourseType !== 'Ph.D';
  }

  get filteredCourses(): Course[] {
    if (!this.searchQuery) return this.courses;
    const q = this.searchQuery.toLowerCase();
    return this.courses.filter(c => c.title.toLowerCase().includes(q));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Basic way to close dropdowns when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-btn')) {
      this.typeDropdownOpen = false;
      this.subjectDropdownOpen = false;
      this.yearDropdownOpen = false;
      this.semDropdownOpen = false;
    }
  }

  toggleTypeDropdown(event: Event) {
    event.stopPropagation();
    this.typeDropdownOpen = !this.typeDropdownOpen;
    this.subjectDropdownOpen = false;
    this.yearDropdownOpen = false;
    this.semDropdownOpen = false;
  }

  toggleSubjectDropdown(event: Event) {
    event.stopPropagation();
    this.subjectDropdownOpen = !this.subjectDropdownOpen;
    this.typeDropdownOpen = false;
    this.yearDropdownOpen = false;
    this.semDropdownOpen = false;
  }
  
  toggleYearDropdown(event: Event) {
    event.stopPropagation();
    this.yearDropdownOpen = !this.yearDropdownOpen;
    this.typeDropdownOpen = false;
    this.subjectDropdownOpen = false;
    this.semDropdownOpen = false;
  }
  
  toggleSemDropdown(event: Event) {
    event.stopPropagation();
    this.semDropdownOpen = !this.semDropdownOpen;
    this.typeDropdownOpen = false;
    this.subjectDropdownOpen = false;
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
    }
  }

  openEditForm(course: Course) {
    this.editingCourseId = course.id!;
    this.newCourseTitle = course.title;
    this.newCourseType = course.type;
    this.newCourseSubject = course.subject || '';
    this.newCourseYear = course.courseYear || null;
    this.newCourseSemester = course.semester || null;
    this.newCourseUrl = course.url;
    this.showAddForm = true;
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

  saveCourse() {
    if (this.isFormValid()) {
      const payload: Course = {
        title: this.newCourseTitle,
        type: this.newCourseType,
        subject: this.requiresSubjectAndTerms ? this.newCourseSubject : null,
        courseYear: this.requiresSubjectAndTerms ? this.newCourseYear : null,
        semester: this.requiresSubjectAndTerms ? this.newCourseSemester : null,
        url: this.newCourseUrl
      };

      if (this.editingCourseId) {
        this.courseService.updateCourse(this.editingCourseId, payload).subscribe({
          next: () => {
            this.loadCourses();
            this.toggleAddForm();
          },
          error: (err) => console.error('Error updating course', err)
        });
      } else {
        this.courseService.addCourse(payload).subscribe({
          next: () => {
            this.loadCourses();
            this.toggleAddForm();
          },
          error: (err) => console.error('Error adding course', err)
        });
      }
    }
  }

  promptDelete(id: number) {
    this.deletingCourseId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.deletingCourseId = null;
    this.showDeleteConfirm = false;
  }

  confirmDelete() {
    if (this.deletingCourseId) {
      this.courseService.deleteCourse(this.deletingCourseId).subscribe({
        next: () => {
          this.courses = this.courses.filter(c => c.id !== this.deletingCourseId);
          this.cancelDelete();
        },
        error: (err) => console.error('Error deleting course', err)
      });
    }
  }
  
  resetForm() {
    this.editingCourseId = null;
    this.newCourseTitle = '';
    this.newCourseType = '';
    this.newCourseSubject = '';
    this.newCourseYear = null;
    this.newCourseSemester = null;
    this.newCourseUrl = '';
    
    this.typeDropdownOpen = false;
    this.subjectDropdownOpen = false;
    this.yearDropdownOpen = false;
    this.semDropdownOpen = false;
  }
}
