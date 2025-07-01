import Layout from '../../Layout';
import FAQSection from './components/FAQSection/FAQSection';
import HeroSection from './components/HeroSection/HeroSection';
import HowItWorksSection from './components/HowItWorksSection/HowItWorksSection';

function LandingPage() {
  return (
    <Layout>
      <HeroSection />
      <HowItWorksSection />
      <FAQSection />
    </Layout>
  );
}

export default LandingPage;
