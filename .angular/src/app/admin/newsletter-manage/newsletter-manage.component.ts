import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../../utils/newsletter.service';
import { Newsletter } from '../../models/newsletter.model';

@Component({
  selector: 'app-newsletter-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './newsletter-manage.component.html',
  styleUrls: ['./newsletter-manage.component.css']
})
export class NewsletterManageComponent implements OnInit {
  newsletters: Newsletter[] = [];
  filteredNewsletters: Newsletter[] = [];
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  // Search in table
  searchQuery: string = '';

  // Upload Form Model
  uploadModel = {
    title: '',
    publishDate: new Date().toISOString().substring(0, 10),
    edition: 'Main Edition'
  };

  selectedFile: File | null = null;
  fileError: string = '';

  editionsList: string[] = [
  
  ];

  constructor(private newsletterService: NewsletterService) {}

  ngOnInit(): void {
    this.updateDefaultTitle();
    this.loadNewsletters();
  }

  updateDefaultTitle(): void {
    if (this.uploadModel.publishDate) {
      try {
        const d = new Date(this.uploadModel.publishDate);
        const day = d.getDate();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = months[d.getMonth()];
        const year = d.getFullYear();
        this.uploadModel.title = `Satya Samvad - ${day} ${monthName} ${year}`;
      } catch {
        this.uploadModel.title = `Satya Samvad - ${this.uploadModel.publishDate}`;
      }
    }
  }

  onDateChange(): void {
    this.updateDefaultTitle();
  }

  onFileSelected(event: any): void {
    this.fileError = '';
    const file = event.target.files && event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        this.fileError = 'Please select a valid PDF file (.pdf)!';
        this.selectedFile = null;
        event.target.value = '';
        return;
      }
      // Check max size: 50MB
      const maxSizeBytes = 50 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        this.fileError = 'File size must be less than 50 MB!';
        this.selectedFile = null;
        event.target.value = '';
        return;
      }
      this.selectedFile = file;
    }
  }

  loadNewsletters(): void {
    this.isLoading = true;
    this.newsletterService.getAdminList().subscribe({
      next: (res) => {
        this.newsletters = res?.data || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching admin newsletters:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchQuery) {
      this.filteredNewsletters = [...this.newsletters];
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredNewsletters = this.newsletters.filter(n =>
      (n.Title && n.Title.toLowerCase().includes(q)) ||
      (n.Edition && n.Edition.toLowerCase().includes(q)) ||
      (n.PublishDate && n.PublishDate.includes(q))
    );
  }

  submitNewsletter(): void {
    this.fileError = '';

    if (!this.selectedFile) {
      this.fileError = 'Please select a newsletter PDF file!';
      return;
    }

    if (!this.uploadModel.title.trim()) {
      alert('Please enter a Title!');
      return;
    }

    if (!this.uploadModel.publishDate) {
      alert('Please select a Publish Date!');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('title', this.uploadModel.title.trim());
    formData.append('publishDate', this.uploadModel.publishDate);
    formData.append('edition', this.uploadModel.edition || 'Main Edition');
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.newsletterService.uploadNewsletter(formData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res && res.success) {
          alert('✓ Daily newsletter PDF uploaded and saved successfully!');
          // Reset file input
          this.selectedFile = null;
          const fileInput = document.getElementById('pdfFileInput') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          this.loadNewsletters();
        } else {
          alert('Upload failed: ' + (res?.message || 'Unknown error'));
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error uploading newsletter:', err);
        alert('Upload error: ' + (err?.error?.message || err?.message || 'Server error'));
      }
    });
  }

  deleteNewsletter(item: Newsletter): void {
    if (!confirm(`Are you sure you want to delete the newsletter "${item.Title}" (${item.PublishDate})?`)) {
      return;
    }

    this.newsletterService.deleteNewsletter(item.NewsletterId).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          alert('Newsletter deleted successfully.');
          this.loadNewsletters();
        } else {
          alert('Error: ' + (res?.message || 'Could not delete'));
        }
      },
      error: (err) => {
        console.error('Error deleting newsletter:', err);
        alert('Failed to delete newsletter.');
      }
    });
  }

  getDayName(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[d.getDay()];
    } catch {
      return '';
    }
  }
}
