import { Outlet } from 'react-router-dom';
import { LegalStatusBanner } from './LegalStatusBanner';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PublicLayout() {
  return (
    <>
      <LegalStatusBanner />
      <Navbar />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
