import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NewsletterService } from '../../utils/newsletter.service';
import { ConstantData } from '../../utils/constant-data';
import { Newsletter } from '../../models/newsletter.model';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css']
})
export class NewsletterComponent implements OnInit {
  @Input() isStandalonePage: boolean = false;

  newsletters: Newsletter[] = [];
  isLoading: boolean = false;
  activeTab: '10days' | 'month' | 'custom' = '10days';
  filterDate: string = '';
  currentMonthName: string = '';

  copiedId: number | null = null;

  selectedNewsletterForPreview: Newsletter | null = null;
  safePdfUrl: SafeResourceUrl | null = null;

  constructor(
    private newsletterService: NewsletterService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.isStandalonePage) {
      this.loadCurrentMonth();
    } else {
      this.loadRecentTenDays();
    }
  }

  // 1. Previous 10 Days
  loadRecentTenDays(): void {
    this.isLoading = true;
    this.activeTab = '10days';
    this.filterDate = '';
    this.newsletterService.getRecentTenDays().subscribe({
      next: (res) => {
        this.newsletters = res?.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching 10 days newsletters:', err);
        this.isLoading = false;
      }
    });
  }

  // 2. View All (Current Month)
  loadCurrentMonth(): void {
    this.isLoading = true;
    this.activeTab = 'month';
    this.filterDate = '';
    this.newsletterService.getCurrentMonth().subscribe({
      next: (res) => {
        this.newsletters = res?.data || [];
        this.currentMonthName = res?.monthName || 'चालू महीना';
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching current month newsletters:', err);
        this.isLoading = false;
      }
    });
  }

  // 3. Date-wise filter
  onDateChange(): void {
    if (!this.filterDate) {
      this.resetFilter();
      return;
    }
    this.isLoading = true;
    this.activeTab = 'custom';
    this.newsletterService.getByDate(this.filterDate).subscribe({
      next: (res) => {
        this.newsletters = res?.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error filtering newsletters by date:', err);
        this.isLoading = false;
      }
    });
  }

  resetFilter(): void {
    this.filterDate = '';
    if (this.isStandalonePage) {
      this.loadCurrentMonth();
    } else {
      this.loadRecentTenDays();
    }
  }

  // Day Name in Hindi
  getDayName(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const daysHindi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
      return daysHindi[d.getDay()];
    } catch {
      return '';
    }
  }

  // Share Modal State
  selectedNewsletterForShare: Newsletter | null = null;
  isShareModalOpen: boolean = false;
  isLinkCopied: boolean = false;

  openShareModal(item: Newsletter): void {
    this.selectedNewsletterForShare = item;
    this.isShareModalOpen = true;
    this.isLinkCopied = false;
  }

  closeShareModal(): void {
    this.isShareModalOpen = false;
    this.selectedNewsletterForShare = null;
    this.isLinkCopied = false;
  }

  getSocialShareUrl(item?: any): string {
    const it = item || this.selectedNewsletterForShare;
    if (!it || !it.NewsletterId) {
      return it?.PdfUrl || 'https://satyasamwad.com/#/newsletter';
    }
    const base = ConstantData.getBaseUrl();
    const effectiveBase = (!base || base.includes('localhost') || base.includes('127.0.0.1'))
      ? 'https://api.satyasamwad.com/'
      : (base.endsWith('/') ? base : base + '/');
    return `${effectiveBase}api/Newsletter/Share/${it.NewsletterId}`;
  }

  shareTo(platform: 'whatsapp' | 'facebook' | 'twitter' | 'telegram' | 'linkedin' | 'native'): void {
    if (!this.selectedNewsletterForShare) return;
    const item = this.selectedNewsletterForShare;
    const directUrl = item.PdfUrl || 'https://satyasamwad.com/#/newsletter';
    const socialUrl = this.getSocialShareUrl(item);
    const title = item.Title || 'सत्य संवाद दैनिक ई-अख़बार';
    const day = this.getDayName(item.PublishDate);
    const dateFormatted = item.PublishDate || '';
    const edition = item.Edition || 'मुख्य संस्करण';
    const fullText = `📰 *सत्य संवाद दैनिक ई-अख़बार*\n📅 तिथि: ${dateFormatted} (${day})\n📍 संस्करण: ${edition}\n\nPDF यहाँ पढ़ें व डाउनलोड करें 👇\n${socialUrl}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(socialUrl)}`, '_blank', 'width=600,height=500');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`📰 ${title} (${dateFormatted})`)}&url=${encodeURIComponent(socialUrl)}`, '_blank', 'width=600,height=500');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(socialUrl)}&text=${encodeURIComponent(fullText)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(socialUrl)}`, '_blank', 'width=600,height=500');
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: title,
            text: fullText,
            url: directUrl
          }).catch(() => {});
        } else {
          this.copyShareModalLink();
        }
        break;
    }
  }

  copyShareModalLink(): void {
    if (!this.selectedNewsletterForShare) return;
    const url = this.selectedNewsletterForShare.PdfUrl || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.isLinkCopied = true;
        setTimeout(() => this.isLinkCopied = false, 2500);
      }).catch(() => this.fallbackShareCopy(url));
    } else {
      this.fallbackShareCopy(url);
    }
  }

  private fallbackShareCopy(text: string): void {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.isLinkCopied = true;
      setTimeout(() => this.isLinkCopied = false, 2500);
    } catch (e) {
      console.error('Fallback copy failed', e);
    }
  }

  hasNativeShare(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.share;
  }

  // Open PDF in new tab or preview modal
  readPdf(url: string, item?: Newsletter): void {
    if (item) {
      this.openPdfPreview(item);
    } else if (url) {
      window.open(url, '_blank');
    }
  }

  openPdfPreview(item: Newsletter): void {
    if (!item || !item.PdfUrl) return;
    this.selectedNewsletterForPreview = item;
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(item.PdfUrl);
  }

  closePdfPreview(): void {
    this.selectedNewsletterForPreview = null;
    this.safePdfUrl = null;
  }

  formatImageUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:image/')) {
      return path;
    }
    const base = ConstantData.getBaseUrl();
    const effectiveBase = (!base || base.includes('localhost') || base.includes('127.0.0.1'))
      ? 'https://api.satyasamwad.com/'
      : (base.endsWith('/') ? base : base + '/');
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return effectiveBase + cleanPath;
  }

  trackByNewsletterId(index: number, item: Newsletter): number {
    return item ? item.NewsletterId : index;
  }
}
