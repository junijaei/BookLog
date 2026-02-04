import type {
  Book,
  ReadingLog,
  Quote,
  ReadingRecord,
  CreateBookInput,
  CreateReadingLogInput,
  UpdateReadingLogInput,
  CreateQuoteInput,
  UpdateQuoteInput,
  ReadingRecordFilters,
  ReadingRecordSort,
  PaginationParams,
  PaginatedResponse,
} from '@/types';
import { mockBooks, mockReadingLogs, mockQuotes, buildReadingRecords } from './mock-data';

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Generate UUID
const generateId = () => crypto.randomUUID();

// Mock Notion sync function
export async function mockSyncToNotion(readingLogId: string): Promise<void> {
  await delay(500);
  console.log(`[Mock] Synced reading log ${readingLogId} to Notion`);
}

// ===== Books API =====

export async function getBooks(): Promise<Book[]> {
  await delay();
  return [...mockBooks];
}

export async function getBook(id: string): Promise<Book | null> {
  await delay();
  return mockBooks.find(b => b.id === id) || null;
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  await delay();
  const now = new Date().toISOString();
  const book: Book = {
    id: generateId(),
    title: input.title,
    author: input.author,
    cover_image_url: input.cover_image_url || null,
    total_pages: input.total_pages || null,
    created_at: now,
    updated_at: now,
  };
  mockBooks.push(book);
  return book;
}

export async function updateBook(id: string, input: Partial<CreateBookInput>): Promise<Book> {
  await delay();
  const book = mockBooks.find(b => b.id === id);
  if (!book) throw new Error('Book not found');

  Object.assign(book, {
    ...input,
    updated_at: new Date().toISOString(),
  });

  return book;
}

export async function deleteBook(id: string): Promise<void> {
  await delay();
  const index = mockBooks.findIndex(b => b.id === id);
  if (index !== -1) {
    mockBooks.splice(index, 1);
  }
}

// ===== Reading Logs API =====

export async function getReadingLog(id: string): Promise<ReadingLog | null> {
  await delay();
  return mockReadingLogs.find(log => log.id === id) || null;
}

export async function createReadingLog(input: CreateReadingLogInput): Promise<ReadingLog> {
  await delay();
  const now = new Date().toISOString();
  const log: ReadingLog = {
    id: generateId(),
    book_id: input.book_id,
    status: input.status || 'want_to_read',
    current_page: input.current_page || null,
    rating: input.rating || null,
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    review: input.review || null,
    notion_page_id: null,
    created_at: now,
    updated_at: now,
  };
  mockReadingLogs.push(log);

  // Trigger mock Notion sync
  await mockSyncToNotion(log.id);

  return log;
}

export async function updateReadingLog(
  id: string,
  input: UpdateReadingLogInput
): Promise<ReadingLog> {
  await delay();
  const log = mockReadingLogs.find(l => l.id === id);
  if (!log) throw new Error('Reading log not found');

  Object.assign(log, {
    ...input,
    updated_at: new Date().toISOString(),
  });

  // Trigger mock Notion sync
  await mockSyncToNotion(log.id);

  return log;
}

export async function deleteReadingLog(id: string): Promise<void> {
  await delay();

  // Delete associated quotes first
  const quoteIndices = mockQuotes
    .map((q, i) => (q.reading_log_id === id ? i : -1))
    .filter(i => i !== -1)
    .reverse();
  quoteIndices.forEach(i => mockQuotes.splice(i, 1));

  // Delete reading log
  const logIndex = mockReadingLogs.findIndex(l => l.id === id);
  if (logIndex !== -1) {
    const log = mockReadingLogs[logIndex];
    mockReadingLogs.splice(logIndex, 1);

    // Delete book if no more reading logs exist
    const hasOtherLogs = mockReadingLogs.some(l => l.book_id === log.book_id);
    if (!hasOtherLogs) {
      await deleteBook(log.book_id);
    }
  }
}

// ===== Quotes API =====

export async function getQuotes(readingLogId: string): Promise<Quote[]> {
  await delay();
  return mockQuotes.filter(q => q.reading_log_id === readingLogId);
}

export async function createQuote(input: CreateQuoteInput): Promise<Quote> {
  await delay();
  const now = new Date().toISOString();
  const quote: Quote = {
    id: generateId(),
    reading_log_id: input.reading_log_id,
    text: input.text,
    page_number: input.page_number,
    noted_at: input.noted_at || null,
    created_at: now,
  };
  mockQuotes.push(quote);
  return quote;
}

export async function updateQuote(id: string, input: UpdateQuoteInput): Promise<Quote> {
  await delay();
  const quote = mockQuotes.find(q => q.id === id);
  if (!quote) throw new Error('Quote not found');

  Object.assign(quote, input);
  return quote;
}

export async function deleteQuote(id: string): Promise<void> {
  await delay();
  const index = mockQuotes.findIndex(q => q.id === id);
  if (index !== -1) {
    mockQuotes.splice(index, 1);
  }
}

// ===== Reading Records API (Composite) =====

export async function getReadingRecords(
  filters?: ReadingRecordFilters,
  sort?: ReadingRecordSort,
  pagination?: PaginationParams
): Promise<PaginatedResponse<ReadingRecord>> {
  await delay();

  let records = buildReadingRecords();

  // Apply filters
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      records = records.filter(r => filters.status!.includes(r.reading_log.status));
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      records = records.filter(
        r =>
          r.book.title.toLowerCase().includes(search) ||
          r.book.author.toLowerCase().includes(search)
      );
    }

    if (filters.start_date_from) {
      records = records.filter(
        r => r.reading_log.start_date && r.reading_log.start_date >= filters.start_date_from!
      );
    }

    if (filters.start_date_to) {
      records = records.filter(
        r => r.reading_log.start_date && r.reading_log.start_date <= filters.start_date_to!
      );
    }

    if (filters.end_date_from) {
      records = records.filter(
        r => r.reading_log.end_date && r.reading_log.end_date >= filters.end_date_from!
      );
    }

    if (filters.end_date_to) {
      records = records.filter(
        r => r.reading_log.end_date && r.reading_log.end_date <= filters.end_date_to!
      );
    }
  }

  // Apply sorting
  if (sort) {
    records.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sort.field) {
        case 'updated_at':
          aVal = a.reading_log.updated_at;
          bVal = b.reading_log.updated_at;
          break;
        case 'start_date':
          aVal = a.reading_log.start_date || '';
          bVal = b.reading_log.start_date || '';
          break;
        case 'end_date':
          aVal = a.reading_log.end_date || '';
          bVal = b.reading_log.end_date || '';
          break;
        case 'created_at':
          aVal = a.reading_log.created_at;
          bVal = b.reading_log.created_at;
          break;
        default:
          aVal = a.reading_log.updated_at;
          bVal = b.reading_log.updated_at;
      }

      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Apply pagination (simple cursor-based)
  const limit = pagination?.limit || 10;
  const cursorIndex = pagination?.cursor ? parseInt(pagination.cursor, 10) : 0;

  const paginatedRecords = records.slice(cursorIndex, cursorIndex + limit);
  const hasMore = cursorIndex + limit < records.length;
  const nextCursor = hasMore ? String(cursorIndex + limit) : null;

  return {
    data: paginatedRecords,
    next_cursor: nextCursor,
    has_more: hasMore,
  };
}

export async function getReadingRecord(id: string): Promise<ReadingRecord | null> {
  await delay();
  const log = mockReadingLogs.find(l => l.id === id);
  if (!log) return null;

  const book = mockBooks.find(b => b.id === log.book_id);
  if (!book) return null;

  const quotes = mockQuotes.filter(q => q.reading_log_id === log.id);

  return {
    book,
    reading_log: log,
    quotes,
  };
}

// Combined create for new book registration
export async function createReadingRecord(
  bookInput: CreateBookInput,
  logInput: Omit<CreateReadingLogInput, 'book_id'>
): Promise<ReadingRecord> {
  await delay();

  const book = await createBook(bookInput);
  const reading_log = await createReadingLog({ ...logInput, book_id: book.id });

  return {
    book,
    reading_log,
    quotes: [],
  };
}
