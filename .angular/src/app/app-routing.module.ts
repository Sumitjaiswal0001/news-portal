import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Public Components
import { HomeComponent } from './component/home/home.component';
import { ArticleDetailComponent } from './component/article-detail/article-detail.component';
import { DistrictFeedComponent } from './component/district-feed/district-feed.component';
import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { AboutUsComponent } from './component/about-us/about-us.component';
import { ContactUsComponent } from './component/contact-us/contact-us.component';
import { AdvertisementComponent } from './component/advertisement/advertisement.component';
import { VacancyComponent } from './component/vacancy/vacancy.component';
import { PrivacyPolicyComponent } from './component/privacy-policy/privacy-policy.component';
import { NewsletterPageComponent } from './component/newsletter-page/newsletter-page.component';

// Admin Components
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminMasterComponent } from './admin/admin-master/admin-master.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { NewsManageComponent } from './admin/news-manage/news-manage.component';
import { NewsEditorComponent } from './admin/news-editor/news-editor.component';
import { NewsletterManageComponent } from './admin/newsletter-manage/newsletter-manage.component';
import { CategoryManageComponent } from './admin/category-manage/category-manage.component';
import { CommentManageComponent } from './admin/comment-manage/comment-manage.component';
import { DesignationComponent } from './admin/designation/designation.component';
import { DepartmentComponent } from './admin/department/department.component';
import { StaffComponent } from './admin/staff/staff.component';
import { StaffLoginComponent } from './admin/staff-login/staff-login.component';
import { PageGroupComponent } from './admin/page-group/page-group.component';
import { PageComponent } from './admin/page/page.component';
import { MenuComponent } from './admin/menu/menu.component';
import { RoleComponent } from './admin/role/role.component';
import { RoleMenuComponent } from './admin/role-menu/role-menu.component';
import { StateComponent } from './admin/state/state.component';
import { CityComponent } from './admin/city/city.component';
import { ChangePasswordComponent } from './admin/change-password/change-password.component';
import { CompanyComponent } from './admin/company/company.component';
import { DistrictComponent } from './admin/district/district.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'article/:id', component: ArticleDetailComponent },
  { path: 'feed', component: DistrictFeedComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'advertisement', component: AdvertisementComponent },
  { path: 'vacancy', component: VacancyComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'newsletter', component: NewsletterPageComponent },
  { path: 'epaper', redirectTo: 'newsletter' },

  // Admin Login
  { path: 'admin-login', component: AdminLoginComponent },

  // Admin Master Layout & Sub-routes
  {
    path: 'admin', 
    component: AdminMasterComponent, 
    children: [
      { path: '', redirectTo: 'admin-dashboard', pathMatch: 'full' },
      { path: 'admin-dashboard', component: AdminDashboardComponent },
      { path: 'news', component: NewsManageComponent },
      { path: 'news/new', component: NewsEditorComponent },
      { path: 'news/edit/:id', component: NewsEditorComponent },
      { path: 'newsletters', component: NewsletterManageComponent },
      { path: 'categories', component: CategoryManageComponent },
      { path: 'comments', component: CommentManageComponent },
      { path: 'designation', component: DesignationComponent },
      { path: 'department', component: DepartmentComponent },
      { path: 'staff', component: StaffComponent },
      { path: 'staffLogin', component: StaffLoginComponent },
      { path: 'page-group', component: PageGroupComponent },
      { path: 'page', component: PageComponent },
      { path: 'menu', component: MenuComponent },
      { path: 'role', component: RoleComponent },
      { path: 'role-menu', component: RoleMenuComponent },
      { path: 'role-menu/:id', component: RoleMenuComponent },
      { path: 'state', component: StateComponent },
      { path: '+', component: DistrictComponent },
      { path: 'city', component: CityComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'company', component: CompanyComponent },
    ]
  },
  
  // Fallback Routes
  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top', useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }