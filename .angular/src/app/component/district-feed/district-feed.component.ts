import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { NewsArticle, JharkhandDistrict } from '../../models/news.model';

@Component({
  selector: 'app-district-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './district-feed.component.html',
  styleUrls: ['./district-feed.component.css']
})
export class DistrictFeedComponent implements OnInit {
  articles: NewsArticle[] = [];
  districtId: string = '';
  categoryId: string = '';
  searchQuery: string = '';
  pageTitle: string = 'झारखण्ड समाचार स्ट्रीम';
  districts: JharkhandDistrict[] = [];

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public appService: AppService
  ) {}

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

    this.route.queryParams.subscribe(params => {
      this.districtId = params['district'] || '';
      this.categoryId = params['category'] || '';
      this.searchQuery = params['q'] || '';

      this.updateFeed();
    });
  }

  updateFeed(): void {
    if (this.districtId) {
      const dist = this.districts.find(d => d.id === this.districtId);
      this.pageTitle = dist ? `जिला: ${dist.name} (${dist.hindiName}) के समाचार` : 'जिला समाचार';
    } else if (this.categoryId) {
      this.pageTitle = 'श्रेणीवार समाचार';
    } else if (this.searchQuery) {
      this.pageTitle = `खोज परिणाम: "${this.searchQuery}"`;
    } else {
      this.pageTitle = 'झारखण्ड के समस्त समाचार';
    }

    this.isLoading = true;
    this.appService.getPublicArticles(this.districtId, this.categoryId, this.searchQuery).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.articles = res.data.map((item: any) => ({
            id: String(item.ArticleId),
            title: item.Title,
            titleHindi: item.TitleHindi || item.Title,
            subtitle: item.Subtitle,
            slug: item.Slug,
            summary: item.Summary,
            content: item.Content,
            thumbnailUrl: this.appService.formatImageUrl(item.ThumbnailUrl),
            categoryId: String(item.CategoryId),
            categoryName: item.CategoryName,
            districtId: (item.DistrictName || 'ranchi').toLowerCase().replace(/\s+/g, '-'),
            districtName: item.DistrictName || 'Ranchi',
            authorName: item.AuthorName,
            authorRole: item.AuthorRole,
            publishedAt: item.PublishedOn,
            updatedAt: item.UpdatedOn,
            viewCount: item.ViewCount || 0,
            isBreaking: !!item.IsBreaking,
            isTrending: !!item.IsTrending,
            isFeatured: !!item.IsFeatured,
            status: item.Status === 1 ? 'Published' : 'Draft',
            tags: []
          }));
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openArticle(id: string): void {
    this.router.navigate(['/article', id]);
  }

  // Share Modal State
  selectedArticleForShare: NewsArticle | null = null;
  isShareModalOpen: boolean = false;
  isLinkCopied: boolean = false;

  openShareModal(article: NewsArticle): void {
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
}
