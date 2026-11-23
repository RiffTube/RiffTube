import Footer from './components/Footer';
import Header from './components/Header';

interface LayoutProps {
  children: React.ReactNode;
  openSignIn: () => void;
}

function Layout({ children, openSignIn }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-ink font-sans text-paper">
      <Header openSignIn={openSignIn} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
