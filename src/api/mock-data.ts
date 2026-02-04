import type { Book, ReadingLog, Quote, ReadingRecord } from '@/types';

// Mock data storage (in-memory)
export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover_image_url: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
    total_pages: 180,
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    cover_image_url: 'https://covers.openlibrary.org/b/id/7222339-L.jpg',
    total_pages: 328,
    created_at: new Date('2024-02-01').toISOString(),
    updated_at: new Date('2024-02-04').toISOString(),
  },
  {
    id: '3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    cover_image_url: 'https://covers.openlibrary.org/b/id/8228691-L.jpg',
    total_pages: 336,
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date('2024-01-20').toISOString(),
  },
];

export const mockReadingLogs: ReadingLog[] = [
  {
    id: 'log-1',
    book_id: '1',
    status: 'finished',
    current_page: 180,
    rating: 5,
    start_date: '2024-01-15',
    end_date: '2024-02-01',
    review: 'A masterpiece of American literature. The symbolism is profound.',
    notion_page_id: null,
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'log-2',
    book_id: '2',
    status: 'reading',
    current_page: 156,
    rating: null,
    start_date: '2024-02-01',
    end_date: null,
    review: null,
    notion_page_id: null,
    created_at: new Date('2024-02-01').toISOString(),
    updated_at: new Date('2024-02-04').toISOString(),
  },
  {
    id: 'log-3',
    book_id: '3',
    status: 'want_to_read',
    current_page: null,
    rating: null,
    start_date: null,
    end_date: null,
    review: null,
    notion_page_id: null,
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date('2024-01-20').toISOString(),
  },
];

export const mockQuotes: Quote[] = [
  {
    id: 'quote-1',
    reading_log_id: 'log-1',
    text: 'So we beat on, boats against the current, borne back ceaselessly into the past.',
    page_number: 180,
    noted_at: '2024-02-01',
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'quote-2',
    reading_log_id: 'log-1',
    text: "I hope she'll be a fool—that's the best thing a girl can be in this world, a beautiful little fool.",
    page_number: 17,
    noted_at: '2024-01-16',
    created_at: new Date('2024-01-16').toISOString(),
  },
  {
    id: 'quote-3',
    reading_log_id: 'log-2',
    text: 'War is peace. Freedom is slavery. Ignorance is strength.',
    page_number: 4,
    noted_at: '2024-02-01',
    created_at: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'quote-4',
    reading_log_id: 'log-2',
    text: 'Big Brother is watching you.',
    page_number: 2,
    noted_at: '2024-02-01',
    created_at: new Date('2024-02-01').toISOString(),
  },
];

// Helper function to build reading records from relational data
export function buildReadingRecords(): ReadingRecord[] {
  return mockBooks.map(book => {
    const reading_log = mockReadingLogs.find(log => log.book_id === book.id);
    const quotes = reading_log
      ? mockQuotes.filter(q => q.reading_log_id === reading_log.id)
      : [];

    return {
      book,
      reading_log: reading_log || ({} as ReadingLog),
      quotes,
    };
  });
}
