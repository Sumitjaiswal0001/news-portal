import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../utils/app.service';
import { JharkhandDistrict, NewsCategory } from '../../models/news.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  districts: JharkhandDistrict[] = [];
  categories: NewsCategory[] = [];
  subscriberEmail: string = '';
  subscribedSuccess: boolean = false;

  constructor(
    public appService: AppService,
    private router: Router
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
  }

  onDistrictSelect(districtId: string): void {
    this.router.navigate(['/feed'], { queryParams: { district: districtId } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onCategorySelect(categoryId: string): void {
    this.router.navigate(['/feed'], { queryParams: { category: categoryId } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubscribe(): void {
    if (this.subscriberEmail.trim()) {
      this.subscribedSuccess = true;
      this.subscriberEmail = '';
      setTimeout(() => {
        this.subscribedSuccess = false;
      }, 5000);
    }
  }
}