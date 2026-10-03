export interface Newsletter {
  NewsletterId: number;
  Title: string;
  PublishDate: string;
  PdfUrl: string;
  ThumbnailUrl?: string;
  Edition?: string;
  PageCount?: number;
  Status?: number;
  CreatedOn?: string;
  UpdatedOn?: string;
}
