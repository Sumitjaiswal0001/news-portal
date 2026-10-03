import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { NewsArticle, NewsComment } from '../../models/news.model';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    SafeHtmlPipe,
    SafeUrlPipe
  ],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {
  article: NewsArticle | null = null;
  relatedArticles: NewsArticle[] = [];
  trendingArticles: NewsArticle[] = [];
  comments: NewsComment[] = [];

  newCommentName: string = '';
  newCommentEmail: string = '';
  newCommentText: string = '';
  commentSuccess: boolean = false;
  isLoading: boolean = true;
  copied: boolean = false;
  canNativeShare: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public appService: AppService,
    private meta: Meta,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;
    this.loadTrendingArticles();

    this.route.params.subscribe(params => {
      const articleId = params['id'];
      if (articleId) {
        this.loadArticle(articleId);
      } else {
        this.isLoading = false;
      }
    });
  }

  loadArticle(id: string): void {
    this.isLoading = true;

    // 1. Fetch the FULL single article (This includes the rich text 'Content' and 'YoutubeUrl')
    this.appService.getArticle(id).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const item = res.data;
          
          this.article = {
            id: String(item.ArticleId),
            title: item.Title,
            titleHindi: item.TitleHindi || item.Title,
            subtitle: item.Subtitle,
            slug: item.Slug,
            summary: item.Summary,
            content: item.Content, // 🔥 THIS NOW HAS THE ACTUAL HTML TEXT
            youtubeUrl: item.YoutubeUrl, // 🔥 Ensures video shows up
            thumbnailUrl: this.appService.formatImageUrl(item.ThumbnailUrl),
            categoryId: String(item.CategoryId),
            categoryName: item.CategoryName,
            districtId: (item.DistrictName || 'ranchi').toLowerCase().replace(/\s+/g, '-'),
            districtName: item.DistrictName || 'Ranchi',
            authorName: item.AuthorName || 'Reporter',
            authorRole: item.AuthorRole || 'Correspondent',
            publishedAt: item.PublishedOn,
            updatedAt: item.UpdatedOn,
            viewCount: item.ViewCount || 1,
            isBreaking: !!item.IsBreaking,
            isTrending: !!item.IsTrending,
            isFeatured: !!item.IsFeatured,
            status: item.Status === 1 ? 'Published' : 'Draft',
            tags: []
          };

          this.updateMetaTags(this.article);

          // Increment view count securely
          this.appService.incrementViewCount(id).subscribe({
            next: (incRes: any) => {
              if (incRes && incRes.success && incRes.viewCount && this.article) {
                this.article.viewCount = incRes.viewCount;
              }
            },
            error: () => {}
          });

          this.loadComments(id);
        } else {
          this.article = null;
        }
        this.isLoading = false;
      },
      error: () => {
        this.article = null;
        this.isLoading = false;
      }
    });

    // 2. Fetch the generic list to populate the "Related Articles" section
    this.appService.getPublicArticles().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const allArts: NewsArticle[] = res.data.map((a: any) => ({
            id: String(a.ArticleId),
            title: a.Title,
            titleHindi: a.TitleHindi || a.Title,
            subtitle: a.Subtitle,
            slug: a.Slug,
            summary: a.Summary,
            content: '', // Don't need content for related cards
            thumbnailUrl: this.appService.formatImageUrl(a.ThumbnailUrl),
            categoryId: String(a.CategoryId),
            categoryName: a.CategoryName,
            districtId: (a.DistrictName || 'ranchi').toLowerCase().replace(/\s+/g, '-'),
            districtName: a.DistrictName || 'Ranchi',
            authorName: a.AuthorName,
            authorRole: a.AuthorRole,
            publishedAt: a.PublishedOn,
            updatedAt: a.UpdatedOn,
            viewCount: a.ViewCount || 0,
            isBreaking: !!a.IsBreaking,
            isTrending: !!a.IsTrending,
            isFeatured: !!a.IsFeatured,
            status: a.Status === 1 ? 'Published' : 'Draft',
            tags: []
          }));

          this.relatedArticles = allArts.filter(a => a.id !== id).slice(0, 3);
        }
      }
    });
  }

  private updateMetaTags(article: NewsArticle): void {
    if (!article) return;
    const pageUrl = window.location.href;
    const title = article.title;
    const description = article.subtitle || article.summary || article.title;
    const imageUrl = article.thumbnailUrl;

    this.titleService.setTitle(`${title} - सत्य संवाद`);

    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:site_name', content: 'सत्य संवाद' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });

    if (imageUrl) {
      this.meta.updateTag({ property: 'og:image', content: imageUrl });
      this.meta.updateTag({ property: 'og:image:url', content: imageUrl });
      this.meta.updateTag({ property: 'og:image:secure_url', content: imageUrl });
      this.meta.updateTag({ property: 'og:image:width', content: '1200' });
      this.meta.updateTag({ property: 'og:image:height', content: '630' });
      this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
    }

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }

  loadTrendingArticles(): void {
    this.appService.getTrendingArticles().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.trendingArticles = res.data.map((item: any) => ({
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
            viewCount: item.ViewCount || 1, // Fix: Added dynamic view count
            isBreaking: false,
            isTrending: true,
            isFeatured: false,
            status: 'Published',
            tags: []
          }));
        }
      },
      error: () => {}
    });
  }

  loadComments(id: string): void {
    this.appService.getPublicComments(id).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.comments = res.data.map((c: any) => ({
            id: String(c.CommentId),
            articleId: String(c.ArticleId),
            userName: c.UserName,
            userEmail: '',
            commentText: c.CommentText,
            createdAt: c.CreatedOn,
            isApproved: true
          }));
        }
      },
      error: () => {}
    });
  }

  submitComment(): void {
    if (!this.article || !this.newCommentName.trim() || !this.newCommentText.trim()) {
      alert('कृपया अपना नाम और टिप्पणी दर्ज करें।');
      return;
    }

    const payload = {
      ArticleId: Number(this.article.id),
      UserName: this.newCommentName.trim(),
      UserEmail: this.newCommentEmail.trim(),
      CommentText: this.newCommentText.trim()
    };

    this.appService.postPublicComment(payload).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          const newComment = res.data || {};
          this.comments.unshift({
            id: String(newComment.CommentId || Date.now()),
            articleId: String(this.article?.id),
            userName: payload.UserName,
            userEmail: payload.UserEmail,
            commentText: payload.CommentText,
            createdAt: newComment.CreatedOn || new Date().toISOString(),
            isApproved: true
          });

          this.commentSuccess = true;
          this.newCommentName = '';
          this.newCommentEmail = '';
          this.newCommentText = '';

          setTimeout(() => {
            this.commentSuccess = false;
          }, 5000);
        } else {
          alert('टिप्पणी सहेजने में विफल: ' + (res?.message || 'त्रुटि'));
        }
      },
      error: (err) => {
        console.error('Error posting comment:', err);
        alert('टिप्पणी सहेजने में त्रुटि। कृपया पुनः प्रयास करें।');
      }
    });
  }

  openArticle(id: string): void {
    if (!id) return;
    this.router.navigate(['/article', id]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    window.history.back();
  }

  getShareUrl(): string {
    if (!this.article || !this.article.id) {
      return 'https://satyasamwad.com/#/home';
    }
    return `https://satyasamwad.com/#/article/${this.article.id}`;
  }

  getSocialShareUrl(): string {
    if (!this.article || !this.article.id) {
      return this.getShareUrl();
    }
    const base = ConstantData.getBaseUrl();
    const effectiveBase = (!base || base.includes('localhost') || base.includes('127.0.0.1'))
      ? 'https://api.satyasamwad.com/'
      : (base.endsWith('/') ? base : base + '/');
    return `${effectiveBase}api/NewsArticle/Share/${this.article.id}`;
  }

  async shareArticle(): Promise<void> {
    if (!this.article) return;
    const shareUrl = this.getSocialShareUrl();
    const directUrl = this.getShareUrl();
    const title = this.article.title || '';
    const description = this.article.subtitle || this.article.summary || title;
    const imageUrl = this.article.thumbnailUrl;

    if (navigator.share) {
      if (imageUrl && navigator.canShare) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1) || 'news-image.jpg';
          const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: title,
              text: `📰 *${title}*\n\nपूरा समाचार यहाँ पढ़ें:\n${shareUrl}`,
              files: [file]
            });
            return;
          }
        } catch (e) {
          console.log('Native image share fallback:', e);
        }
      }

      navigator.share({
        title: title,
        text: `📰 *${title}*\n\n${description}\n\n${shareUrl}`,
        url: directUrl
      }).catch((error) => console.log('Error sharing', error));
    } else {
      this.copyLink();
    }
  }

  // Share Modal State
  isShareModalOpen: boolean = false;
  isModalLinkCopied: boolean = false;

  openShareModal(): void {
    this.isShareModalOpen = true;
    this.isModalLinkCopied = false;
  }

  closeShareModal(): void {
    this.isShareModalOpen = false;
    this.isModalLinkCopied = false;
  }

  shareTo(platform: 'whatsapp' | 'facebook' | 'twitter' | 'telegram' | 'linkedin' | 'native'): void {
    if (!this.article) return;
    const directUrl = this.getShareUrl();
    const socialUrl = this.getSocialShareUrl();
    const title = this.article.title || 'सत्य संवाद समाचार';
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
        this.isModalLinkCopied = true;
        setTimeout(() => this.isModalLinkCopied = false, 2500);
      }).catch(() => {
        this.fallbackCopy(url);
        this.isModalLinkCopied = true;
        setTimeout(() => this.isModalLinkCopied = false, 2500);
      });
    } else {
      this.fallbackCopy(url);
      this.isModalLinkCopied = true;
      setTimeout(() => this.isModalLinkCopied = false, 2500);
    }
  }

  hasNativeShare(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.share;
  }

  shareOnWhatsApp(): void {
    this.shareTo('whatsapp');
  }

  shareOnFacebook(): void {
    this.shareTo('facebook');
  }

  shareOnTwitter(): void {
    this.shareTo('twitter');
  }

  copyLink(): void {
    const shareUrl = this.getShareUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => this.onCopySuccess())
        .catch(() => this.fallbackCopy(shareUrl));
    } else {
      this.fallbackCopy(shareUrl);
    }
  }

  private onCopySuccess(): void {
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 3000);
  }

  private fallbackCopy(text: string): void {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.onCopySuccess();
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
  }
}