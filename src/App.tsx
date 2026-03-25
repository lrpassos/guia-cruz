import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { BusinessPage } from './pages/BusinessPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ScannerPage } from './pages/ScannerPage';
import { useEffect } from 'react';
import { seedDatabase } from './lib/seed';

export default function App() {
  useEffect(() => {
    // Seed database with initial data if empty
    seedDatabase();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/business/:id" element={<BusinessPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/scan" element={<ScannerPage />} />
          <Route path="/news" element={<NotificationsPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
