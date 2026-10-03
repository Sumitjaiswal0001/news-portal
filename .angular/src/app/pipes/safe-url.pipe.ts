import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string | null | undefined): SafeResourceUrl {
    if (!url) return '';
    
    let videoId = '';
    const trimmed = url.trim();

    if (trimmed.includes('watch?v=')) {
      videoId = trimmed.split('watch?v=')[1]?.split('&')[0];
    } else if (trimmed.includes('youtu.be/')) {
      videoId = trimmed.split('youtu.be/')[1]?.split('?')[0];
    } else if (trimmed.includes('embed/')) {
      videoId = trimmed.split('embed/')[1]?.split('?')[0];
    } else if (trimmed.includes('shorts/')) {
      videoId = trimmed.split('shorts/')[1]?.split('?')[0];
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      videoId = trimmed;
    }

    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
