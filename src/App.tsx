import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './lib/theme-provider';
import { AuthProvider } from './lib/auth-provider';
import { AuthGuard } from './components/auth-guard';
import { LoginPage } from './pages/login';
import { BookListPage } from './pages/book-list';
import { BookDetailPage } from './pages/book-detail';
import { BookEditPage } from './pages/book-edit';
import { BookNewPage } from './pages/book-new';

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
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
