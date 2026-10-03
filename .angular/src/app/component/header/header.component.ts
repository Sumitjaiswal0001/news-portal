import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../utils/app.service';
import { NewsArticle, JharkhandDistrict, NewsCategory } from '../../models/news.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  socialLinks = {
    facebook: 'https://www.facebook.com/profile.php?id=61594542205925',
    instagram: 'https://www.instagram.com/satyasamwad?utm_source=qr&stkn=bGZoM292ZXczdGww',
    youtube: 'https://www.youtube.com/@satya.samwad',
    twitter: 'https://x.com/satyasamwad7',
    whatsapp: 'https://wa.me/919006033909'
  };

  currentDateStr: string = '';
  currentTimeStr: string = '';
  breakingNews: NewsArticle[] = [];
  districts: JharkhandDistrict[] = [];
  categories: NewsCategory[] = [];
  searchQuery: string = '';

  isDarkMode: boolean = false;
  isMobileMenuOpen: boolean = false;
  isDistrictDropdownOpen: boolean = false;

  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(
    public appService: AppService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateClock();
    this.ngZone.runOutsideAngular(() => {
      this.timerId = setInterval(() => {
        this.updateClock();
        this.cdr.detectChanges();
      }, 1000);
    });

    this.appService.getPublicDistricts().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.districts = res.data.map((d: any) => ({
            id: (d.DistrictName || '').toLowerCase().replace(/\s+/g, '-'),
            name: d.DistrictName,
            hindiName: d.DistrictName,
            division: 'Jharkhand',
            code: d.DistrictName ? d.DistrictName.substring(0, 3).toUpperCase() : 'DST'
          }));
        }
      },
      error: () => {}
    });

    this.appService.getPublicCategories().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.categories = res.data.map((c: any) => ({
            id: String(c.CategoryId),
            name: c.CategoryName,
            hindiName: c.CategoryNameHindi || c.CategoryName,
            slug: c.Slug || c.CategoryName.toLowerCase(),
            icon: c.Icon || 'label',
            order: c.DisplayOrder || 1
          }));
        }
      },
      error: () => {}
    });

    this.appService.getBreakingNews().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.breakingNews = res.data.map((item: any) => ({
            id: String(item.ArticleId),
            title: item.Title,
            titleHindi: item.TitleHindi || item.Title,
            subtitle: item.Subtitle,
            slug: item.Slug,
            summary: item.Summary,
            thumbnailUrl: item.ThumbnailUrl,
            categoryId: String(item.CategoryId),
            categoryName: item.CategoryName,
            districtId: (item.DistrictName || 'ranchi').toLowerCase().replace(/\s+/g, '-'),
            districtName: item.DistrictName || 'Ranchi',
            publishedAt: item.PublishedOn,
            viewCount: 1,
            isBreaking: true,
            isTrending: false,
            isFeatured: false,
            status: 'Published',
            tags: []
          }));
        }
      },
      error: () => {}
    });

    this.appService.isDarkMode().subscribe({
      next: (isDark: boolean) => {
        this.isDarkMode = isDark;
      }
    });
  }

  updateClock(): void {
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const date = now.toLocaleDateString('hi-IN', dateOptions);
    const time = now.toLocaleTimeString('hi-IN', timeOptions);
    this.currentDateStr = `${date} | ${time}`;
    this.currentTimeStr = time;
  }

  toggleDarkMode(): void {
    this.appService.toggleDarkMode();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleDistrictDropdown(): void {
    this.isDistrictDropdownOpen = !this.isDistrictDropdownOpen;
    document.body.style.overflow = this.isDistrictDropdownOpen ? 'hidden' : '';
  }

  closeDistrictPopup(): void {
    this.isDistrictDropdownOpen = false;
    document.body.style.overflow = '';
  }

  onDistrictSelect(districtId: string): void {
    this.closeDistrictPopup();
    this.isMobileMenuOpen = false;
    this.router.navigate(['/feed'], { queryParams: { district: districtId } });
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    if (!query) return;
    this.router.navigate(['/feed'], { queryParams: { q: query } });
    this.isMobileMenuOpen = false;
  }

  onCategorySelect(categoryId: string): void {
    this.router.navigate(['/feed'], { queryParams: { category: categoryId } });
    this.isMobileMenuOpen = false;
  }

  onPopupKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDistrictPopup();
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    document.body.style.overflow = '';
  }
}