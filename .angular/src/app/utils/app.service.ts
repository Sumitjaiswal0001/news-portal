import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ConstantData } from './constant-data';
import { NewsArticle, NewsCategory, JharkhandDistrict, NewsComment } from '../models/news.model';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private readonly apiUrl: string = ConstantData.getApiUrl();
  private readonly baseUrl: string = ConstantData.getBaseUrl();
  private readonly headers: HttpHeaders = new HttpHeaders({ 'AppKey': ConstantData.getAdminKey() });
  private darkMode$ = new BehaviorSubject<boolean>(false);

  private districtsCache$: Observable<any> | null = null;
  private categoriesCache$: Observable<any> | null = null;
  private breakingNewsCache$: Observable<any> | null = null;
  private trendingArticlesCache$: Observable<any> | null = null;
  private featuredArticlesCache$: Observable<any> | null = null;

  constructor(private http: HttpClient) {
    this.initDarkMode();
  }

  getApiUrl(): string {
    return ConstantData.getApiUrl();
  }

  getBaseUrl(): string {
    return ConstantData.getBaseUrl();
  }

  isDarkMode(): Observable<boolean> {
    return this.darkMode$.asObservable();
  }

  toggleDarkMode(): void {
    const newValue = !this.darkMode$.value;
    this.darkMode$.next(newValue);
    localStorage.setItem('jharkhand_news_dark_mode', String(newValue));
    this.applyThemeClass(newValue);
  }

  private initDarkMode(): void {
    const saved = localStorage.getItem('jharkhand_news_dark_mode');
    const isDark = saved === 'true';
    this.darkMode$.next(isDark);
    this.applyThemeClass(isDark);
  }

  private applyThemeClass(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  getImageUrl(): string {
    return ConstantData.getBaseUrl();
  }

  formatImageUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:image/')) {
      return path;
    }
    const base = ConstantData.getBaseUrl().endsWith('/') ? ConstantData.getBaseUrl() : ConstantData.getBaseUrl() + '/';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return base + cleanPath;
  }

  /**
   * Fetch a single news article by ID
   */
  getArticle(id: string | number) {
    // IMPORTANT: Change 'this.baseUrl' if your file uses something else 
    // like 'ConstantData.apiUrl' or 'environment.apiUrl'
    
    // Example 1: If your app uses 'this.baseUrl'
    return this.http.get(this.baseUrl + 'api/NewsArticle/GetArticle/' + id);

    // Example 2: If your app uses 'ConstantData' (Uncomment to use)
    // return this.http.get(ConstantData.apiUrl + 'api/NewsArticle/GetArticle/' + id);
  }
  // District
  getDistrictList(obj: any) {
    return this.http.post(this.apiUrl + "District/DistrictList", obj, { headers: this.headers });
  }

  getPublicDistricts() {
    if (!this.districtsCache$) {
      this.districtsCache$ = this.http.get(this.apiUrl + "District/GetDistricts").pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.districtsCache$;
  }

  saveDistrict(obj: any) {
    return this.http.post(this.apiUrl + "District/saveDistrict", obj, { headers: this.headers });
  }

  deleteDistrict(obj: any) {
    return this.http.post(this.apiUrl + "District/deleteDistrict", obj, { headers: this.headers });
  }

  // Company
  getCompanyList(obj: any) {
    return this.http.post(this.apiUrl + "Company/CompanyList", obj, { headers: this.headers });
  }

  saveCompany(obj: any) {
    return this.http.post(this.apiUrl + "Company/saveCompany", obj, { headers: this.headers });
  }

  deleteCompany(obj: any) {
    return this.http.post(this.apiUrl + "Company/deleteCompany", obj, { headers: this.headers });
  }

  // Designation 
  getDesignationList(obj: any) {
    return this.http.post(this.apiUrl + "Designation/DesignationList", obj, { headers: this.headers });
  }

  saveDesignation(obj: any) {
    return this.http.post(this.apiUrl + "Designation/saveDesignation", obj, { headers: this.headers });
  }

  deleteDesignation(obj: any) {
    return this.http.post(this.apiUrl + "Designation/deleteDesignation", obj, { headers: this.headers });
  }

  // Department
  getDepartmentList(obj: any) {
    return this.http.post(this.apiUrl + "Department/DepartmentList", obj, { headers: this.headers });
  }

  saveDepartment(obj: any) {
    return this.http.post(this.apiUrl + "Department/saveDepartment", obj, { headers: this.headers });
  }

  deleteDepartment(obj: any) {
    return this.http.post(this.apiUrl + "Department/deleteDepartment", obj, { headers: this.headers });
  }

  // Staff
  getStaffList(obj: any) {
    return this.http.post(this.apiUrl + "Staff/StaffList", obj, { headers: this.headers });
  }

  saveStaff(obj: any) {
    return this.http.post(this.apiUrl + "Staff/saveStaff", obj, { headers: this.headers });
  }

  deleteStaff(obj: any) {
    return this.http.post(this.apiUrl + "Staff/deleteStaff", obj, { headers: this.headers });
  }

  // Staff Login
  StaffLogin(obj: any) {
    return this.http.post(this.apiUrl + "StaffLogin/StaffLogin", obj, { headers: this.headers });
  }

  getStaffLoginList(obj: any) {
    return this.http.post(this.apiUrl + "StaffLogin/StaffLoginList", obj, { headers: this.headers });
  }

  saveStaffLogin(obj: any) {
    return this.http.post(this.apiUrl + "StaffLogin/saveStaffLogin", obj, { headers: this.headers });
  }

  deleteStaffLogin(obj: any) {
    return this.http.post(this.apiUrl + "StaffLogin/deleteStaffLogin", obj, { headers: this.headers });
  }

  changePassword(obj: any) {
    return this.http.post(this.apiUrl + "StaffLogin/changePassword", obj, { headers: this.headers });
  }

  // PageGroup
  getPageGroupList(obj: any) {
    return this.http.post(this.apiUrl + "PageGroup/PageGroupList", obj, { headers: this.headers });
  }

  savePageGroup(obj: any) {
    return this.http.post(this.apiUrl + "PageGroup/savePageGroup", obj, { headers: this.headers });
  }

  deletePageGroup(obj: any) {
    return this.http.post(this.apiUrl + "PageGroup/deletePageGroup", obj, { headers: this.headers });
  }

  // Page
  getPageList(obj: any) {
    return this.http.post(this.apiUrl + "Page/PageList", obj, { headers: this.headers });
  }

  savePage(obj: any) {
    return this.http.post(this.apiUrl + "Page/savePage", obj, { headers: this.headers });
  }

  deletePage(obj: any) {
    return this.http.post(this.apiUrl + "Page/deletePage", obj, { headers: this.headers });
  }

  // Menu
  getUserMenuList(obj: any) {
    return this.http.post(this.apiUrl + "Menu/UserMenuList", obj, { headers: this.headers });
  }

  validiateMenu(obj: any) {
    return this.http.post(this.apiUrl + "Menu/ValidiateMenu", obj, { headers: this.headers });
  }

  getMenuList(obj: any) {
    return this.http.post(this.apiUrl + "Menu/MenuList", obj, { headers: this.headers });
  }

  saveMenu(obj: any) {
    return this.http.post(this.apiUrl + "Menu/saveMenu", obj, { headers: this.headers });
  }

  deleteMenu(obj: any) {
    return this.http.post(this.apiUrl + "Menu/deleteMenu", obj, { headers: this.headers });
  }

  menuUp(obj: any) {
    return this.http.post(this.apiUrl + "Menu/MenuUp", obj, { headers: this.headers });
  }

  menuDown(obj: any) {
    return this.http.post(this.apiUrl + "Menu/MenuDown", obj, { headers: this.headers });
  }

  // Role
  getRoleList(obj: any) {
    return this.http.post(this.apiUrl + "Role/RoleList", obj, { headers: this.headers });
  }

  saveRole(obj: any) {
    return this.http.post(this.apiUrl + "Role/saveRole", obj, { headers: this.headers });
  }

  deleteRole(obj: any) {
    return this.http.post(this.apiUrl + "Role/deleteRole", obj, { headers: this.headers });
  }

  // RoleMenu
  getRoleMenuList(obj: any) {
    return this.http.post(this.apiUrl + "RoleMenu/AllRoleMenuList", obj, { headers: this.headers });
  }

  saveRoleMenu(obj: any) {
    return this.http.post(this.apiUrl + "RoleMenu/saveRoleMenu", obj, { headers: this.headers });
  }

  // StaffLoginRole
  getStaffLoginRoleList(obj: any) {
    return this.http.post(this.apiUrl + "StaffLoginRole/StaffLoginRoleList", obj, { headers: this.headers });
  }

  saveStaffLoginRole(obj: any) {
    return this.http.post(this.apiUrl + "StaffLoginRole/saveStaffLoginRole", obj, { headers: this.headers });
  }

  deleteStaffLoginRole(obj: any) {
    return this.http.post(this.apiUrl + "StaffLoginRole/deleteStaffLoginRole", obj, { headers: this.headers });
  }

  // State
  getStateList(obj: any) {
    return this.http.post(this.apiUrl + "State/StateList", obj, { headers: this.headers });
  }

  saveState(obj: any) {
    return this.http.post(this.apiUrl + "State/saveState", obj, { headers: this.headers });
  }

  deleteState(obj: any) {
    return this.http.post(this.apiUrl + "State/deleteState", obj, { headers: this.headers });
  }

  // City
  getCityList(obj: any) {
    return this.http.post(this.apiUrl + "City/CityList", obj, { headers: this.headers });
  }

  saveCity(obj: any) {
    return this.http.post(this.apiUrl + "City/saveCity", obj, { headers: this.headers });
  }

  deleteCity(obj: any) {
    return this.http.post(this.apiUrl + "City/deleteCity", obj, { headers: this.headers });
  }

  // NewsArticle API Fetch
  getArticleList(obj: any) {
    return this.http.post(this.apiUrl + "NewsArticle/ArticleList", obj, { headers: this.headers });
  }

  private articlesCache = new Map<string, { time: number, data$: Observable<any> }>();

  getPublicArticles(districtId?: string, categoryId?: string, query?: string): Observable<any> {
    const key = `${districtId || 'all'}_${categoryId || '0'}_${query || ''}`;
    const cached = this.articlesCache.get(key);
    const now = Date.now();

    if (cached && (now - cached.time < 45000)) {
      return cached.data$;
    }

    let params: string[] = [];
    if (districtId) params.push(`districtId=${encodeURIComponent(districtId)}`);
    if (categoryId) params.push(`categoryId=${encodeURIComponent(categoryId)}`);
    if (query) params.push(`query=${encodeURIComponent(query)}`);
    const q = params.length ? '?' + params.join('&') : '';

    const obs$ = this.http.get(this.apiUrl + "NewsArticle/GetArticles" + q).pipe(
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.articlesCache.set(key, { time: now, data$: obs$ });
    return obs$;
  }

  getBreakingNews() {
    if (!this.breakingNewsCache$) {
      this.breakingNewsCache$ = this.http.get(this.apiUrl + "NewsArticle/GetBreakingNews").pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
      setTimeout(() => { this.breakingNewsCache$ = null; }, 60000);
    }
    return this.breakingNewsCache$;
  }

  getFeaturedArticles() {
    if (!this.featuredArticlesCache$) {
      this.featuredArticlesCache$ = this.http.get(this.apiUrl + "NewsArticle/GetFeaturedArticles").pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
      setTimeout(() => { this.featuredArticlesCache$ = null; }, 60000);
    }
    return this.featuredArticlesCache$;
  }

  getTrendingArticles() {
    if (!this.trendingArticlesCache$) {
      this.trendingArticlesCache$ = this.http.get(this.apiUrl + "NewsArticle/GetTrendingArticles").pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
      setTimeout(() => { this.trendingArticlesCache$ = null; }, 60000);
    }
    return this.trendingArticlesCache$;
  }

  incrementViewCount(articleId: number | string) {
    return this.http.post(this.apiUrl + "NewsArticle/IncrementViewCount/" + articleId, {});
  }

  saveArticle(obj: any) {
    this.articlesCache.clear();
    this.breakingNewsCache$ = null;
    this.trendingArticlesCache$ = null;
    this.featuredArticlesCache$ = null;
    return this.http.post(this.apiUrl + "NewsArticle/saveArticle", obj, { headers: this.headers });
  }

  deleteArticle(obj: any) {
    this.articlesCache.clear();
    this.breakingNewsCache$ = null;
    this.trendingArticlesCache$ = null;
    this.featuredArticlesCache$ = null;
    return this.http.post(this.apiUrl + "NewsArticle/deleteArticle", obj, { headers: this.headers });
  }

  // NewsCategory API Fetch
  getCategoryList(obj: any) {
    return this.http.post(this.apiUrl + "NewsCategory/CategoryList", obj, { headers: this.headers });
  }

  getPublicCategories() {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http.get(this.apiUrl + "NewsCategory/GetCategories").pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.categoriesCache$;
  }

  saveCategory(obj: any) {
    return this.http.post(this.apiUrl + "NewsCategory/saveCategory", obj, { headers: this.headers });
  }

  deleteCategory(obj: any) {
    return this.http.post(this.apiUrl + "NewsCategory/deleteCategory", obj, { headers: this.headers });
  }

  // NewsComment API Fetch
  getCommentList(obj: any) {
    return this.http.post(this.apiUrl + "NewsComment/CommentList", obj, { headers: this.headers });
  }

  getPublicComments(articleId: number | string) {
    return this.http.get(this.apiUrl + "NewsComment/GetComments/" + articleId);
  }

  postPublicComment(obj: any) {
    return this.http.post(this.apiUrl + "NewsComment/PostComment", obj);
  }

  saveComment(obj: any) {
    return this.http.post(this.apiUrl + "NewsComment/saveComment", obj, { headers: this.headers });
  }

  deleteComment(obj: any) {
    return this.http.post(this.apiUrl + "NewsComment/deleteComment", obj, { headers: this.headers });
  }

  // App API Fetch
  getAppList(obj: any) {
    return this.http.post(this.apiUrl + "App/AppList", obj, { headers: this.headers });
  }

  saveApp(obj: any) {
    return this.http.post(this.apiUrl + "App/saveApp", obj, { headers: this.headers });
  }

  deleteApp(obj: any) {
    return this.http.post(this.apiUrl + "App/deleteApp", obj, { headers: this.headers });
  }

  // Backup API Fetch
  getBackupList(obj: any) {
    return this.http.post(this.apiUrl + "Backup/BackupList", obj, { headers: this.headers });
  }

  saveBackup(obj: any) {
    return this.http.post(this.apiUrl + "Backup/saveBackup", obj, { headers: this.headers });
  }

  deleteBackup(obj: any) {
    return this.http.post(this.apiUrl + "Backup/deleteBackup", obj, { headers: this.headers });
  }

  // Database API Fetch
  getDatabaseList(obj: any) {
    return this.http.post(this.apiUrl + "Database/DatabaseList", obj, { headers: this.headers });
  }

  saveDatabase(obj: any) {
    return this.http.post(this.apiUrl + "Database/saveDatabase", obj, { headers: this.headers });
  }

  deleteDatabase(obj: any) {
    return this.http.post(this.apiUrl + "Database/deleteDatabase", obj, { headers: this.headers });
  }

  // LoginLog API Fetch
  getLoginLogList(obj: any) {
    return this.http.post(this.apiUrl + "LoginLog/LoginLogList", obj, { headers: this.headers });
  }

  // StateMaster API Fetch
  getStateMasterList(obj: any) {
    return this.http.post(this.apiUrl + "StateMaster/StateMasterList", obj, { headers: this.headers });
  }

  saveStateMaster(obj: any) {
    return this.http.post(this.apiUrl + "StateMaster/saveStateMaster", obj, { headers: this.headers });
  }

  deleteStateMaster(obj: any) {
    return this.http.post(this.apiUrl + "StateMaster/deleteStateMaster", obj, { headers: this.headers });
  }
}
