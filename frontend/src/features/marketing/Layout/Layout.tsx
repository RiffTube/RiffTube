import Footer from './components/Footer';
import Header from './components/Header';

interface LayoutProps {
  children: React.ReactNode;
  openSignIn: () => void;
}

function Layout({ children, openSignIn }: LayoutProps) {
  return (
    <div className="flex flex-col bg-backstage font-sans text-white">
      <Header openSignIn={openSignIn} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
