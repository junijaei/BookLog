// Database schema types matching Supabase tables

export type ReadingStatus = 'want_to_read' | 'reading' | 'finished' | 'abandoned';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_image_url: string | null;
  total_pages: number | null;
  created_at: string;
  updated_at: string;
}

export interface ReadingLog {
  id: string;
  book_id: string;
  status: ReadingStatus;
  current_page: number | null;
  rating: number | null; // 1-5
  start_date: string | null;
  end_date: string | null;
  review: string | null;
  notion_page_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  reading_log_id: string;
  text: string;
  page_number: number;
  noted_at: string | null;
  created_at: string;
}

// Composite types for UI
export interface ReadingRecord {
  book: Book;
  reading_log: ReadingLog;
  quotes: Quote[];
}

// API request/response types
export interface CreateBookInput {
  title: string;
  author: string;
  cover_image_url?: string | null;
  total_pages?: number | null;
}

export interface CreateReadingLogInput {
  book_id: string;
  status?: ReadingStatus;
  current_page?: number | null;
  rating?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  review?: string | null;
}

export interface UpdateReadingLogInput {
  status?: ReadingStatus;
  current_page?: number | null;
  rating?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  review?: string | null;
}

export interface CreateQuoteInput {
  reading_log_id: string;
  text: string;
  page_number: number;
  noted_at?: string | null;
}

export interface UpdateQuoteInput {
  text?: string;
  page_number?: number;
  noted_at?: string | null;
}

// Filter and sort types for list page
export interface ReadingRecordFilters {
  status?: ReadingStatus[];
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  search?: string; // for title/author search
}

export type ReadingRecordSortField =
  | 'updated_at'
  | 'start_date'
  | 'end_date'
  | 'created_at';

export interface ReadingRecordSort {
  field: ReadingRecordSortField;
  direction: 'asc' | 'desc';
}

// Pagination
export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
}
