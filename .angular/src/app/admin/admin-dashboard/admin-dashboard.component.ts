import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../utils/app.service';
import { DashboardStats, NewsArticle } from '../../models/news.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalCategories: 8,
    totalDistricts: 24,
    totalComments: 0,
    pendingComments: 0
  };

  recentArticles: NewsArticle[] = [];

  constructor(
    public appService: AppService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.appService.getPublicArticles().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const list: NewsArticle[] = res.data.map((item: any) => ({
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
          this.recentArticles = list.slice(0, 5);
          this.stats.totalArticles = list.length;
          this.stats.publishedArticles = list.filter(a => a.status === 'Published').length;
          this.stats.draftArticles = list.length - this.stats.publishedArticles;
          this.stats.totalViews = list.reduce((sum, a) => sum + a.viewCount, 0);
        }
      },
      error: (err) => console.error(err)
    });
  }

  toggleBreaking(article: NewsArticle): void {
    article.isBreaking = !article.isBreaking;
  }

  deleteArticle(id: string): void {
    if (confirm('Are you sure you want to delete this article?')) {
      this.recentArticles = this.recentArticles.filter(a => a.id !== id);
    }
  }

  navigateToEditor(id?: string): void {
    if (id) {
      this.router.navigate(['/admin/news/edit', id]);
    } else {
      this.router.navigate(['/admin/news/new']);
    }
  }
}
