export interface NewsDetailDto {
  id?: number;
  categoryId?: number;
  authorId?: number;
  title: string;
  content: string;
  imageUrl: string;
  publishDate: string;
  categoryName: string;
  authorName: string;
  status: string | number;
  spotText: string;
  viewCount: number;
}
