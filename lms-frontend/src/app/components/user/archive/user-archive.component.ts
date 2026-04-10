import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ArchiveService, Archive } from '../../../services/archive.service';

@Component({
  selector: 'app-user-archive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-archive.component.html',
  styleUrls: ['./user-archive.component.css']
})
export class UserArchiveComponent implements OnInit {
  archives: Archive[] = [];

  constructor(
    private archiveService: ArchiveService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.archiveService.getArchives().subscribe({
      next: (data: Archive[]) => {
        this.archives = data;
      },
      error: (err: any) => console.error('Error fetching archives', err)
    });
  }

  currentPage = 1;
  itemsPerPage = 12;
  activeVideoId: number | undefined = undefined;

  get paginatedArchives() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.archives.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.archives.length / this.itemsPerPage) || 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.activeVideoId = undefined;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  playVideo(archiveId: number | undefined) {
    this.activeVideoId = archiveId;
  }

  extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  getSafeUrl(url: string): SafeResourceUrl | null {
    const videoId = this.extractVideoId(url);
    if (!videoId) return null;
    
    // Create embed URL from standard video ID
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
