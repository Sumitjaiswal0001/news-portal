import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { NewsletterComponent } from '../newsletter/newsletter.component';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { NewsArticle, JharkhandDistrict, NewsCategory } from '../../models/news.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    NewsletterComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredArticle: NewsArticle | null = null;
  heroSubArticles: NewsArticle[] = [];
  allPublishedArticles: NewsArticle[] = [];
  trendingArticles: NewsArticle[] = [];
  districts: JharkhandDistrict[] = [];
  categories: NewsCategory[] = [];

  heroSliderArticles: NewsArticle[] = [];
  currentHeroIndex: number = 0;
  private heroSliderTimer: ReturnType<typeof setInterval> | null = null;
  private readonly HERO_SLIDE_INTERVAL = 5000;
  private isHeroSliderPaused: boolean = false;

  selectedDistrictId: string = 'all';
  showDistrictPopup: boolean = false;
  isLoading: boolean = false;

  breakingNewsArticles: NewsArticle[] = [];
  videoArticles: NewsArticle[] = [];
  activeVideoId: string | null = null;

  playVideo(id: string): void {
    this.activeVideoId = id;
  }

  rawPublishedArticles: NewsArticle[] = [];
  displayLimit: number = 10;

  constructor(
    public appService: AppService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  getSafeYoutubeUrl(url: string | null | undefined): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    
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

  ngOnInit(): void {
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

    this.loadPublishedArticles();
    this.loadTrendingArticles();
    this.loadBreakingNews();
  }

  loadBreakingNews(): void {
    this.appService.getBreakingNews().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.breakingNewsArticles = res.data.map((item: any) => ({
            id: String(item.ArticleId),
            title: item.Title,
            titleHindi: item.TitleHindi || item.Title,
            subtitle: item.Subtitle,
            slug: item.Slug,
            summary: item.Summary,
            thumbnailUrl: this.appService.formatImageUrl(item.ThumbnailUrl),
            categoryId: String(item.CategoryId),
            categoryName: item.CategoryName,
            districtId: (item.DistrictName || 'ranchi').toLowerCase().replace(/\s+/g, '-'),
            districtName: item.DistrictName || 'Ranchi',
            publishedAt: item.PublishedOn,
            viewCount: item.ViewCount || 0,
            isBreaking: true,
            isTrending: false,
            isFeatured: false,
            status: 'Published',
            tags: []
          }));
        }
      },
      error: () => {
        this.breakingNewsArticles = [];
      }
    });
  }

  loadPublishedArticles(): void {
    this.isLoading = true;
    this.appService.getPublicArticles(this.selectedDistrictId === 'all' ? undefined : this.selectedDistrictId).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const fullList: NewsArticle[] = res.data.map((item: any) => ({
            id: String(item.ArticleId),
            title: item.Title,
            titleHindi: item.TitleHindi || item.Title,
            subtitle: item.Subtitle,
            slug: item.Slug,
            summary: item.Summary,
            content: item.Content,
            thumbnailUrl: this.appService.formatImageUrl(item.ThumbnailUrl),
            youtubeUrl: item.YoutubeUrl || item.youtubeUrl || '',
            categoryId: String(item.CategoryId),
            categoryName: item.CategoryName,
            districtId: (item.DistrictName || 'ranchi').toLowerCase().replace(/\s+/g, '-'),
            districtName: item.DistrictName || 'Ranchi',
            authorName: item.AuthorName || 'Reporter',
            authorRole: item.AuthorRole || 'Correspondent',
            publishedAt: item.PublishedOn,
            updatedAt: item.UpdatedOn,
            viewCount: item.ViewCount || 0,
            isBreaking: !!item.IsBreaking,
            isTrending: !!item.IsTrending,
            isFeatured: !!item.IsFeatured,
            status: item.Status === 1 ? 'Published' : 'Draft',
            tags: []
          }));
          this.videoArticles = fullList
            .filter((article: NewsArticle) => !!article.youtubeUrl)
            .slice(0, 4)
            .map(article => ({
              ...article,
              safeYoutubeUrl: this.getSafeYoutubeUrl(article.youtubeUrl)
            }));
          this.prepareHeroArticlesWithList(fullList);
          this.startHeroSlider();
          this.rawPublishedArticles = fullList;
          this.displayLimit = 10;
          this.allPublishedArticles = this.rawPublishedArticles.slice(0, this.displayLimit);
        }
        this.isLoading = false;
      },
      error: () => {
        this.rawPublishedArticles = [];
        this.allPublishedArticles = [];
        this.videoArticles = [];
        this.featuredArticle = null;
        this.heroSubArticles = [];
        this.heroSliderArticles = [];
        this.currentHeroIndex = 0;
        this.stopHeroSlider();
        this.isLoading = false;
      }
    });
  }

  loadMoreArticles(): void {
    if (this.hasMoreArticles) {
      this.displayLimit += 10;
      this.allPublishedArticles = this.rawPublishedArticles.slice(0, this.displayLimit);
    } else {
      this.router.navigate(['/feed']);
    }
  }

  get hasMoreArticles(): boolean {
    return this.allPublishedArticles.length < this.rawPublishedArticles.length;
  }

  prepareHeroArticlesWithList(fullList: NewsArticle[]): void {
    if (!fullList || fullList.length === 0) {
      this.featuredArticle = null;
      this.heroSubArticles = [];
      this.heroSliderArticles = [];
      this.currentHeroIndex = 0;
      this.stopHeroSlider();
      return;
    }

    const featured = fullList.find(article => article.isFeatured) || fullList[0];
    const remainingArticles = fullList.filter(article => article.id !== featured.id);

    this.heroSliderArticles = [featured, ...remainingArticles].slice(0, 5);
    this.currentHeroIndex = 0;
    this.featuredArticle = this.heroSliderArticles[0] || null;
    this.heroSubArticles = fullList.filter(article => article.id !== featured.id).slice(0, 3);
  }

  loadTrendingArticles(): void {
    this.appService.getTrendingArticles().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.trendingArticles = res.data.slice(0, 10).map((item: any) => ({
            id: String(item.ArticleId),
            title: item.Title,
            titleHindi: item.TitleHindi || item.Title,
            subtitle: item.Subtitle,
            slug: item.Slug,
            summary: item.Summary,
            thumbnailUrl: this.appService.formatImageUrl(item.ThumbnailUrl),
            categoryId: String(item.CategoryId),
            categoryName: item.CategoryName,
            districtId: (item.DistrictName || 'ranchi').toLowerCase().replace(/\s+/g, '-'),
            districtName: item.DistrictName || 'Ranchi',
            publishedAt: item.PublishedOn,
            viewCount: item.ViewCount || 0,
            isBreaking: false,
            isTrending: true,
            isFeatured: false,
            status: 'Published',
            tags: []
          }));
        }
      },
      error: () => {
        this.trendingArticles = [];
      }
    });
  }

  prepareHeroArticles(): void {
    if (!this.allPublishedArticles || this.allPublishedArticles.length === 0) {
      this.featuredArticle = null;
      this.heroSubArticles = [];
      this.heroSliderArticles = [];
      this.currentHeroIndex = 0;
      this.stopHeroSlider();
      return;
    }

    const featured = this.allPublishedArticles.find(article => article.isFeatured) || this.allPublishedArticles[0];
    const remainingArticles = this.allPublishedArticles.filter(article => article.id !== featured.id);

    this.heroSliderArticles = [featured, ...remainingArticles].slice(0, 5);
    this.currentHeroIndex = 0;
    this.featuredArticle = this.heroSliderArticles[0] || null;
    this.heroSubArticles = this.allPublishedArticles.filter(article => article.id !== featured.id).slice(0, 3);
  }

  startHeroSlider(): void {
    this.stopHeroSlider();
    if (this.heroSliderArticles.length <= 1) return;
    this.heroSliderTimer = setInterval(() => {
      if (!this.isHeroSliderPaused) {
        this.nextHeroSlide();
      }
    }, this.HERO_SLIDE_INTERVAL);
  }

  stopHeroSlider(): void {
    if (this.heroSliderTimer) {
      clearInterval(this.heroSliderTimer);
      this.heroSliderTimer = null;
    }
  }

  nextHeroSlide(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.heroSliderArticles.length <= 1) return;
    this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroSliderArticles.length;
    this.updateFeaturedArticle();
  }

  previousHeroSlide(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.heroSliderArticles.length <= 1) return;
    this.currentHeroIndex = (this.currentHeroIndex - 1 + this.heroSliderArticles.length) % this.heroSliderArticles.length;
    this.updateFeaturedArticle();
  }

  selectHeroSlide(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (index < 0 || index >= this.heroSliderArticles.length) return;
    this.currentHeroIndex = index;
    this.updateFeaturedArticle();
    this.startHeroSlider();
  }

  private updateFeaturedArticle(): void {
    const article = this.heroSliderArticles[this.currentHeroIndex];
    if (article) {
      this.featuredArticle = article;
    }
  }

  pauseHeroSlider(): void {
    this.isHeroSliderPaused = true;
  }

  resumeHeroSlider(): void {
    this.isHeroSliderPaused = false;
  }

  openDistrictPopup(): void {
    this.showDistrictPopup = true;
    document.body.style.overflow = 'hidden';
  }

  closeDistrictPopup(): void {
    this.showDistrictPopup = false;
    document.body.style.overflow = '';
  }

  selectDistrictFromPopup(districtId: string): void {
    this.closeDistrictPopup();
    this.filterByDistrict(districtId);
  }

  filterByDistrict(districtId: string): void {
    this.selectedDistrictId = districtId;
    this.loadPublishedArticles();
  }

  selectDistrict(districtId: string): void {
    this.filterByDistrict(districtId);
  }

  getSelectedDistrictName(): string {
    if (this.selectedDistrictId === 'all') {
      return 'सभी 24 जिले';
    }
    const district = this.districts.find(item => item.id === this.selectedDistrictId);
    if (!district) {
      return 'सभी 24 जिले';
    }
    return district.hindiName || district.name;
  }

  getSelectedDistrictEnglishName(): string {
    if (this.selectedDistrictId === 'all') {
      return 'All Jharkhand';
    }
    const district = this.districts.find(item => item.id === this.selectedDistrictId);
    if (!district) {
      return 'All Jharkhand';
    }
    return district.name;
  }

  getArticlesByCategory(categoryId: string): NewsArticle[] {
    return this.allPublishedArticles.filter(article => article.categoryId === categoryId);
  }

  openArticle(id: string): void {
    if (!id) return;
    this.router.navigate(['/article', id]);
  }

  trackByDistrict(index: number, district: JharkhandDistrict): string {
    return district.id;
  }

  trackByArticle(index: number, article: NewsArticle): string {
    return article.id;
  }

  trackByCategory(index: number, category: NewsCategory): string {
    return category.id;
  }

  onPopupKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDistrictPopup();
    }
  }

  ngOnDestroy(): void {
    this.stopHeroSlider();
    document.body.style.overflow = '';
  }

  // Share Modal State
  selectedArticleForShare: NewsArticle | null = null;
  isShareModalOpen: boolean = false;
  isLinkCopied: boolean = false;

  openShareModal(article: NewsArticle | null): void {
    if (!article) return;
    this.selectedArticleForShare = article;
    this.isShareModalOpen = true;
    this.isLinkCopied = false;
  }

  closeShareModal(): void {
    this.isShareModalOpen = false;
    this.selectedArticleForShare = null;
    this.isLinkCopied = false;
  }

  getShareUrl(article?: NewsArticle | null): string {
    const art = article || this.selectedArticleForShare;
    if (!art || !art.id) return 'https://satyasamwad.com/#/home';
    return `https://satyasamwad.com/#/article/${art.id}`;
  }

  getSocialShareUrl(article?: NewsArticle | null): string {
    const art = article || this.selectedArticleForShare;
    if (!art || !art.id) return this.getShareUrl(art);
    const base = ConstantData.getBaseUrl();
    const effectiveBase = (!base || base.includes('localhost') || base.includes('127.0.0.1'))
      ? 'https://api.satyasamwad.com/'
      : (base.endsWith('/') ? base : base + '/');
    return `${effectiveBase}api/NewsArticle/Share/${art.id}`;
  }

  shareTo(platform: 'whatsapp' | 'facebook' | 'twitter' | 'telegram' | 'linkedin' | 'native'): void {
    if (!this.selectedArticleForShare) return;
    const item = this.selectedArticleForShare;
    const directUrl = this.getShareUrl(item);
    const socialUrl = this.getSocialShareUrl(item);
    const title = item.title || 'सत्य संवाद समाचार';
    const text = `📰 *${title}*\n\nपूरा समाचार यहाँ पढ़ें 👇\n${socialUrl}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(socialUrl)}`, '_blank', 'width=600,height=500');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`📰 ${title}`)}&url=${encodeURIComponent(socialUrl)}`, '_blank', 'width=600,height=500');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(socialUrl)}&text=${encodeURIComponent(`📰 ${title}`)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(socialUrl)}`, '_blank', 'width=600,height=500');
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: title,
            text: text,
            url: directUrl
          }).catch(() => {});
        } else {
          this.copyShareModalLink();
        }
        break;
    }
  }

  copyShareModalLink(): void {
    const url = this.getShareUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.isLinkCopied = true;
        setTimeout(() => this.isLinkCopied = false, 2500);
      }).catch(() => this.fallbackCopy(url));
    } else {
      this.fallbackCopy(url);
    }
  }

  private fallbackCopy(text: string): void {
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

  trackByArticleId(index: number, item: any): string {
    return item && item.id ? item.id : String(index);
  }
}