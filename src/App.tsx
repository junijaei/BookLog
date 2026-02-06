import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthGuard } from './components/auth-guard';
import { AuthProvider } from './lib/auth/auth-provider';
import { ThemeProvider } from './lib/theme-provider';
import { BookDetailPage } from './pages/book-detail';
import { BookEditPage } from './pages/book-edit';
import { BookListPage } from './pages/book-list';
import { BookNewPage } from './pages/book-new';
import { ErrorPage } from './pages/error';
import { LoginPage } from './pages/login';
import { NotFoundPage } from './pages/not-found';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <BookListPage />
                </AuthGuard>
              }
            />
            <Route
              path="/books/new"
              element={
                <AuthGuard>
                  <BookNewPage />
                </AuthGuard>
              }
            />
            <Route
              path="/books/:id"
              element={
                <AuthGuard>
                  <BookDetailPage />
                </AuthGuard>
              }
            />
            <Route
              path="/books/:id/edit"
              element={
                <AuthGuard>
                  <BookEditPage />
                </AuthGuard>
              }
            />

            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
