'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Collections from '@/components/Collections';
import Showcase from '@/components/Showcase';
import CustomDesignForm from '@/components/CustomDesignForm';
import Offers from '@/components/Offers';
import ReferralBanner from '@/components/ReferralBanner';
import WhyChooseUs from '@/components/WhyChooseUs';
import AboutUs from '@/components/AboutUs';
import Shipping from '@/components/Shipping';
import FAQ from '@/components/FAQ';
import ProductQuickPreview from '@/components/ProductQuickPreview';
import CheckoutModal from '@/components/CheckoutModal';
import CartDrawer from '@/components/CartDrawer';
import TrackOrderModal from '@/components/TrackOrderModal';
import InviteFriendsModal from '@/components/InviteFriendsModal';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import AuthModal from '@/components/AuthModal';
import UserProfileModal from '@/components/UserProfileModal';
import SizeChartModal from '@/components/SizeChartModal';

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const fetchInitialData = useStore((state) => state.fetchInitialData);
  const isLoading = useStore((state) => state.isLoading);
  const products = useStore((state) => state.products);
  const isSizeChartOpen = useStore((state) => state.isSizeChartOpen);
  const setIsSizeChartOpen = useStore((state) => state.setIsSizeChartOpen);

  const trackReferralClick = useStore((state) => state.trackReferralClick);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        const cleanRef = ref.trim();
        if (cleanRef.startsWith('REF-') || /^01[0-25]\d{8}$/.test(cleanRef)) {
          localStorage.setItem('ff_referrer_phone', cleanRef);
          const sessionTracked = sessionStorage.getItem('ff_referral_tracked');
          if (sessionTracked !== cleanRef) {
            trackReferralClick(cleanRef);
            sessionStorage.setItem('ff_referral_tracked', cleanRef);
          }
        }
      }
    }
  }, [trackReferralClick]);

  // Show branded loading screen on first load
  if (isLoading && products.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Collections />
        <Showcase />
        <CustomDesignForm />
        <Offers />
        <ReferralBanner />
        <WhyChooseUs />
        <AboutUs />
        <Shipping />
        <FAQ />
      </main>
      <Footer />
      
      {/* Quick Preview overlay */}
      <ProductQuickPreview />
      {/* Checkout form drawer overlay */}
      <CheckoutModal />
      {/* Cart Drawer overlay */}
      <CartDrawer />
      {/* Track Order modal overlay */}
      <TrackOrderModal />
      {/* Invite Friends modal overlay */}
      <InviteFriendsModal />
      {/* Auth Modal overlay */}
      <AuthModal />
      {/* Profile Modal overlay */}
      <UserProfileModal />
      {/* Size Chart Modal overlay */}
      <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} />
    </>
  );
}
