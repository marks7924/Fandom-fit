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
import TrackOrderModal from '@/components/TrackOrderModal';
import Footer from '@/components/Footer';

export default function Home() {
  const fetchInitialData = useStore((state) => state.fetchInitialData);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

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
      {/* Track Order modal overlay */}
      <TrackOrderModal />
    </>
  );
}
