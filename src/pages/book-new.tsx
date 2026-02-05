import { FormField } from '@/components/form-field';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateBook } from '@/hooks';
import {
  BUTTON_LABELS,
  FIELD_LABELS,
  MESSAGES,
  MISC,
  PAGE_TITLES,
  PLACEHOLDERS,
} from '@/lib/constants';
import type { BookFormData } from '@/types';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

export function BookNewPage() {
  const navigate = useNavigate();
  const createBookMutation = useCreateBook();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormData>({
    defaultValues: {
      title: '',
      author: '',
      cover_image_url: '',
      total_pages: '',
    },
  });

  const onSubmit = async (data: BookFormData) => {
    try {
      const response = await createBookMutation.mutateAsync({
        title: data.title,
        author: data.author,
        cover_image_url: data.cover_image_url || null,
        total_pages: data.total_pages ? parseInt(data.total_pages) : null,
      });

      navigate(`/books/${response.reading_log.id}`);
    } catch (error) {
      console.error('Failed to create book:', error);
      alert(MESSAGES.FAILED_TO_CREATE);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">{PAGE_TITLES.BOOK_NEW}</h1>
            <div className="flex gap-2 items-center">
              <ThemeToggle />
              <Link to="/">
                <Button variant="outline" size="sm">
                  {BUTTON_LABELS.CANCEL}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{MISC.BOOK_DETAILS}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormField
                label={FIELD_LABELS.TITLE}
                required
                htmlFor="title"
                error={errors.title?.message}
              >
                <Input
                  id="title"
                  className="text-sm"
                  {...register('title', { required: MESSAGES.TITLE_AUTHOR_REQUIRED })}
                />
              </FormField>

              <FormField
                label={FIELD_LABELS.AUTHOR}
                required
                htmlFor="author"
                error={errors.author?.message}
              >
                <Input
                  id="author"
                  className="text-sm"
                  {...register('author', { required: MESSAGES.TITLE_AUTHOR_REQUIRED })}
                />
              </FormField>

              <FormField label={FIELD_LABELS.COVER_IMAGE_URL} htmlFor="cover_image_url">
                <Input
                  id="cover_image_url"
                  type="url"
                  placeholder={PLACEHOLDERS.COVER_IMAGE_URL}
                  className="text-sm"
                  {...register('cover_image_url')}
                />
              </FormField>

              <FormField label={FIELD_LABELS.TOTAL_PAGES} htmlFor="total_pages">
                <Input
                  id="total_pages"
                  type="number"
                  min="1"
                  className="text-sm"
                  {...register('total_pages', {
                    validate: value =>
                      !value || parseInt(value) > 0 || '페이지 수는 1 이상이어야 합니다',
                  })}
                />
              </FormField>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  disabled={createBookMutation.isPending}
                >
                  {createBookMutation.isPending ? BUTTON_LABELS.CREATING : BUTTON_LABELS.CREATE}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
