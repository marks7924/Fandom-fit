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
import WhyChooseUs from '@/components/WhyChooseUs';
import AboutUs from '@/components/AboutUs';
import Shipping from '@/components/Shipping';
import FAQ from '@/components/FAQ';
import ProductQuickPreview from '@/components/ProductQuickPreview';
import CheckoutModal from '@/components/CheckoutModal';
import CartDrawer from '@/components/CartDrawer';
import TrackOrderModal from '@/components/TrackOrderModal';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';

export default function Home() {
  const fetchInitialData = useStore((state) => state.fetchInitialData);
  const isLoading = useStore((state) => state.isLoading);
  const products = useStore((state) => state.products);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref && /^01[0-25]\d{8}$/.test(ref.trim())) {
        localStorage.setItem('ff_referrer_phone', ref.trim());
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
        <Hero />
        <Collections />
        <Showcase />
        <CustomDesignForm />
        <Offers />
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
    </>
  );
}

