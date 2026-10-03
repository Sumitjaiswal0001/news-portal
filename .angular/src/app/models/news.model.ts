export interface JharkhandDistrict {
  id: string;
  name: string;
  hindiName: string;
  division: string;
  code: string;
}

export interface NewsCategory {
  id: string;
  name: string;
  hindiName: string;
  slug: string;
  icon?: string;
  description?: string;
  order: number;
}

export interface NewsComment {
  id: string;
  articleId: string;
  userName: string;
  userEmail: string;
  commentText: string;
  createdAt: string;
  isApproved: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  titleHindi?: string;
  subtitle?: string;
  slug: string;
  content: string;
  summary: string;
  thumbnailUrl: string;
  categoryId: string;
  categoryName: string;
  districtId: string;
  districtName: string;
  authorName: string;
  authorRole: string;
  publishedAt: string;
  updatedAt: string;
  viewCount: number;
  isBreaking: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  status: 'Published' | 'Draft' | 'Archived';
  youtubeUrl?: string;
  safeYoutubeUrl?: any;
  tags: string[];
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalCategories: number;
  totalDistricts: number;
  totalComments: number;
  pendingComments: number;
}
