import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FormField } from '@/components/form-field';
import { BookEditSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDeleteReadingRecord, useReadingRecord, useUpsertReadingRecord } from '@/hooks';
import {
  BUTTON_LABELS,
  FIELD_LABELS,
  getReadingStatusLabel,
  MESSAGES,
  MISC,
  PLACEHOLDERS,
} from '@/lib/constants';
import type { BookEditFormData, LocalQuote, NewQuoteFormData, Quote, ReadingStatus } from '@/types';

const READING_STATUSES: ReadingStatus[] = ['want_to_read', 'reading', 'finished', 'abandoned'];

export function BookEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: record, isLoading } = useReadingRecord(id);
  const upsertMutation = useUpsertReadingRecord();
  const deleteMutation = useDeleteReadingRecord();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<BookEditFormData>({
    defaultValues: {
      title: '',
      author: '',
      cover_image_url: '',
      total_pages: '',
      status: 'want_to_read',
      current_page: '',
      rating: '',
      start_date: '',
      end_date: '',
      review: '',
    },
  });

  const [quotes, setQuotes] = useState<LocalQuote[]>([]);
  const [deletedQuoteIds, setDeletedQuoteIds] = useState<string[]>([]);

  const {
    register: registerQuote,
    handleSubmit: handleQuoteSubmit,
    reset: resetQuote,
    watch: watchQuote,
  } = useForm<NewQuoteFormData>({
    defaultValues: { text: '', page_number: '' },
  });

  const newQuoteText = watchQuote('text');
  const newQuotePage = watchQuote('page_number');

  useEffect(() => {
    if (!record) return;

    reset({
      title: record.book.title,
      author: record.book.author,
      cover_image_url: record.book.cover_image_url || '',
      total_pages: record.book.total_pages?.toString() || '',
      status: record.reading_log.status,
      current_page: record.reading_log.current_page?.toString() || '',
      rating: record.reading_log.rating?.toString() || '',
      start_date: record.reading_log.start_date || '',
      end_date: record.reading_log.end_date || '',
      review: record.reading_log.review || '',
    });

    setQuotes(
      record.quotes.map((q: Quote) => ({
        id: q.id,
        text: q.text,
        page_number: q.page_number,
        noted_at: q.noted_at,
      }))
    );
  }, [record, reset]);

  const onSubmit = async (data: BookEditFormData) => {
    if (!record || !id) return;

    try {
      await upsertMutation.mutateAsync({
        book: {
          id: record.book.id,
          title: data.title,
          author: data.author,
          cover_image_url: data.cover_image_url || null,
          total_pages: data.total_pages ? parseInt(data.total_pages) : null,
        },
        reading_log: {
          id: id,
          status: data.status,
          current_page: data.current_page ? parseInt(data.current_page) : null,
          rating: data.rating ? parseInt(data.rating) : null,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          review: data.review || null,
        },
        quotes: quotes.map(q => ({
          id: q.id,
          text: q.text,
          page_number: q.page_number,
          noted_at: q.noted_at,
        })),
        delete_quote_ids: deletedQuoteIds.length > 0 ? deletedQuoteIds : undefined,
      });

      navigate(`/books/${id}`);
    } catch (error) {
      console.error('Failed to save:', error);
      alert(MESSAGES.FAILED_TO_SAVE);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync({ reading_log_id: id });
      navigate('/');
    } catch (error) {
      console.error('Failed to delete:', error);
      alert(MESSAGES.FAILED_TO_DELETE);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const onAddQuote = (data: NewQuoteFormData) => {
    const newQuote: LocalQuote = {
      text: data.text,
      page_number: parseInt(data.page_number),
      noted_at: new Date().toISOString().split('T')[0],
      isNew: true,
    };

    setQuotes(prev => [...prev, newQuote]);
    resetQuote();
  };

  const handleDeleteQuote = (index: number) => {
    const quote = quotes[index];

    if (quote.id) {
      setDeletedQuoteIds(prev => [...prev, quote.id!]);
    }

    setQuotes(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
          <div className="container mx-auto px-4 py-3 max-w-4xl">
            <div className="flex justify-between items-center">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  ← {BUTTON_LABELS.CANCEL}
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-4 max-w-4xl">
          <BookEditSkeleton />
        </main>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen">
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground mb-4">{MESSAGES.BOOK_NOT_FOUND}</p>
          <Link to="/">
            <Button variant="outline" size="sm">
              {BUTTON_LABELS.BACK_TO_LIST}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex justify-between items-center">
            <Link to={`/books/${id}`}>
              <Button variant="ghost" size="sm">
                ← {BUTTON_LABELS.CANCEL}
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleteMutation.isPending}
              >
                {BUTTON_LABELS.DELETE}
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || deleteMutation.isPending}
              >
                {isSubmitting ? BUTTON_LABELS.SAVING : BUTTON_LABELS.SAVE}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* SECTION 1: Book Information */}
          <Card className="mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">{MISC.BOOK_DETAILS}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={FIELD_LABELS.TITLE} htmlFor="title">
                  <Input id="title" {...register('title')} />
                </FormField>

                <FormField label={FIELD_LABELS.AUTHOR} htmlFor="author">
                  <Input id="author" {...register('author')} />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={FIELD_LABELS.COVER_IMAGE_URL} htmlFor="cover_image_url">
                  <Input id="cover_image_url" {...register('cover_image_url')} />
                </FormField>

                <FormField label={FIELD_LABELS.TOTAL_PAGES} htmlFor="total_pages">
                  <Input id="total_pages" type="number" {...register('total_pages')} />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: Reading Record */}
          <Card className="mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">{MISC.READING_LOG}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Status & Progress row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label={FIELD_LABELS.STATUS} htmlFor="status">
                  <Select id="status" {...register('status')}>
                    {READING_STATUSES.map(status => (
                      <option key={status} value={status}>
                        {getReadingStatusLabel(status)}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label={FIELD_LABELS.CURRENT_PAGE} htmlFor="current_page">
                  <Input id="current_page" type="number" {...register('current_page')} />
                </FormField>

                <FormField label={FIELD_LABELS.RATING} htmlFor="rating">
                  <Input id="rating" type="number" min="1" max="5" {...register('rating')} />
                </FormField>
              </div>

              {/* Dates row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={FIELD_LABELS.START_DATE} htmlFor="start_date">
                  <Input id="start_date" type="date" {...register('start_date')} />
                </FormField>

                <FormField label={FIELD_LABELS.END_DATE} htmlFor="end_date">
                  <Input id="end_date" type="date" {...register('end_date')} />
                </FormField>
              </div>

              {/* Review - larger textarea with better line height */}
              <FormField label={FIELD_LABELS.REVIEW} htmlFor="review">
                <Textarea
                  id="review"
                  {...register('review')}
                  rows={6}
                  className="leading-relaxed"
                />
              </FormField>
            </CardContent>
          </Card>
        </form>

        {/* SECTION 3: Quotes */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">{FIELD_LABELS.QUOTES}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Add new quote form */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <FormField label={MISC.ADD_NEW_QUOTE} htmlFor="new_quote_text">
                <Textarea
                  id="new_quote_text"
                  placeholder={PLACEHOLDERS.QUOTE_TEXT}
                  {...registerQuote('text')}
                  rows={4}
                  className="min-h-[120px] leading-relaxed"
                />
              </FormField>
              <div className="flex gap-3 items-center">
                <Input
                  type="number"
                  placeholder={PLACEHOLDERS.PAGE_NUMBER}
                  className="w-28"
                  {...registerQuote('page_number')}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleQuoteSubmit(onAddQuote)}
                  disabled={!newQuoteText || !newQuotePage}
                >
                  {BUTTON_LABELS.ADD}
                </Button>
              </div>
            </div>

            {/* Existing quotes list */}
            {quotes.length > 0 && (
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {quotes.length}개의 인용구
                </h4>
                {quotes.map((quote, index) => (
                  <div
                    key={quote.id ?? `new-${index}`}
                    className="border-l-2 border-primary/20 pl-4 py-3 group"
                  >
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      &ldquo;{quote.text}&rdquo;
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-muted-foreground">
                        p.{quote.page_number}
                        {quote.isNew && (
                          <span className="ml-2 text-blue-500">({MISC.WILL_BE_ADDED_ON_SAVE})</span>
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuote(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {BUTTON_LABELS.DELETE}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">{MESSAGES.DELETE_CONFIRMATION_TITLE}</DialogTitle>
            <DialogDescription className="text-sm">
              {MESSAGES.DELETE_CONFIRMATION_MESSAGE}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              {BUTTON_LABELS.CANCEL}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? MESSAGES.DELETING : BUTTON_LABELS.DELETE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
