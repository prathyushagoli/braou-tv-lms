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
  isLoading: boolean = true;

  constructor(
    private archiveService: ArchiveService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.archiveService.getArchives().subscribe({
      next: (data: Archive[]) => {
        this.archives = data.sort((a, b) => (b.id || 0) - (a.id || 0));
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching archives', err);
        this.isLoading = false;
      }
    });
  }

  activeVideoId: number | undefined = undefined;

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
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
