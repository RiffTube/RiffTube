import { useState } from 'react';
import SignInModal from '@/features/auth/components/modals/SignInModal/SignInModal';
import SignUpModal from '@/features/auth/components/modals/SignUpModal/SignUpModal';
import { launchGoogleOAuth } from '@/features/auth/services/launchGoogleOAuth';
import Layout from '../../Layout';
import FAQSection from './components/FAQSection/FAQSection';
import HeroSection from './components/HeroSection/HeroSection';
import HowItWorksSection from './components/HowItWorksSection/HowItWorksSection';

function LandingPage() {
  // --- Sign Up modal state
  const [isSignUpOpen, setSignUpOpen] = useState(false);
  const openSignUp = () => setSignUpOpen(true);
  const closeSignUp = () => setSignUpOpen(false);

  // --- Sign In modal state
  const [isSignInOpen, setSignInOpen] = useState(false);
  const openSignIn = () => setSignInOpen(true);
  const closeSignIn = () => setSignInOpen(false);

  const switchToSignIn = () => {
    closeSignUp();
    openSignIn();
  };
  const switchToSignUp = () => {
    closeSignIn();
    openSignUp();
  };

  return (
    <Layout openSignIn={openSignIn}>
      <HeroSection openSignUp={openSignUp} />
      <HowItWorksSection />
      <FAQSection />
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={closeSignUp}
        onSwitchToSignIn={switchToSignIn}
        onGoogle={() => launchGoogleOAuth('signup')}
      />
      <SignInModal
        isOpen={isSignInOpen}
        onClose={closeSignIn}
        onSwitchToSignUp={switchToSignUp}
        onGoogle={() => launchGoogleOAuth('signin')}
      />
    </Layout>
  );
}

export default LandingPage;
