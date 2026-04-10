import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProgrammeService, Programme } from '../../../services/programme.service';

@Component({
  selector: 'app-user-programmes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-programmes.component.html',
  styleUrls: ['./user-programmes.component.css']
})
export class UserProgrammesComponent implements OnInit {
  programmes: Programme[] = [];
  isLoading: boolean = true;
  filteredProgrammes: Programme[] = [];
  
  programmeTypes: string[] = ['Academic Discussions', 'Faculty Interviews', 'Special Lectures', 'Documentary'];
  activeType: string = 'Academic Discussions';

  constructor(
    private programmeService: ProgrammeService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.programmeService.getProgrammes().subscribe({
      next: (data: Programme[]) => {
        this.programmes = data;
        this.isLoading = false;
        this.filterProgrammes();
      },
      error: (err: any) => {
        console.error('Error fetching university programmes', err);
        this.isLoading = false;
      }
    });
  }

  setActiveTab(type: string) {
    this.activeType = type;
    this.filterProgrammes();
  }

  filterProgrammes() {
    this.filteredProgrammes = this.programmes.filter(p => {
      // Basic fallback matches for casing
      return p.type.toLowerCase() === this.activeType.toLowerCase() ||
             (p.type + 's').toLowerCase() === this.activeType.toLowerCase() ||
             p.type.toLowerCase() === (this.activeType + 's').toLowerCase() ||
             p.type.toLowerCase().replace('-', ' ') === this.activeType.toLowerCase();
    });
    this.activeVideoId = undefined;
  }

  activeVideoId: number | undefined = undefined;

  playVideo(progId: number | undefined) {
    this.activeVideoId = progId;
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
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
