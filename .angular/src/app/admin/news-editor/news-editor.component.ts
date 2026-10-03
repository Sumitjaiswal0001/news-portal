import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../utils/app.service';
import { LocalService } from '../../utils/local.service';
import { RequestModel } from '../../utils/interface';
import { ConstantData } from '../../utils/constant-data';
import { NewsArticle, JharkhandDistrict, NewsCategory } from '../../models/news.model';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-news-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SafeUrlPipe],
  templateUrl: './news-editor.component.html',
  styleUrls: ['./news-editor.component.css']
})
export class NewsEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('editorDiv') editorDiv!: ElementRef<HTMLDivElement>;

  isEditMode: boolean = false;
  articleId: string = '';
  private savedRange: Range | null = null;

  articleForm: Partial<NewsArticle> = {
    title: '',
    titleHindi: '',
    subtitle: '',
    districtName: 'Ranchi', // Changed from districtId
    categoryId: '1',
    authorName: 'Sunil Mahto',
    authorRole: 'Senior Reporter',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
    content: '',
    summary: '',
    youtubeUrl: '',
    isBreaking: false,
    isTrending: false,
    isFeatured: true,
    status: 'Published'
  };

  districts: JharkhandDistrict[] = [];
  categories: NewsCategory[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public appService: AppService,
    private localService: LocalService
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

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.articleId = params['id'];
        this.loadArticle(this.articleId);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.articleForm.content && this.editorDiv) {
      this.editorDiv.nativeElement.innerHTML = this.articleForm.content;
    }
  }

  loadArticle(id: string): void {
    // Note: Make sure your AppService has this method pointing to `GET api/NewsArticle/GetArticle/{id}`
    this.appService.getArticle(id).subscribe((res: any) => {
      if (res && res.data) {
        const item = res.data;
        this.articleForm = {
          id: String(item.ArticleId),
          title: item.Title,
          titleHindi: item.TitleHindi,
          subtitle: item.Subtitle,
          content: item.Content,
          summary: item.Summary,
          thumbnailUrl: item.ThumbnailUrl,
          youtubeUrl: item.YoutubeUrl || item.youtubeUrl || '',
          categoryId: String(item.CategoryId),
          districtName: item.DistrictName,
          authorName: item.AuthorName,
          authorRole: item.AuthorRole,
          isBreaking: !!item.IsBreaking,
          isTrending: !!item.IsTrending,
          isFeatured: !!item.IsFeatured
        };
        setTimeout(() => {
          if (this.editorDiv) {
            this.editorDiv.nativeElement.innerHTML = item.Content || '';
          }
        }, 50);
      }
    });
  }

  saveSelection(): void {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (this.editorDiv && this.editorDiv.nativeElement.contains(range.commonAncestorContainer)) {
        this.savedRange = range.cloneRange();
      }
    }
  }

  restoreSelection(): void {
    if (this.savedRange) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.savedRange);
      }
    }
  }

  private enableStyleWithCSS(): void {
    try {
      document.execCommand('styleWithCSS', false, 'true');
    } catch (e) {}
  }

  formatText(command: string, value: string = ''): void {
    if (this.editorDiv) {
      this.editorDiv.nativeElement.focus();
    }
    this.restoreSelection();
    this.enableStyleWithCSS();
    document.execCommand(command, false, value);
    this.saveSelection();
    this.syncEditorContent();
  }

  changeTextColor(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    if (this.editorDiv) {
      this.editorDiv.nativeElement.focus();
    }
    this.restoreSelection();
    this.enableStyleWithCSS();
    document.execCommand('foreColor', false, color);
    this.saveSelection();
    this.syncEditorContent();
  }

  changeBgColor(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    if (this.editorDiv) {
      this.editorDiv.nativeElement.focus();
    }
    this.restoreSelection();
    this.enableStyleWithCSS();
    try {
      if (!document.execCommand('hiliteColor', false, color)) {
        document.execCommand('backColor', false, color);
      }
    } catch (e) {
      document.execCommand('backColor', false, color);
    }
    this.saveSelection();
    this.syncEditorContent();
  }

  onEditorInput(): void {
    this.syncEditorContent();
  }

  syncEditorContent(): void {
    if (this.editorDiv) {
      this.articleForm.content = this.editorDiv.nativeElement.innerHTML;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const maxSizeBytes = 500 * 1024; // 500 KB
      if (file.size > maxSizeBytes) {
        alert(`Image size must not exceed 500 KB! Your file size is ${(file.size / 1024).toFixed(1)} KB.`);
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.articleForm.thumbnailUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveArticle(): void {
    this.syncEditorContent();
    if (!this.articleForm.title || !this.articleForm.content) {
      alert('Please provide an article title and content!');
      return;
    }

    const cat = this.categories.find(c => c.id === this.articleForm.categoryId);
    const categoryId = cat ? parseInt(cat.id) : (parseInt(this.articleForm.categoryId as any) || 1);

    const articlePayload: any = {
      ArticleId: this.isEditMode && this.articleId ? parseInt(this.articleId) : 0,
      Title: this.articleForm.title,
      TitleHindi: this.articleForm.titleHindi || this.articleForm.title,
      Subtitle: this.articleForm.subtitle || '',
      Slug: (this.articleForm.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      Summary: this.articleForm.summary || '',
      Content: this.articleForm.content,
      ThumbnailUrl: this.articleForm.thumbnailUrl || '',
      YoutubeUrl: this.articleForm.youtubeUrl || '',
      CategoryId: categoryId,
      DistrictName: this.articleForm.districtName || 'Ranchi', // Maps directly to DistrictName now
      AuthorName: this.articleForm.authorName || 'Reporter',
      AuthorRole: this.articleForm.authorRole || 'Senior Reporter',
      IsBreaking: !!this.articleForm.isBreaking,
      IsTrending: !!this.articleForm.isTrending,
      IsFeatured: !!this.articleForm.isFeatured,
      Status: 1
    };

    const requestModel: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(articlePayload)).toString()
    };

    this.appService.saveArticle(requestModel).subscribe({
      next: (res: any) => {
        if (res && (res.Message === 'Success' || res.Message === ConstantData.SuccessMessage)) {
          alert(this.isEditMode ? 'Article updated successfully!' : 'Article saved successfully!');
          this.router.navigate(['/admin/news']);
        } else {
          alert('Failed to save article: ' + (res?.Message || 'Unknown error'));
        }
      },
      error: (err) => {
        console.error('Error saving article', err);
        alert('Error saving article to database.');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/news']);
  }

  onFontChange(event: any): void {
    const font = event.target.value;
    if (font) {
      this.formatText('fontName', font);
      event.target.value = '';
    }
  }

  onFontSizeChange(event: any): void {
    const size = event.target.value;
    if (size) {
      this.formatText('fontSize', size);
      event.target.value = '';
    }
  }

  addLink(): void {
    this.restoreSelection();
    const url = prompt('Enter the link URL:', 'https://');
    if (url) {
      this.formatText('createLink', url);
    }
  }
}