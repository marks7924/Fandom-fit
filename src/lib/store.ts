import { create } from 'zustand';
import supabase from './supabase';

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
  is_active: boolean;
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
  isLoading: boolean;
  activeCategory: string; // 'all' or category slug
  previewProduct: Product | null;
  checkoutProduct: Product | null;
  fetchInitialData: () => Promise<void>;
  setActiveCategory: (slug: string) => void;
  setPreviewProduct: (product: Product | null) => void;
  setCheckoutProduct: (product: Product | null) => void;
  addCustomRequest: (req: Omit<CustomRequest, 'id' | 'created_at' | 'status' | 'notes'>) => Promise<boolean>;
  
  // Order Operations
  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'status'>) => Promise<boolean>;
  completeOrder: (id: string) => Promise<void>;
  updateAnnouncement: (message: string) => Promise<void>;

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
}

export const useStore = create<StoreState>((set, get) => ({
  categories: [],
  products: [],
  offers: [],
  settings: {},
  customRequests: [],
  orders: [],
  announcement: '',
  isLoading: false,
  activeCategory: 'all',
  previewProduct: null,
  checkoutProduct: null,

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const { data: categories } = await supabase.from('categories').select('*');
      const { data: products } = await supabase.from('products').select('*');
      const { data: offers } = await supabase.from('offers').select('*');
      const { data: settingsData } = await supabase.from('settings').select('*');

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
        settings: settingsMap,
        announcement: settingsMap.announcement || '',
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
      const { error } = await supabase.from('orders').insert([order]);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error submitting order:', error);
      return false;
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
  }
}));
