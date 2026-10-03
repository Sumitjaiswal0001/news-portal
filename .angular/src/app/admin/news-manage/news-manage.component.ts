import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../utils/app.service';
import { LocalService } from '../../utils/local.service';
import { RequestModel } from '../../utils/interface';
import { ConstantData } from '../../utils/constant-data';
import { NewsArticle, JharkhandDistrict, NewsCategory } from '../../models/news.model';

@Component({
  selector: 'app-news-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './news-manage.component.html',
  styleUrls: ['./news-manage.component.css']
})
export class NewsManageComponent implements OnInit {
  articles: NewsArticle[] = [];
  rawArticles: any[] = [];
  filteredArticles: NewsArticle[] = [];
  searchQuery: string = '';
  selectedDistrict: string = '';
  selectedCategory: string = '';

  isLoading: boolean = false;

  districts: JharkhandDistrict[] = [];
  categories: NewsCategory[] = [];

  constructor(
    public appService: AppService,
    private localService: LocalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDistricts();
    this.loadCategories();
    this.loadArticles();
  }

  loadDistricts(): void {
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
      error: () => console.error('Failed to load districts')
    });
  }

  loadCategories(): void {
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
      error: () => console.error('Failed to load categories')
    });
  }

  loadArticles(): void {
    this.isLoading = true;
    this.appService.getPublicArticles().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.rawArticles = res.data;
          this.articles = res.data.map((item: any) => ({
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
          this.applyFilter();
        }
        this.isLoading = false;
      },
      error: () => {
        console.error('Failed to load articles');
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredArticles = this.articles.filter(a => {
      const q = this.searchQuery.toLowerCase();
      const matchesSearch = !this.searchQuery || a.title.toLowerCase().includes(q) || a.districtName.toLowerCase().includes(q);
      const matchesDistrict = !this.selectedDistrict || a.districtId === this.selectedDistrict;
      const matchesCategory = !this.selectedCategory || a.categoryId === this.selectedCategory;
      return matchesSearch && matchesDistrict && matchesCategory;
    });
  }

  toggleBreaking(article: NewsArticle): void {
    const previousState = article.isBreaking;
    article.isBreaking = !article.isBreaking; // Optimistic UI update
    
    this.saveArticleStatus(article).catch(() => {
      article.isBreaking = previousState; // Revert on failure
    });
  }

  toggleTrending(article: NewsArticle): void {
    const previousState = article.isTrending;
    article.isTrending = !article.isTrending; // Optimistic UI update
    
    this.saveArticleStatus(article).catch(() => {
      article.isTrending = previousState; // Revert on failure
    });
  }

  // Changed to return a Promise so we can catch errors in the toggle functions
  private saveArticleStatus(article: NewsArticle): Promise<void> {
    return new Promise((resolve, reject) => {
      const raw = this.rawArticles.find((r: any) => String(r.ArticleId) === article.id);
      if (!raw) return reject('Raw article not found');

      const payload = {
        ...raw,
        IsBreaking: article.isBreaking,
        IsTrending: article.isTrending,
        IsFeatured: article.isFeatured
      };

      const requestModel: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(payload)).toString()
      };

      this.appService.saveArticle(requestModel).subscribe({
        next: (res: any) => {
          if (res && (res.Message === 'Success' || res.Message === ConstantData.SuccessMessage)) {
            // Success, update the raw array so future toggles use the updated baseline
            const rawIndex = this.rawArticles.findIndex((r: any) => String(r.ArticleId) === article.id);
            if(rawIndex > -1) {
               this.rawArticles[rawIndex] = payload;
            }
            resolve();
          } else {
            alert('Failed to update article status: ' + (res?.Message || 'Error'));
            reject();
          }
        },
        error: () => {
          alert('Error updating article status. Please check your connection.');
          reject();
        }
      });
    });
  }

  deleteArticle(id: string): void {
    if (confirm('Are you sure you want to delete this article?')) {
      const payload = { ArticleId: parseInt(id) };
      const requestModel: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(payload)).toString()
      };

      this.appService.deleteArticle(requestModel).subscribe({
        next: (res: any) => {
          if (res && (res.Message === 'Success' || res.Message === ConstantData.SuccessMessage)) {
            // Remove locally instead of reloading the whole database
            this.articles = this.articles.filter(a => a.id !== id);
            this.rawArticles = this.rawArticles.filter((r: any) => String(r.ArticleId) !== id);
            this.applyFilter();
          } else {
            alert(res?.Message || 'Failed to delete article');
          }
        },
        error: () => {
          alert('Error deleting article');
        }
      });
    }
  }

  editArticle(id: string): void {
    this.router.navigate(['/admin/news/edit', id]);
  }

  addNewArticle(): void {
    this.router.navigate(['/admin/news/new']);
  }
}