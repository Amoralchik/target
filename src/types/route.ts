export interface Params {
  id?: string;
}

export interface Body {
  username?: string;
  password?: string;
  title?: string;
  content?: string;
  author?: number;
  postsIds?: number[];
  categoriesIds?: number[];
}

export interface Query {
  category?: string;
  author?: string;
  startDate?: string;
  endDate?: string;
  count?: string;
  page?: string;
}
