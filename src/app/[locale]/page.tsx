'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Collections from '@/components/Collections';
import Showcase from '@/components/Showcase';
import CustomDesignForm from '@/components/CustomDesignForm';
import Offers from '@/components/Offers';
import ReferralBanner from '@/components/ReferralBanner';
import ReferralWelcomeBanner from '@/components/ReferralWelcomeBanner';
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
import SizeChartModal from '@/components/SizeChartModal';

import VisualSectionWrapper from '@/components/VisualSectionWrapper';

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
  const logAnalyticsEvent = useStore((state) => state.logAnalyticsEvent);

  // Referral welcome banner state
  const [activeRefCode, setActiveRefCode] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
    if (typeof window !== 'undefined') {
      const logged = sessionStorage.getItem('ff_logged_visit');
      if (!logged) {
        logAnalyticsEvent('visit');
        sessionStorage.setItem('ff_logged_visit', 'true');
      }
    }
  }, [fetchInitialData, logAnalyticsEvent]);

  // Detect referral link in URL and show welcome banner instead of silently tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        const cleanRef = ref.trim();
        const cleanRefUpper = cleanRef.toUpperCase();
        if (cleanRefUpper.startsWith('REF-') || /^01[0-25]\d{8}$/.test(cleanRef)) {
          // Save the referrer for later (order attribution)
          localStorage.setItem('ff_referrer_phone', cleanRefUpper);
          // Show welcome banner — the banner's CTA button calls trackReferralClick
          const sessionTracked = sessionStorage.getItem('ff_referral_tracked');
          if (sessionTracked !== cleanRefUpper) {
            setActiveRefCode(cleanRefUpper);
            sessionStorage.setItem('ff_referral_tracked', cleanRefUpper);
          }
        }
      }
    }
  }, []);

  // Show branded loading screen on first load
  if (isLoading && products.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <VisualSectionWrapper sectionId="hero" labelEn="Hero Section" labelAr="شريط البداية">
          <Hero />
        </VisualSectionWrapper>
        
        <VisualSectionWrapper sectionId="collections" labelEn="Category Collections" labelAr="أقسام الفئات">
          <Collections />
        </VisualSectionWrapper>
        
        <VisualSectionWrapper sectionId="showcase" labelEn="Featured Showcase" labelAr="معرض المنتجات">
          <Showcase />
        </VisualSectionWrapper>
        
        <VisualSectionWrapper sectionId="custom_design" labelEn="Custom Requests" labelAr="التصميم الخاص">
          <CustomDesignForm />
        </VisualSectionWrapper>
        
        <VisualSectionWrapper sectionId="offers" labelEn="Special Offers" labelAr="العروض والخصومات">
          <Offers />
        </VisualSectionWrapper>
        
        <VisualSectionWrapper sectionId="referral" labelEn="Referral Program" labelAr="نظام الإحالة">
          <ReferralBanner />
        </VisualSectionWrapper>
        
        <VisualSectionWrapper sectionId="why_choose_us" labelEn="Why Choose Us" labelAr="لماذا تختارنا">
          <WhyChooseUs />
        </VisualSectionWrapper>
        
        <VisualSectionWrapper sectionId="about_us" labelEn="About Brand" labelAr="من نحن">
          <AboutUs />
        </VisualSectionWrapper>
        
        <VisualSectionWrapper sectionId="shipping" labelEn="Shipping Banner" labelAr="تفاصيل الشحن">
          <Shipping />
        </VisualSectionWrapper>
        
        <VisualSectionWrapper sectionId="faq" labelEn="Frequently Asked Questions" labelAr="الأسئلة الشائعة">
          <FAQ />
        </VisualSectionWrapper>
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
      {/* Size Chart Modal overlay */}
      <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} />
      {/* Referral welcome banner (shown when arriving via ?ref= link) */}
      {activeRefCode && <ReferralWelcomeBanner refCode={activeRefCode} />}
    </>
  );
}
