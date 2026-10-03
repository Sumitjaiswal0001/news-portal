import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../utils/app.service';
import { LocalService } from '../../utils/local.service';
import { RequestModel } from '../../utils/interface';
import { ConstantData } from '../../utils/constant-data';
import { NewsCategory, JharkhandDistrict } from '../../models/news.model';
declare var $: any;

@Component({
  selector: 'app-category-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './category-manage.component.html',
  styleUrls: ['./category-manage.component.css']
})
export class CategoryManageComponent implements OnInit {
  categories: NewsCategory[] = [];
  districts: JharkhandDistrict[] = [];

  newCategoryName: string = '';
  newCategoryHindi: string = '';
  newCategoryIcon: string = 'newspaper';
  editingCategoryId: string | null = null;

  editingDistrictId: string | null = null;
  districtForm: Partial<JharkhandDistrict> = {
    id: '',
    name: '',
    hindiName: '',
    division: '',
    code: ''
  };

  constructor(
    public appService: AppService,
    private localService: LocalService
  ) {}

  ngOnInit(): void {
    this.loadDistricts();
    this.loadCategories();
  }

  loadDistricts(): void {
    this.appService.getPublicDistricts().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.districts = res.data.map((d: any) => ({
            id: String(d.DistrictId),
            name: d.DistrictName,
            hindiName: d.DistrictName,
            division: 'Jharkhand',
            code: d.DistrictName ? d.DistrictName.substring(0, 3).toUpperCase() : 'DST'
          }));
        }
      },
      error: () => {}
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
            icon: c.Icon || 'newspaper',
            order: c.DisplayOrder || 1
          }));
        }
      },
      error: () => {}
    });
  }

  saveCategory(): void {
    if (this.newCategoryName.trim() && this.newCategoryHindi.trim()) {
      const catId = this.editingCategoryId ? parseInt(this.editingCategoryId) : 0;
      const payload: any = {
        CategoryId: catId,
        CategoryName: this.newCategoryName.trim(),
        CategoryNameHindi: this.newCategoryHindi.trim(),
        Slug: this.newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        Icon: this.newCategoryIcon,
        DisplayOrder: catId > 0 ? 1 : this.categories.length + 1,
        Status: 1
      };

      const requestModel: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(payload)).toString()
      };

      this.appService.saveCategory(requestModel).subscribe({
        next: (res: any) => {
          if (res && (res.Message === 'Success' || res.Message === ConstantData.SuccessMessage)) {
            alert('Category saved successfully!');
            this.cancelCategoryEdit();
            this.loadCategories();
          } else {
            alert('Failed to save category: ' + (res?.Message || 'Error'));
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error saving category to database');
        }
      });
    }
  }

  editCategory(cat: NewsCategory): void {
    this.editingCategoryId = cat.id;
    this.newCategoryName = cat.name;
    this.newCategoryHindi = cat.hindiName;
  }

  cancelCategoryEdit(): void {
    this.editingCategoryId = null;
    this.newCategoryName = '';
    this.newCategoryHindi = '';
  }

  deleteCategory(id: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      const payload = { CategoryId: parseInt(id) };
      const requestModel: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(payload)).toString()
      };

      this.appService.deleteCategory(requestModel).subscribe({
        next: (res: any) => {
          if (res && (res.Message === 'Success' || res.Message === ConstantData.SuccessMessage)) {
            alert('Category deleted successfully!');
            if (this.editingCategoryId === id) {
              this.cancelCategoryEdit();
            }
            this.loadCategories();
          } else {
            alert(res?.Message || 'Failed to delete category');
          }
        },
        error: () => {
          alert('Error deleting category');
        }
      });
    }
  }

  openAddDistrictModal(): void {
    this.editingDistrictId = null;
    this.districtForm = { id: '', name: '', hindiName: '', division: '', code: '' };
    if ($('#districtModal').modal) {
      $('#districtModal').modal('show');
    }
  }

  editDistrict(d: JharkhandDistrict): void {
    this.editingDistrictId = d.id;
    this.districtForm = { ...d };
    if ($('#districtModal').modal) {
      $('#districtModal').modal('show');
    }
  }

  saveDistrict(): void {
    if (this.districtForm.name && this.districtForm.hindiName) {
      const distId = this.editingDistrictId ? parseInt(this.editingDistrictId) : 0;
      const payload = {
        DistrictId: distId,
        DistrictName: this.districtForm.name.trim(),
        StateId: 1
      };

      const requestModel: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(payload)).toString()
      };

      this.appService.saveDistrict(requestModel).subscribe({
        next: (res: any) => {
          if (res && (res.Message === 'Success' || res.Message === ConstantData.SuccessMessage)) {
            alert('District saved successfully!');
            if ($('#districtModal').modal) {
              $('#districtModal').modal('hide');
            }
            this.loadDistricts();
          } else {
            alert(res?.Message || 'Failed to save district');
          }
        },
        error: () => {
          alert('Error saving district');
        }
      });
    }
  }

  deleteDistrict(id: string): void {
    if (confirm('Are you sure you want to delete this district record?')) {
      const payload = { DistrictId: parseInt(id) };
      const requestModel: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(payload)).toString()
      };

      this.appService.deleteDistrict(requestModel).subscribe({
        next: (res: any) => {
          if (res && (res.Message === 'Success' || res.Message === ConstantData.SuccessMessage)) {
            alert('District deleted successfully!');
            this.loadDistricts();
          } else {
            alert(res?.Message || 'Failed to delete district');
          }
        },
        error: () => {
          alert('Error deleting district');
        }
      });
    }
  }
}
