import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// TODO: Replace with actual values when ready to connect
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Supabase client for database operations
 * 
 * Currently configured as a stub for future migration.
 * When ready to connect:
 * 1. Add environment variables to .env file
 * 2. Update table schemas to match backend
 * 3. Replace mock API calls with Supabase queries
 * 4. Enable RLS policies
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Database type definitions
 * These should be generated from Supabase schema using:
 * npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
 */
export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          cover_image_url: string | null;
          total_pages: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          cover_image_url?: string | null;
          total_pages?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          cover_image_url?: string | null;
          total_pages?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reading_logs: {
        Row: {
          id: string;
          book_id: string;
          status: 'want_to_read' | 'reading' | 'finished' | 'abandoned';
          current_page: number | null;
          rating: number | null;
          start_date: string | null;
          end_date: string | null;
          review: string | null;
          notion_page_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          status?: 'want_to_read' | 'reading' | 'finished' | 'abandoned';
          current_page?: number | null;
          rating?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          review?: string | null;
          notion_page_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          status?: 'want_to_read' | 'reading' | 'finished' | 'abandoned';
          current_page?: number | null;
          rating?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          review?: string | null;
          notion_page_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          reading_log_id: string;
          text: string;
          page_number: number;
          noted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reading_log_id: string;
          text: string;
          page_number: number;
          noted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reading_log_id?: string;
          text?: string;
          page_number?: number;
          noted_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

/**
 * Example Supabase queries (commented out until ready to use)
 */

// Example: Fetch reading records with joins
/*
export async function fetchReadingRecords() {
  const { data, error } = await supabase
    .from('reading_logs')
    .select(`
      *,
      book:books(*),
      quotes(*)
    `)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
*/

// Example: Create a new book and reading log
/*
export async function createBookWithLog(bookData, logData) {
  // Insert book
  const { data: book, error: bookError } = await supabase
    .from('books')
    .insert(bookData)
    .select()
    .single();
  
  if (bookError) throw bookError;
  
  // Insert reading log
  const { data: log, error: logError } = await supabase
    .from('reading_logs')
    .insert({ ...logData, book_id: book.id })
    .select()
    .single();
  
  if (logError) throw logError;
  
  return { book, log };
}
*/
