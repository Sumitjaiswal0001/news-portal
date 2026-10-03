import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { NewsletterComponent } from '../newsletter/newsletter.component';

@Component({
  selector: 'app-newsletter-page',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, NewsletterComponent],
  template: `
    <app-header></app-header>
    <main class="min-h-screen bg-slate-50 pb-16">
      <app-newsletter [isStandalonePage]="true"></app-newsletter>
    </main>
    <app-footer></app-footer>
  `
})
export class NewsletterPageComponent {}
