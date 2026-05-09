export interface NewsDetailDto {
  /** Backend varsa guncelleme/silme icin gerekir. */
  id?: number;
  categoryId?: number;
  authorId?: number;
  title: string;
  content: string;
  imageUrl: string;
  publishDate: string;
  categoryName: string;
  authorName: string;
  /** Arayuzde Draft | Published; API genelde 1=Taslak, 2=Yayinda doner. */
  status: string | number;
  spotText: string;
  viewCount: number;
}
