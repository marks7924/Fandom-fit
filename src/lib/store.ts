import { create } from 'zustand';
import supabase, { isUsingMock } from './supabase';

export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  display_order: number;
  is_hidden: boolean;
  show_in_browse?: boolean;
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
  gives_cotton_reward?: boolean;
  tags?: string[];
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
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  coupon_type?: 'manual' | 'cotton_reward' | 'referral_reward' | 'referral_reward_thank_you';
  min_order_amount?: number;
  current_uses?: number;
  is_one_time?: boolean;
  is_public?: boolean;
  expires_at?: string | null;
  referred_phone?: string | null;
  bound_phone?: string | null;
  created_at?: string;
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
  items?: Array<{
    id: string;
    product_id: string;
    product_name: string;
    size: string;
    fabric: string;
    quantity: number;
    price: number;
    image?: string;
  }> | null;
  customer_email?: string;
  governorate?: string;
  city?: string;
  address?: string;
  coupon_code?: string;
  referral_code?: string;
  reward_coupon_code?: string;
  created_at: string;
}

export interface CartItem {
  id: string; // product_id-size-fabric
  product: Product;
  size: string;
  fabric: string;
  quantity: number;
  price: number;
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
  isInviteOpen: boolean;
  setIsInviteOpen: (open: boolean) => void;
  
  // Cart State & Actions
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, size: string, fabric: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
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
  validateCoupon: (code: string, phone: string, orderAmount: number) => Promise<{
    isValid: boolean;
    discountPercent?: number;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    error?: string;
  }>;

  // Auth & Profile State
  user: any | null;
  profile: any | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  signUpUser: (email: string, password: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  signInUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInUserWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  syncUserProfile: () => Promise<void>;
  updateCartItemSpecs: (cartItemId: string, newSize: string, newFabric: string) => void;
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
  isInviteOpen: false,
  setIsInviteOpen: (open) => set({ isInviteOpen: open }),

  // User Auth & Profiles initialization
  user: null,
  profile: null,
  isAuthModalOpen: false,
  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  isProfileModalOpen: false,
  setIsProfileModalOpen: (open) => set({ isProfileModalOpen: open }),

  signUpUser: async (email, password, phone) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { phone } }
      });
      if (error) return { success: false, error: error.message };
      
      const user = data?.user || null;
      if (user) {
        set({ user });
        await get().syncUserProfile();
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' };
    }
  },

  signInUser: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      
      set({ user: data?.user || null });
      await get().syncUserProfile();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  },

  signInUserWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) return { success: false, error: error.message };
      
      if (data?.user) {
        set({ user: data.user });
        await get().syncUserProfile();
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google login failed' };
    }
  },

  signOutUser: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  syncUserProfile: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        set({ profile: data });
      } else {
        // Create profile if missing
        const referralCode = `REF-${user.id.replace('u-', '').substring(0, 5).toUpperCase()}`;
        const newProfile = {
          id: user.id,
          email: user.email || '',
          phone: '',
          loyalty_points: 0,
          favorites: [],
          referral_code: referralCode,
          address_data: {}
        };
        await supabase.from('profiles').insert([newProfile]);
        set({ profile: newProfile });
      }
    } catch (err) {
      console.error('Error syncing profile:', err);
    }
  },

  toggleFavorite: async (productId) => {
    const { user, profile } = get();
    if (!user || !profile) return;
    const favorites = profile.favorites || [];
    let updatedFavs;
    if (favorites.includes(productId)) {
      updatedFavs = favorites.filter((id: string) => id !== productId);
    } else {
      updatedFavs = [...favorites, productId];
    }
    
    const updatedProfile = { ...profile, favorites: updatedFavs };
    set({ profile: updatedProfile });
    
    try {
      await supabase.from('profiles').update({ favorites: updatedFavs }).eq('id', user.id);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  },

  updateCartItemSpecs: (cartItemId, newSize, newFabric) => {
    const cart = get().cart;
    const { getProductEffectivePrice } = get();
    const item = cart.find(i => i.id === cartItemId);
    if (!item) return;
    
    const newId = `${item.product.id}-${newSize}-${newFabric}`;
    
    // Calculate new price
    const { discountedPrice } = getProductEffectivePrice(item.product);
    const premium = getFabricPremium(newFabric);
    const newItemPrice = discountedPrice + premium;

    const updatedCart = cart.map(i => {
      if (i.id === cartItemId) {
        return {
          ...i,
          id: newId,
          size: newSize,
          fabric: newFabric,
          price: newItemPrice
        };
      }
      return i;
    });
    
    set({ cart: updatedCart });
    localStorage.setItem('ff_cart', JSON.stringify(updatedCart));
  },

  cart: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ff_cart') || '[]') : [],
  isCartOpen: false,
  setIsCartOpen: (open) => set({ isCartOpen: open }),
  isCheckoutOpen: false,
  setIsCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

  addToCart: (product, size, fabric, quantity = 1) => {
    const cart = get().cart;
    const { getProductEffectivePrice } = get();
    const { discountedPrice } = getProductEffectivePrice(product);
    const premium = getFabricPremium(fabric);
    const itemPrice = discountedPrice + premium;
    
    const cartItemId = `${product.id}-${size}-${fabric}`;
    const existingIndex = cart.findIndex((item) => item.id === cartItemId);
    
    let updatedCart;
    if (existingIndex >= 0) {
      updatedCart = cart.map((item, idx) => 
        idx === existingIndex 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          id: cartItemId,
          product,
          size,
          fabric,
          quantity,
          price: itemPrice
        }
      ];
    }
    
    set({ cart: updatedCart, isCartOpen: true });
    localStorage.setItem('ff_cart', JSON.stringify(updatedCart));
  },

  removeFromCart: (cartItemId) => {
    const updatedCart = get().cart.filter((item) => item.id !== cartItemId);
    set({ cart: updatedCart });
    localStorage.setItem('ff_cart', JSON.stringify(updatedCart));
  },

  updateCartQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(cartItemId);
      return;
    }
    const updatedCart = get().cart.map((item) => 
      item.id === cartItemId ? { ...item, quantity } : item
    );
    set({ cart: updatedCart });
    localStorage.setItem('ff_cart', JSON.stringify(updatedCart));
  },

  clearCart: () => {
    set({ cart: [] });
    localStorage.setItem('ff_cart', '[]');
  },

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

      // Default system settings
      if (settingsMap.cotton_reward_system_enabled === undefined) {
        settingsMap.cotton_reward_system_enabled = true;
      }
      if (settingsMap.referral_reward_system_enabled === undefined) {
        settingsMap.referral_reward_system_enabled = true;
      }

      // Fetch authenticated user
      let currentUser = null;
      let currentProfile = null;
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          currentUser = userData.user;
          const { data: profData } = await supabase.from('profiles').select('*').eq('id', userData.user.id).maybeSingle();
          if (profData) {
            currentProfile = profData;
          }
        }
      } catch (authErr) {
        console.error('Error fetching initial user auth:', authErr);
      }

      set({
        categories: categories || [],
        products: products || [],
        offers: offers || [],
        discountCampaigns: discountCampaigns || [],
        settings: settingsMap,
        announcement: settingsMap.announcement || '',
        announcement_ar: settingsMap.announcement_ar || '',
        user: currentUser,
        profile: currentProfile,
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
      let rewardCouponCode = '';
      
      // 1. Check if Cotton collection drops apply (via product.gives_cotton_reward check)
      const hasCottonItem = 
        order.product_name.toLowerCase().includes('cotton') || 
        (order.notes && order.notes.toLowerCase().includes('cotton')) ||
        (order.items && Array.isArray(order.items) && order.items.some((item: any) => {
          const prod = get().products.find(p => p.id === item.product_id);
          return prod?.gives_cotton_reward === true || 
                 item.product_name.toLowerCase().includes('cotton') || 
                 item.fabric.toLowerCase().includes('cotton');
        }));

      const isCottonEnabled = get().settings.cotton_reward_system_enabled !== false;
      if (hasCottonItem && isCottonEnabled) {
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const code = `COTTON-${randomString}`;
        rewardCouponCode = code;
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const newOffer = {
          title_en: 'Cotton Collection Reward (25% OFF)',
          title_ar: 'مكافأة مجموعة القطن (خصم ٢٥٪)',
          description_en: 'Get 25% off one future order! (Bound to phone: ' + order.customer_phone + ')',
          description_ar: 'احصل على خصم ٢٥٪ على طلبك القادم! (مرتبط برقم هاتف: ' + order.customer_phone + ')',
          discount_text_en: '25% OFF',
          discount_text_ar: 'خصم ٢٥٪',
          code: code,
          discount_percent: 25,
          max_uses: 1,
          max_uses_per_user: 1,
          is_active: true, // Instantly Active!
          show_on_homepage: false,
          discount_type: 'percentage',
          discount_value: 25,
          coupon_type: 'cotton_reward',
          is_one_time: true,
          is_public: false,
          bound_phone: order.customer_phone, // Bound to phone!
          expires_at: expiryDate.toISOString(),
        };

        await supabase.from('offers').insert([newOffer]);
      }

      // 2. Check if there is an invited referrer phone (from URL ref= or manual referral coupon)
      let referrerPhone = typeof window !== 'undefined' ? localStorage.getItem('ff_referrer_phone') : null;
      
      if (order.referral_code) {
        const cleanRefCode = order.referral_code.trim().toLowerCase();
        const refCoupon = get().offers.find(
          o => o.code.trim().toLowerCase() === cleanRefCode && o.coupon_type === 'referral_reward'
        );
        if (refCoupon && refCoupon.referred_phone) {
          referrerPhone = refCoupon.referred_phone;
        }
      }

      // Ensure referrer isn't referring themselves and referral system is enabled
      const isReferralEnabled = get().settings.referral_reward_system_enabled !== false;
      if (referrerPhone && referrerPhone.trim() && referrerPhone.trim() !== order.customer_phone.trim() && isReferralEnabled) {
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const thankYouCode = `THANKS-${randomString}`;

        if (!rewardCouponCode) {
          rewardCouponCode = thankYouCode;
        } else {
          rewardCouponCode += `, ${thankYouCode}`;
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const newOffer = {
          title_en: 'Referral Reward (15% OFF)',
          title_ar: 'مكافأة ترشيح (خصم ١٥٪)',
          description_en: 'Friend purchase reward! (Bound to phone: ' + referrerPhone + ')',
          description_ar: 'مكافأة شراء صديق! (مرتبطة برقم هاتف: ' + referrerPhone + ')',
          discount_text_en: '15% OFF',
          discount_text_ar: 'خصم ١٥٪',
          code: thankYouCode,
          discount_percent: 15,
          max_uses: 1,
          max_uses_per_user: 1,
          is_active: true, // Instantly Active!
          show_on_homepage: false,
          discount_type: 'percentage',
          discount_value: 15,
          coupon_type: 'referral_reward_thank_you',
          is_one_time: true,
          is_public: false,
          bound_phone: referrerPhone, // Bound to referrer phone!
          expires_at: expiryDate.toISOString(),
        };

        await supabase.from('offers').insert([newOffer]);
      }

      // 3. Save order with pre-generated reward coupon code linked
      const finalOrder = {
        ...order,
        reward_coupon_code: rewardCouponCode || undefined
      };

      const { data, error } = await supabase.from('orders').insert([finalOrder]).select();
      if (error) throw error;
      
      const newOrder = data?.[0] || null;
      if (newOrder) {
        set({ orders: [newOrder, ...get().orders] });

        // Save order address details locally
        if (typeof window !== 'undefined') {
          const savedData = {
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            customer_email: order.customer_email || '',
            governorate: order.governorate || '',
            city: order.city || '',
            address: order.address || ''
          };
          localStorage.setItem('ff_saved_customer_data', JSON.stringify(savedData));
        }

        // If user is logged in, reward loyalty points & save profile address data
        const { user, profile } = get();
        if (user && profile) {
          const awardedPoints = Math.floor(Number(order.price) / 10);
          const newPoints = (profile.loyalty_points || 0) + awardedPoints;
          const addressData = {
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            customer_email: order.customer_email || '',
            governorate: order.governorate || '',
            city: order.city || '',
            address: order.address || ''
          };
          const updatedProfile = { ...profile, loyalty_points: newPoints, address_data: addressData };
          set({ profile: updatedProfile });
          await supabase.from('profiles').update({ loyalty_points: newPoints, address_data: addressData }).eq('id', user.id);
        }
      }

      // Clear referral cookie/storage after it is successfully redeemed
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ff_referrer_phone');
      }

      // Sync local offers list to see the newly generated offers
      const { data: allOffers } = await supabase.from('offers').select('*');
      if (allOffers) set({ offers: allOffers });

      return newOrder;
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
      if (!isUsingMock) {
        const res = await fetch('/api/orders/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: id })
        });
        if (res.ok) {
          // Sync with database
          const { data: orders } = await supabase.from('orders').select('*');
          const { data: offers } = await supabase.from('offers').select('*');
          if (orders) set({ orders });
          if (offers) set({ offers });
          return;
        }
      }

      // Mock Local completion
      const order = get().orders.find(o => o.id === id);
      if (!order || order.status === 'completed') return;

      const updatedOrders = get().orders.map(o => 
        o.id === id ? { ...o, status: 'completed' } : o
      );
      set({ orders: updatedOrders });
      localStorage.setItem('ff_orders', JSON.stringify(updatedOrders));

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
      const cleanSettings = { ...newSettings } as Record<string, any>;
      
      if (
        'fabric_premium_premium' in cleanSettings ||
        'fabric_premium_heavy' in cleanSettings ||
        'fabric_premium_oversized' in cleanSettings
      ) {
        const premiums = {
          premium: Number(cleanSettings.fabric_premium_premium ?? 50),
          heavy: Number(cleanSettings.fabric_premium_heavy ?? 100),
          oversized: Number(cleanSettings.fabric_premium_oversized ?? 150)
        };
        cleanSettings.fabric_premiums = premiums;
        
        delete cleanSettings.fabric_premium_premium;
        delete cleanSettings.fabric_premium_heavy;
        delete cleanSettings.fabric_premium_oversized;
      }

      for (const [key, value] of Object.entries(cleanSettings)) {
        if (value !== undefined) {
          const { error } = await supabase
            .from('settings')
            .upsert({ key, value }, { onConflict: 'key' });
          if (error) throw error;
        }
      }

      const { data: settingsData } = await supabase.from('settings').select('*');
      if (settingsData) {
        const settingsMap: Record<string, any> = {};
        settingsData.forEach((row: any) => {
          settingsMap[row.key] = row.value;
        });
        set({ settings: settingsMap });
      }
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

  validateCoupon: async (code, phone, orderAmount) => {
    const cleanCode = code.trim().toLowerCase();
    
    // Live Server validation fallback when using live database
    if (!isUsingMock) {
      try {
        const res = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, phone, orderAmount })
        });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (err) {
        console.error('Server coupon validation failed, falling back to local validation:', err);
      }
    }

    // Local validation for Mock Mode
    const offer = get().offers.find(o => o.code.trim().toLowerCase() === cleanCode);

    if (!offer) {
      return { isValid: false, error: 'invalid' };
    }
    if (!offer.is_active) {
      return { isValid: false, error: 'inactive' };
    }

    // Check bound phone number
    if (offer.bound_phone) {
      const cleanPhone = phone?.trim();
      if (!cleanPhone || cleanPhone !== offer.bound_phone.trim()) {
        return { isValid: false, error: 'phone_mismatch' };
      }
    }

    // Check expiration date
    if (offer.expires_at) {
      if (new Date(offer.expires_at).getTime() < Date.now()) {
        return { isValid: false, error: 'expired' };
      }
    }

    // Check minimum order amount
    const minAmount = offer.min_order_amount ?? 0;
    if (orderAmount < minAmount) {
      return { isValid: false, error: 'min_order_not_met' };
    }

    // Check max uses overall
    if (offer.max_uses !== null && offer.max_uses !== undefined && offer.max_uses > 0) {
      const orders = get().orders;
      const count = orders.filter(o => o.coupon_code?.trim().toLowerCase() === cleanCode).length;
      if (count >= offer.max_uses) {
        return { isValid: false, error: 'limit_reached' };
      }
    }

    // Check max uses per user
    if (offer.max_uses_per_user !== null && offer.max_uses_per_user !== undefined && offer.max_uses_per_user > 0) {
      const cleanPhone = phone.trim();
      if (cleanPhone) {
        const orders = get().orders;
        const count = orders.filter(
          o => o.customer_phone.trim() === cleanPhone && o.coupon_code?.trim().toLowerCase() === cleanCode
        ).length;
        if (count >= offer.max_uses_per_user) {
          return { isValid: false, error: 'user_limit_reached' };
        }
      }
    }

    return { 
      isValid: true, 
      discountPercent: offer.discount_percent,
      discountType: offer.discount_type || 'percentage',
      discountValue: offer.discount_value || 0
    };
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

export interface CartTotals {
  subtotal: number;
  cottonDiscount: number;
  autoAppliedDiscount: number;
  autoAppliedOfferName: string;
  shipping: number;
  finalTotal: number;
}

export const getCartTotals = (
  cart: CartItem[], 
  cottonEnabled: boolean = true, 
  autoOffers: any[] = []
): CartTotals => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let cottonDiscount = 0;
  const hasCotton = cottonEnabled && cart.some(item => item.product.gives_cotton_reward === true);
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (hasCotton && totalQty >= 2) {
    const flatItems = cart.flatMap(item => Array(item.quantity).fill(item));
    flatItems.sort((a, b) => b.price - a.price);
    // flatItems[1] is the next highest priced item in the cart
    cottonDiscount = Math.round(flatItems[1].price * 0.25);
  }
  
  // Calculate Auto-applied Offers
  let autoAppliedDiscount = 0;
  let autoAppliedOfferName = '';
  
  if (autoOffers && autoOffers.length > 0) {
    for (const offer of autoOffers) {
      if (!offer.is_active) continue;
      
      let qualifies = false;
      const hasRequiredTag = offer.required_tag
        ? cart.some(item => item.product.tags && item.product.tags.map((t: string) => t.toLowerCase()).includes(offer.required_tag.toLowerCase()))
        : false;
        
      if (offer.type === 'quantity' && totalQty >= (offer.min_quantity || 0)) {
        qualifies = true;
      } else if (offer.type === 'tag' && hasRequiredTag) {
        qualifies = true;
      } else if (offer.type === 'both' && totalQty >= (offer.min_quantity || 0) && hasRequiredTag) {
        qualifies = true;
      }
      
      if (qualifies) {
        const discount = Math.round((subtotal * offer.discount_percent) / 100);
        if (discount > autoAppliedDiscount) {
          autoAppliedDiscount = discount;
          autoAppliedOfferName = offer.name_en;
        }
      }
    }
  }
  
  const shipping = subtotal > 0 ? 50 : 0;
  const finalTotal = Math.max(0, subtotal - cottonDiscount - autoAppliedDiscount + shipping);
  
  return {
    subtotal,
    cottonDiscount,
    autoAppliedDiscount,
    autoAppliedOfferName,
    shipping,
    finalTotal
  };
};
