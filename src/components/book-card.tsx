import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from './ui/card';
import { StatusBadge } from './status-badge';
import { BookCover } from './book-cover';
import type { ReadingRecord } from '@/types';
import {
  formatDateRange,
  formatPageProgress,
  formatPercentage,
  renderRatingStars,
  FIELD_LABELS,
} from '@/lib/constants';

interface BookCardProps {
  record: ReadingRecord;
}

export function BookCard({ record }: BookCardProps) {
  const { book, reading_log } = record;

  const progress =
    book.total_pages && reading_log.current_page
      ? Math.round((reading_log.current_page / book.total_pages) * 100)
      : null;

  const dateRange = formatDateRange(reading_log.start_date, reading_log.end_date);

  return (
    <Link to={`/books/${reading_log.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <BookCover url={book.cover_image_url} alt={book.title} size="sm" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{book.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{book.author}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusBadge status={reading_log.status} />
                {reading_log.rating && (
                  <span className="text-xs text-amber-500">
                    {renderRatingStars(reading_log.rating)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-1.5">
          {progress !== null && book.total_pages && reading_log.current_page && (
            <div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                <span>{FIELD_LABELS.PROGRESS}</span>
                <span>
                  {formatPageProgress(reading_log.current_page, book.total_pages)} (
                  {formatPercentage(reading_log.current_page, book.total_pages)})
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {dateRange && <p className="text-[10px] text-muted-foreground">{dateRange}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}
