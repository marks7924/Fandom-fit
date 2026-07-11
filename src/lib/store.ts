import { create } from 'zustand';
import supabase, { isUsingMock } from './supabase';

export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  display_order: number;
  is_hidden: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  category_id: string;
  price: number;
  sale_price: number | null;
  is_in_stock: boolean;
  display_order: number;
  is_featured: boolean;
  is_trending: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_limited_edition: boolean;
  available_sizes: string[];
  material_options: string[];
  images: string[];
  is_pinned?: boolean;
}

export interface Offer {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  discount_text_en: string;
  discount_text_ar: string;
  code: string;
  discount_percent: number;
  max_uses?: number | null;
  max_uses_per_user?: number | null;
  is_active: boolean;
  show_on_homepage: boolean;
}

export interface CustomRequest {
  id: string;
  customer_name: string;
  instagram_username: string;
  description: string;
  reference_images: string[];
  status: string;
  notes: string;
  created_at: string;
}

export interface Order {
  id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  customer_name: string;
  customer_phone: string;
  location: string;
  notes: string;
  status: string; // 'pending' | 'completed'
  created_at: string;
}

interface StoreState {
  categories: Category[];
  products: Product[];
  offers: Offer[];
  settings: Record<string, any>;
  customRequests: CustomRequest[];
  orders: Order[];
  announcement: string;
  announcement_ar: string;
  isLoading: boolean;
  activeCategory: string; // 'all' or category slug
  previewProduct: Product | null;
  checkoutProduct: Product | null;
  isTrackOrderOpen: boolean;
  setIsTrackOrderOpen: (open: boolean) => void;
  fetchInitialData: () => Promise<void>;
  setActiveCategory: (slug: string) => void;
  setPreviewProduct: (product: Product | null) => void;
  setCheckoutProduct: (product: Product | null) => void;
  addCustomRequest: (req: Omit<CustomRequest, 'id' | 'created_at' | 'status' | 'notes'>) => Promise<boolean>;
  
  // Order Operations
  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'status'>) => Promise<Order | null>;
  fetchOrdersByPhone: (phone: string) => Promise<Order[]>;
  completeOrder: (id: string) => Promise<void>;
  updateAnnouncement: (message: string) => Promise<void>;
  updateAnnouncementAr: (message: string) => Promise<void>;

  // Admin Operations
  fetchAdminRequests: () => Promise<void>;
  updateRequestStatus: (id: string, status: string, notes: string) => Promise<void>;
  saveSettings: (settings: Record<string, any>) => Promise<void>;
  
  // Product CRUD
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Offers CRUD
  addOffer: (offer: Omit<Offer, 'id'>) => Promise<void>;
  updateOffer: (id: string, offer: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;

  // Discount Campaigns CRUD
  discountCampaigns: DiscountCampaign[];
  getProductEffectivePrice: (product: Product) => {
    hasDiscount: boolean;
    originalPrice: number;
    discountedPrice: number;
    campaignName: string | null;
  };
  addDiscountCampaign: (campaign: Omit<DiscountCampaign, 'id'>) => Promise<void>;
  updateDiscountCampaign: (id: string, campaign: Partial<DiscountCampaign>) => Promise<void>;
  deleteDiscountCampaign: (id: string) => Promise<void>;
  validateCoupon: (code: string, phone: string) => Promise<{
    isValid: boolean;
    discountPercent?: number;
    error?: 'invalid' | 'limit_reached' | 'user_limit_reached';
  }>;
}

export interface DiscountCampaign {
  id: string;
  name: string;
  discount_percent: number;
  category_id: string | null;
  is_active: boolean;
}


export const useStore = create<StoreState>((set, get) => ({
  categories: [],
  products: [],
  offers: [],
  discountCampaigns: [],
  settings: {},
  customRequests: [],
  orders: [],
  announcement: '',
  announcement_ar: '',
  isLoading: false,
  activeCategory: 'all',
  previewProduct: null,
  checkoutProduct: null,
  isTrackOrderOpen: false,

  setIsTrackOrderOpen: (open) => set({ isTrackOrderOpen: open }),

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const { data: categories } = await supabase.from('categories').select('*');
      const { data: products } = await supabase.from('products').select('*');
      const { data: offers } = await supabase.from('offers').select('*');
      const { data: settingsData } = await supabase.from('settings').select('*');
      const { data: discountCampaigns } = await supabase.from('discount_campaigns').select('*');

      const settingsMap: Record<string, any> = {};
      if (settingsData) {
        settingsData.forEach((row: any) => {
          settingsMap[row.key] = row.value;
        });
      }

      set({
        categories: categories || [],
        products: products || [],
        offers: offers || [],
        discountCampaigns: discountCampaigns || [],
        settings: settingsMap,
        announcement: settingsMap.announcement || '',
        announcement_ar: settingsMap.announcement_ar || '',
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading initial store data:', error);
      set({ isLoading: false });
    }
  },

  setActiveCategory: (slug) => set({ activeCategory: slug }),
  setPreviewProduct: (product) => set({ previewProduct: product }),
  setCheckoutProduct: (product) => set({ checkoutProduct: product }),

  addCustomRequest: async (req) => {
    try {
      const { error } = await supabase.from('custom_requests').insert([req]);
      if (error) throw error;
      
      // Update local state if running locally or loaded
      const { data: updatedRequests } = await supabase.from('custom_requests').select('*');
      if (updatedRequests) {
        set({ customRequests: updatedRequests });
      }
      return true;
    } catch (error) {
      console.error('Error submitting custom request:', error);
      return false;
    }
  },

  fetchOrders: async () => {
    try {
      const { data: orders } = await supabase.from('orders').select('*');
      if (orders) {
        set({ orders });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  },

  addOrder: async (order) => {
    try {
      const { data, error } = await supabase.from('orders').insert([order]).select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error submitting order:', error);
      return null;
    }
  },

  fetchOrdersByPhone: async (phone: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching orders by phone:', error);
      return [];
    }
  },

  completeOrder: async (id) => {
    try {
      const { error } = await supabase.from('orders').update({ status: 'completed' }).eq('id', id);
      if (error) throw error;
      
      const updated = get().orders.map(o => o.id === id ? { ...o, status: 'completed' } : o);
      set({ orders: updated });
    } catch (error) {
      console.error('Error completing order:', error);
    }
  },

  updateAnnouncement: async (message) => {
    try {
      const { error } = await supabase.from('settings').update({ value: message }).eq('key', 'announcement');
      if (error) throw error;
      set({ announcement: message });
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  },

  updateAnnouncementAr: async (message) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'announcement_ar', value: message }, { onConflict: 'key' });
      if (error) throw error;
      set({ announcement_ar: message });
    } catch (error) {
      console.error('Error updating Arabic announcement:', error);
    }
  },

  fetchAdminRequests: async () => {
    try {
      const { data: customRequests } = await supabase.from('custom_requests').select('*');
      if (customRequests) {
        set({ customRequests });
      }
    } catch (error) {
      console.error('Error fetching admin requests:', error);
    }
  },

  updateRequestStatus: async (id, status, notes) => {
    try {
      await supabase.from('custom_requests').update({ status, notes }).eq('id', id);
      const updated = get().customRequests.map(r => r.id === id ? { ...r, status, notes } : r);
      set({ customRequests: updated });
    } catch (error) {
      console.error('Error updating custom request status:', error);
    }
  },

  saveSettings: async (newSettings) => {
    try {
      // settings is stored as row key value in settings table
      for (const [key, value] of Object.entries(newSettings)) {
        await supabase.from('settings').update({ value }).eq('key', key);
      }
      set({ settings: { ...get().settings, ...newSettings } });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  addProduct: async (product) => {
    try {
      const { data, error } = await supabase.from('products').insert([product]);
      if (error) throw error;
      const { data: allProducts } = await supabase.from('products').select('*');
      if (allProducts) set({ products: allProducts });
    } catch (error) {
      console.error('Error adding product:', error);
    }
  },

  updateProduct: async (id, product) => {
    try {
      const { error } = await supabase.from('products').update(product).eq('id', id);
      if (error) throw error;
      const { data: allProducts } = await supabase.from('products').select('*');
      if (allProducts) set({ products: allProducts });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  },

  deleteProduct: async (id) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      set({ products: get().products.filter(p => p.id !== id) });
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  },

  addCategory: async (category) => {
    try {
      const { error } = await supabase.from('categories').insert([category]);
      if (error) throw error;
      const { data: allCats } = await supabase.from('categories').select('*');
      if (allCats) set({ categories: allCats });
    } catch (error) {
      console.error('Error adding category:', error);
    }
  },

  updateCategory: async (id, category) => {
    try {
      const { error } = await supabase.from('categories').update(category).eq('id', id);
      if (error) throw error;
      const { data: allCats } = await supabase.from('categories').select('*');
      if (allCats) set({ categories: allCats });
    } catch (error) {
      console.error('Error updating category:', error);
    }
  },

  deleteCategory: async (id) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      set({ categories: get().categories.filter(c => c.id !== id) });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  },

  addOffer: async (offer) => {
    try {
      const { error } = await supabase.from('offers').insert([offer]);
      if (error) throw error;
      const { data: allOffers } = await supabase.from('offers').select('*');
      if (allOffers) set({ offers: allOffers });
    } catch (error) {
      console.error('Error adding offer:', error);
    }
  },

  updateOffer: async (id, offer) => {
    try {
      const { error } = await supabase.from('offers').update(offer).eq('id', id);
      if (error) throw error;
      const { data: allOffers } = await supabase.from('offers').select('*');
      if (allOffers) set({ offers: allOffers });
    } catch (error) {
      console.error('Error updating offer:', error);
    }
  },

  deleteOffer: async (id) => {
    try {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) throw error;
      set({ offers: get().offers.filter(o => o.id !== id) });
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  },

  getProductEffectivePrice: (product) => {
    const campaigns = get().discountCampaigns || [];
    const activeCampaign = campaigns.find(
      c => c.is_active && (c.category_id === null || c.category_id === product.category_id)
    );

    if (activeCampaign) {
      const discountPct = activeCampaign.discount_percent;
      const basePrice = product.price;
      const discountedPrice = Math.round(basePrice * (1 - discountPct / 100));
      return {
        hasDiscount: true,
        originalPrice: basePrice,
        discountedPrice: discountedPrice,
        campaignName: activeCampaign.name
      };
    }

    return {
      hasDiscount: product.sale_price !== null,
      originalPrice: product.price,
      discountedPrice: product.sale_price !== null ? product.sale_price : product.price,
      campaignName: null
    };
  },

  addDiscountCampaign: async (campaign) => {
    try {
      const { error } = await supabase.from('discount_campaigns').insert([campaign]);
      if (error) throw error;
      const { data: allCampaigns } = await supabase.from('discount_campaigns').select('*');
      if (allCampaigns) set({ discountCampaigns: allCampaigns });
    } catch (error) {
      console.error('Error adding discount campaign:', error);
    }
  },

  updateDiscountCampaign: async (id, campaign) => {
    try {
      const { error } = await supabase.from('discount_campaigns').update(campaign).eq('id', id);
      if (error) throw error;
      const { data: allCampaigns } = await supabase.from('discount_campaigns').select('*');
      if (allCampaigns) set({ discountCampaigns: allCampaigns });
    } catch (error) {
      console.error('Error updating discount campaign:', error);
    }
  },

  deleteDiscountCampaign: async (id) => {
    try {
      const { error } = await supabase.from('discount_campaigns').delete().eq('id', id);
      if (error) throw error;
      set({ discountCampaigns: get().discountCampaigns.filter(c => c.id !== id) });
    } catch (error) {
      console.error('Error deleting discount campaign:', error);
    }
  },

  validateCoupon: async (code, phone) => {
    const cleanCode = code.trim().toLowerCase();
    const offer = get().offers.find(o => o.code.trim().toLowerCase() === cleanCode && o.is_active);

    if (!offer) {
      return { isValid: false, error: 'invalid' };
    }

    if (isUsingMock) {
      return { isValid: true, discountPercent: offer.discount_percent };
    }

    // Check max_uses overall if specified
    if (offer.max_uses !== null && offer.max_uses !== undefined && offer.max_uses > 0) {
      // Query database to count how many orders contain this coupon code
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .ilike('notes', `%Coupon Code: ${offer.code}%`);
      
      if (!error && count !== null && count >= offer.max_uses) {
        return { isValid: false, error: 'limit_reached' };
      }
    }

    // Check max_uses_per_user (by phone number) if specified
    if (offer.max_uses_per_user !== null && offer.max_uses_per_user !== undefined && offer.max_uses_per_user > 0) {
      const cleanPhone = phone.trim();
      if (cleanPhone) {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('customer_phone', cleanPhone)
          .ilike('notes', `%Coupon Code: ${offer.code}%`);

        if (!error && count !== null && count >= offer.max_uses_per_user) {
          return { isValid: false, error: 'user_limit_reached' };
        }
      }
    }

    return { isValid: true, discountPercent: offer.discount_percent };
  }
}));

export const getFabricPremium = (fabric: string): number => {
  const f = fabric.toLowerCase();
  if (f.includes('standard')) return 0;
  if (f.includes('oversized') || f.includes('over-sized')) return 150;
  if (f.includes('heavy')) return 100;
  if (f.includes('premium')) return 50;
  return 0; // default/fallback
};
