import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookCover } from '@/components/book-cover';
import { DateRangeDisplay } from '@/components/date-range-display';
import { FormField } from '@/components/form-field';
import { ProgressBar } from '@/components/progress-bar';
import { RatingDisplay } from '@/components/rating-display';
import { BookDetailSkeleton } from '@/components/skeletons';
import { StatusBadge } from '@/components/status-badge';
import { ThemeToggle } from '@/components/theme-toggle';
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
import { Textarea } from '@/components/ui/textarea';
import { useCreateQuote, useDeleteQuote, useReadingRecord, useUpdateQuote } from '@/hooks';
import { BUTTON_LABELS, FIELD_LABELS, MESSAGES, MISC, PLACEHOLDERS } from '@/lib/constants';
import type { Quote } from '@/types';

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: record, isLoading } = useReadingRecord(id);

  const createQuoteMutation = useCreateQuote();
  const updateQuoteMutation = useUpdateQuote(id ?? '');
  const deleteQuoteMutation = useDeleteQuote(id ?? '');

  const [showAddQuote, setShowAddQuote] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuotePage, setNewQuotePage] = useState('');

  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editQuoteText, setEditQuoteText] = useState('');
  const [editQuotePage, setEditQuotePage] = useState('');

  const [deleteQuoteDialogOpen, setDeleteQuoteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

  const handleAddQuote = async () => {
    if (!id || !newQuoteText.trim() || !newQuotePage) return;

    try {
      await createQuoteMutation.mutateAsync({
        reading_log_id: id,
        text: newQuoteText.trim(),
        page_number: parseInt(newQuotePage),
        noted_at: new Date().toISOString().split('T')[0],
      });

      setNewQuoteText('');
      setNewQuotePage('');
      setShowAddQuote(false);
    } catch (error) {
      console.error('Failed to add quote:', error);
      alert(MESSAGES.FAILED_TO_CREATE);
    }
  };

  const openEditDialog = (quote: Quote) => {
    setEditingQuote(quote);
    setEditQuoteText(quote.text);
    setEditQuotePage(quote.page_number.toString());
  };

  const handleUpdateQuote = async () => {
    if (!editingQuote || !editQuoteText.trim() || !editQuotePage) return;

    try {
      await updateQuoteMutation.mutateAsync({
        id: editingQuote.id,
        text: editQuoteText.trim(),
        page_number: parseInt(editQuotePage),
      });

      setEditingQuote(null);
    } catch (error) {
      console.error('Failed to update quote:', error);
      alert(MESSAGES.FAILED_TO_SAVE);
    }
  };

  const openDeleteDialog = (quote: Quote) => {
    setQuoteToDelete(quote);
    setDeleteQuoteDialogOpen(true);
  };

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return;

    try {
      await deleteQuoteMutation.mutateAsync({ id: quoteToDelete.id });

      setDeleteQuoteDialogOpen(false);
      setQuoteToDelete(null);
    } catch (error) {
      console.error('Failed to delete quote:', error);
      alert(MESSAGES.FAILED_TO_DELETE);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
          <div className="container mx-auto px-4 py-3 max-w-4xl">
            <div className="flex justify-between items-center">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  ← {BUTTON_LABELS.BACK}
                </Button>
              </Link>
              <div className="flex gap-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-4 max-w-4xl">
          <BookDetailSkeleton />
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

  const { book, reading_log, quotes } = record;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex justify-between items-center">
            <Link to="/">
              <Button variant="ghost" size="sm">
                ← {BUTTON_LABELS.BACK}
              </Button>
            </Link>
            <div className="flex gap-2">
              <ThemeToggle />
              <Link to={`/books/${id}/edit`}>
                <Button size="sm">{BUTTON_LABELS.EDIT}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-4xl">
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex gap-4">
              <BookCover url={book.cover_image_url} alt={book.title} size="md" />
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">{book.title}</CardTitle>
                <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
                <StatusBadge status={reading_log.status} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProgressBar
              currentPage={reading_log.current_page}
              totalPages={book.total_pages}
              showLabel={true}
            />

            {reading_log.rating && <RatingDisplay rating={reading_log.rating} />}

            <DateRangeDisplay startDate={reading_log.start_date} endDate={reading_log.end_date} />

            {reading_log.review && (
              <div>
                <h3 className="font-medium text-xs mb-1">{FIELD_LABELS.REVIEW}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {reading_log.review}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">
                {FIELD_LABELS.QUOTES} ({quotes.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowAddQuote(!showAddQuote)}>
                {showAddQuote ? BUTTON_LABELS.CANCEL : BUTTON_LABELS.ADD_QUOTE}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddQuote && (
              <div className="mb-4 p-3 border rounded-lg bg-muted/30">
                <h4 className="font-medium text-sm mb-2">{MISC.ADD_NEW_QUOTE}</h4>
                <div className="space-y-2">
                  <Textarea
                    placeholder={PLACEHOLDERS.QUOTE_TEXT}
                    value={newQuoteText}
                    onChange={e => setNewQuoteText(e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={PLACEHOLDERS.PAGE_NUMBER}
                      value={newQuotePage}
                      onChange={e => setNewQuotePage(e.target.value)}
                      className="w-24 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddQuote}
                      disabled={
                        !newQuoteText.trim() || !newQuotePage || createQuoteMutation.isPending
                      }
                    >
                      {createQuoteMutation.isPending ? MESSAGES.LOADING : BUTTON_LABELS.ADD}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {quotes.length > 0 ? (
              <div className="space-y-3">
                {quotes.map(quote => (
                  <div key={quote.id} className="border-l-4 border-primary/30 pl-3 py-1.5 group">
                    <p className="text-sm mb-1.5 whitespace-pre-wrap">&ldquo;{quote.text}&rdquo;</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        <span>
                          {FIELD_LABELS.PAGE_NUMBER} {quote.page_number}
                        </span>
                        {quote.noted_at && <span>{quote.noted_at}</span>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(quote)}>
                          {BUTTON_LABELS.EDIT}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(quote)}
                          disabled={deleteQuoteMutation.isPending}
                        >
                          {BUTTON_LABELS.DELETE}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !showAddQuote && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  {MESSAGES.NO_QUOTES}
                </p>
              )
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!editingQuote} onOpenChange={open => !open && setEditingQuote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">{MISC.EDIT_QUOTE}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <FormField label={FIELD_LABELS.QUOTE_TEXT} htmlFor="edit-quote-text">
              <Textarea
                id="edit-quote-text"
                value={editQuoteText}
                onChange={e => setEditQuoteText(e.target.value)}
                rows={4}
                className="text-sm"
              />
            </FormField>
            <FormField label={FIELD_LABELS.PAGE_NUMBER} htmlFor="edit-quote-page">
              <Input
                id="edit-quote-page"
                type="number"
                value={editQuotePage}
                onChange={e => setEditQuotePage(e.target.value)}
                className="text-sm"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingQuote(null)}
              disabled={updateQuoteMutation.isPending}
            >
              {BUTTON_LABELS.CANCEL}
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateQuote}
              disabled={!editQuoteText.trim() || !editQuotePage || updateQuoteMutation.isPending}
            >
              {updateQuoteMutation.isPending ? BUTTON_LABELS.SAVING : BUTTON_LABELS.SAVE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteQuoteDialogOpen} onOpenChange={setDeleteQuoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">{MISC.DELETE_QUOTE}</DialogTitle>
            <DialogDescription className="text-sm">
              {MESSAGES.DELETE_QUOTE_CONFIRMATION}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteQuoteDialogOpen(false)}
              disabled={deleteQuoteMutation.isPending}
            >
              {BUTTON_LABELS.CANCEL}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteQuote}
              disabled={deleteQuoteMutation.isPending}
            >
              {deleteQuoteMutation.isPending ? MESSAGES.DELETING : BUTTON_LABELS.DELETE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
