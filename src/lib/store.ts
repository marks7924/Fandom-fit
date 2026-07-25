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
  is_hidden?: boolean;
  tags?: string[];
  fit_type?: 'regular' | 'oversized' | 'both';
  stock_quantities?: Record<string, number>;
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
  customer_phone?: string;
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
  user_id?: string | null;
}

export interface CartItem {
  id: string; // product_id-size-fabric-fit
  product: Product;
  size: string;
  fabric: string;
  quantity: number;
  price: number;
  fitType?: 'regular' | 'oversized';
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
  checkoutSelectedSize: string | null;
  checkoutSelectedFabric: string | null;
  checkoutSelectedFit: 'regular' | 'oversized' | null;
  isTrackOrderOpen: boolean;
  setIsTrackOrderOpen: (open: boolean) => void;
  isInviteOpen: boolean;
  setIsInviteOpen: (open: boolean) => void;
  
  // Cart State & Actions
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, size: string, fabric: string, quantity?: number, fitType?: 'regular' | 'oversized') => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  fetchInitialData: () => Promise<void>;
  setActiveCategory: (slug: string) => void;
  setPreviewProduct: (product: Product | null) => void;
  setCheckoutProduct: (product: Product | null, options?: { size?: string, fabric?: string, fitType?: 'regular' | 'oversized' }) => void;
  addCustomRequest: (req: Omit<CustomRequest, 'id' | 'created_at' | 'status' | 'notes'>) => Promise<boolean>;
  
  // Order Operations
  fetchOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'status'>) => Promise<Order | null>;
  fetchOrdersByPhone: (phone: string) => Promise<Order[]>;
  completeOrder: (id: string) => Promise<void>;
  updateAnnouncement: (message: string) => Promise<void>;
  updateAnnouncementAr: (message: string) => Promise<void>;
  trackReferralClick: (refCode: string) => Promise<void>;

  // Admin Operations
  fetchAdminRequests: () => Promise<void>;
  updateRequestStatus: (id: string, status: string, notes: string) => Promise<void>;
  saveSettings: (settings: Record<string, any>) => Promise<void>;
  
  // Product CRUD
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Product Designs CRUD
  fetchProductDesigns: (productId: string) => Promise<any[]>;
  addProductDesign: (design: { product_id: string, design_url: string, notes: string }) => Promise<any>;
  deleteProductDesign: (id: string) => Promise<void>;
  
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
  isSizeChartOpen: boolean;
  setIsSizeChartOpen: (open: boolean) => void;
  signUpUser: (email: string, password: string, phone: string, name?: string, address?: { governorate?: string; city?: string; street?: string }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (patch: Record<string, any>) => Promise<void>;
  signInUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInUserWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  syncUserProfile: () => Promise<void>;
  updateCartItemSpecs: (cartItemId: string, newSize: string, newFabric: string, newFitType?: 'regular' | 'oversized') => void;

  // Admin View Mode
  isAdminViewMode: boolean;
  setAdminViewMode: (active: boolean) => void;

  // Chats & Messages State & Actions
  activeChat: any | null;
  activeChatMessages: any[];
  adminChats: any[];
  autoResponses: any[];
  chatGreeting: string;
  fetchUserChat: (phone?: string) => Promise<any>;
  sendChatMessage: (chatId: string, message: string, sender: 'user' | 'admin' | 'system') => Promise<void>;
  endUserChat: (chatId: string) => Promise<void>;
  fetchAdminChats: () => Promise<void>;
  adminSendChatMessage: (chatId: string, message: string) => Promise<void>;
  adminCloseChat: (chatId: string) => Promise<void>;
  adminReopenChat: (chatId: string) => Promise<void>;
  adminBlockUser: (chatId: string) => Promise<void>;
  adminUnblockUser: (chatId: string) => Promise<void>;
  fetchAutoResponses: () => Promise<void>;
  saveAutoResponse: (resp: { trigger_words: string[], response_text: string }) => Promise<void>;
  deleteAutoResponse: (id: string) => Promise<void>;
  adminStartChat: (phone: string, name: string) => Promise<any>;

  // Users Accounts Section (Admin Panel)
  usersList: any[];
  fetchUsersList: () => Promise<void>;
  adminUpdateUserProfile: (userId: string, patch: Record<string, any>) => Promise<void>;

  // Analytics Events Section
  analyticsEvents: any[];
  logAnalyticsEvent: (type: string, details?: Record<string, any>) => Promise<void>;
  fetchAnalyticsEvents: () => Promise<void>;
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
  checkoutSelectedSize: null,
  checkoutSelectedFabric: null,
  checkoutSelectedFit: null,
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
  isSizeChartOpen: false,
  setIsSizeChartOpen: (open) => set({ isSizeChartOpen: open }),

  signUpUser: async (email, password, phone, name, address) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { phone, full_name: name || '' } }
      });
      if (error) return { success: false, error: error.message };
      
      const user = data?.user || null;
      if (user) {
        set({ user });
        // Build initial profile with name and optional address
        const referralCode = `REF-${user.id.replace('u-', '').substring(0, 5).toUpperCase()}`;
        const newProfile: Record<string, any> = {
          id: user.id,
          email: user.email || '',
          phone: phone || '',
          full_name: name || '',
          loyalty_points: 0,
          favorites: [],
          referral_code: referralCode,
          address_data: address && (address.governorate || address.city || address.street) ? address : {}
        };
        try {
          await supabase.from('profiles').upsert([newProfile]);
        } catch (e) {
          console.warn('Could not upsert profile:', e);
        }
        set({ profile: newProfile });
        get().logAnalyticsEvent('account_created');
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' };
    }
  },

  updateProfile: async (patch) => {
    const { user, profile } = get();
    if (!user) return;
    const updated = { ...profile, ...patch };
    set({ profile: updated });
    try {
      await supabase.from('profiles').update(patch).eq('id', user.id);
    } catch (err) {
      console.error('Error updating profile:', err);
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
      if (data && !error) {
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
        try {
          await supabase.from('profiles').insert([newProfile]);
        } catch (e) {
          console.warn('Could not insert profile in database, using offline fallback:', e);
        }
        set({ profile: newProfile });
      }
    } catch (err) {
      console.error('Error syncing profile, falling back to local object:', err);
      const referralCode = `REF-${user.id.replace('u-', '').substring(0, 5).toUpperCase()}`;
      set({
        profile: {
          id: user.id,
          email: user.email || '',
          phone: '',
          loyalty_points: 0,
          favorites: [],
          referral_code: referralCode,
          address_data: {}
        }
      });
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

  updateCartItemSpecs: (cartItemId, newSize, newFabric, newFitType) => {
    const cart = get().cart;
    const { getProductEffectivePrice } = get();
    const item = cart.find(i => i.id === cartItemId);
    if (!item) return;

    // Verify stock availability for the new size selection
    if (item.product.stock_quantities && item.product.stock_quantities[newSize] !== undefined) {
      const availableStock = item.product.stock_quantities[newSize];
      if (item.quantity > availableStock) {
        if (typeof window !== 'undefined') {
          const isAr = localStorage.getItem('locale') === 'ar' || window.location.pathname.includes('/ar');
          alert(
            isAr
              ? `عذراً، الكمية المطلوبة تتعدى المخزن المتاح لـ ${newSize} (${availableStock}).`
              : `Sorry, requested quantity exceeds available stock for ${newSize} (${availableStock}).`
          );
        }
        return;
      }
    }
    
    const finalFitType = newFitType || item.fitType || 'regular';
    const newId = `${item.product.id}-${newSize}-${newFabric}-${finalFitType}`;
    
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
          fitType: finalFitType,
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

  addToCart: (product, size, fabric, quantity = 1, fitType = 'regular') => {
    const cart = get().cart;
    
    // Verify stock availability
    if (product.stock_quantities && product.stock_quantities[size] !== undefined) {
      const availableStock = product.stock_quantities[size];
      const cartItemId = `${product.id}-${size}-${fabric}-${fitType}`;
      const existingItem = cart.find((item) => item.id === cartItemId);
      const currentCartQty = existingItem ? existingItem.quantity : 0;
      
      if (currentCartQty + quantity > availableStock) {
        if (typeof window !== 'undefined') {
          const isAr = localStorage.getItem('locale') === 'ar' || window.location.pathname.includes('/ar');
          alert(
            isAr
              ? `عذراً، الكمية المطلوبة تتعدى المخزن المتاح (${availableStock}).`
              : `Sorry, requested quantity exceeds available stock (${availableStock}).`
          );
        }
        return;
      }
    }

    const { getProductEffectivePrice } = get();
    const { discountedPrice } = getProductEffectivePrice(product);
    const premium = getFabricPremium(fabric);
    const itemPrice = discountedPrice + premium;
    
    const cartItemId = `${product.id}-${size}-${fabric}-${fitType}`;
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
          price: itemPrice,
          fitType
        }
      ];
    }
    
    set({ cart: updatedCart, isCartOpen: true });
    localStorage.setItem('ff_cart', JSON.stringify(updatedCart));
    get().logAnalyticsEvent('cart_add', { product_id: product.id, product_name: product.name_en });
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

    const item = get().cart.find(i => i.id === cartItemId);
    if (item && item.product.stock_quantities && item.product.stock_quantities[item.size] !== undefined) {
      const availableStock = item.product.stock_quantities[item.size];
      if (quantity > availableStock) {
        if (typeof window !== 'undefined') {
          const isAr = localStorage.getItem('locale') === 'ar' || window.location.pathname.includes('/ar');
          alert(
            isAr
              ? `عذراً، المخزن المتاح لهذا المقاس هو ${availableStock} فقط.`
              : `Sorry, available stock for this size is only ${availableStock}.`
          );
        }
        return;
      }
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
  setPreviewProduct: (product) => {
    set({ previewProduct: product });
    if (product) {
      get().logAnalyticsEvent('item_view', { product_id: product.id, product_name: product.name_en });
    }
  },
  setCheckoutProduct: (product, options) => set({ 
    checkoutProduct: product,
    checkoutSelectedSize: options?.size || null,
    checkoutSelectedFabric: options?.fabric || null,
    checkoutSelectedFit: options?.fitType || null
  }),

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
      // 2. Check if there is an invited referrer phone/code (from URL ref= or manual referral coupon)
      let referrerPhone = typeof window !== 'undefined' ? localStorage.getItem('ff_referrer_phone') : null;
      
      if (referrerPhone && referrerPhone.trim().startsWith('REF-')) {
        try {
          const { data: refProfile } = await supabase
            .from('profiles')
            .select('phone')
            .eq('referral_code', referrerPhone.trim())
            .maybeSingle();
          if (refProfile && refProfile.phone) {
            referrerPhone = refProfile.phone;
          }
        } catch (e) {
          console.warn('Could not resolve referrer phone from code:', e);
        }
      }

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

        // Increment referrer's orders count
        let origRefCode = typeof window !== 'undefined' ? localStorage.getItem('ff_referrer_phone') : null;
        if (origRefCode) {
          try {
            const { data: refProf } = await supabase
              .from('profiles')
              .select('*')
              .eq('referral_code', origRefCode.trim())
              .maybeSingle();
            if (refProf) {
              await supabase
                .from('profiles')
                .update({ referral_orders: (refProf.referral_orders || 0) + 1 })
                .eq('id', refProf.id);
            }
          } catch (e) {
            console.warn('Could not increment referrer orders count:', e);
          }
        }
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

        // Decrement stock levels for ordered items
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            const prod = get().products.find(p => p.id === item.product_id);
            if (prod) {
              const currentStock = prod.stock_quantities || { S: 10, M: 15, L: 8, XL: 2, XXL: 0 };
              const sizeKey = (item.size || 'M').toUpperCase();
              const oldQty = currentStock[sizeKey] !== undefined ? currentStock[sizeKey] : 10;
              const newQty = Math.max(0, oldQty - (item.quantity || 1));
              
              const updatedStock = {
                ...currentStock,
                [sizeKey]: newQty
              };

              // Check if all sizes are 0, and auto-update is_in_stock to false if so
              const totalStock = Object.values(updatedStock).reduce((sum, q) => Number(sum) + Number(q), 0);
              const isInStock = totalStock > 0;

              // Save to Database
              await supabase.from('products').update({ 
                stock_quantities: updatedStock,
                is_in_stock: isInStock
              }).eq('id', prod.id);

              // Update local state list
              const updatedProducts = get().products.map(p => 
                p.id === prod.id ? { ...p, stock_quantities: updatedStock, is_in_stock: isInStock } : p
              );
              set({ products: updatedProducts });
            }
          }
        }

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
        const { user, profile, settings } = get();
        if (user && profile) {
          const threshold = Number(settings.loyalty_orders_threshold || 5);
          const hasLoyaltyDiscount = (profile.loyalty_points || 0) >= threshold;

          let nextPoints = (profile.loyalty_points || 0);
          if (hasLoyaltyDiscount) {
            nextPoints = Math.max(0, nextPoints - threshold);
          }
          // Increment by 1 point per completed order
          nextPoints = nextPoints + 1;

          const addressData = {
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            customer_email: order.customer_email || '',
            governorate: order.governorate || '',
            city: order.city || '',
            address: order.address || ''
          };
          const updatedProfile = { ...profile, loyalty_points: nextPoints, address_data: addressData };
          set({ profile: updatedProfile });
          await supabase.from('profiles').update({ loyalty_points: nextPoints, address_data: addressData }).eq('id', user.id);
        }
      }

      // Clear referral cookie/storage after it is successfully redeemed
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ff_referrer_phone');
      }

      // Sync local offers list to see the newly generated offers
      const { data: allOffers } = await supabase.from('offers').select('*');
      if (allOffers) set({ offers: allOffers });

      get().logAnalyticsEvent('order_completed');

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

  trackReferralClick: async (refCode) => {
    if (!refCode) return;
    try {
      const { data: matchedProfiles } = await supabase
        .from('profiles')
        .select('*')
        .or(`referral_code.eq.${refCode},phone.eq.${refCode}`);
        
      if (matchedProfiles && matchedProfiles.length > 0) {
        const targetProfile = matchedProfiles[0];
        const nextClicks = (targetProfile.referral_clicks || 0) + 1;
        const threshold = get().settings.referral_clicks_threshold ?? 5;
        
        if (nextClicks >= threshold) {
          const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
          const code = `REFERRAL-${randomString}`;
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);

          const newOffer = {
            title_en: 'Referral Clicks Goal Reward (15% OFF)',
            title_ar: 'مكافأة هدف زيارات الرابط (خصم ١٥٪)',
            description_en: 'Goal reached! (' + threshold + ' clicks on your link). Bound to phone: ' + targetProfile.phone,
            description_ar: 'تم الوصول للهدف! (' + threshold + ' زيارة لرابطك). مرتبطة برقم هاتف: ' + targetProfile.phone,
            discount_text_en: '15% OFF',
            discount_text_ar: 'خصم ١٥٪',
            code: code,
            discount_percent: 15,
            max_uses: 1,
            max_uses_per_user: 1,
            is_active: true,
            show_on_homepage: false,
            discount_type: 'percentage',
            discount_value: 15,
            coupon_type: 'referral_reward',
            is_one_time: true,
            is_public: false,
            bound_phone: targetProfile.phone || undefined,
            expires_at: expiryDate.toISOString()
          };

          await supabase.from('offers').insert([newOffer]);

          await supabase
            .from('profiles')
            .update({ referral_clicks: 0 })
            .eq('id', targetProfile.id);
        } else {
          await supabase
            .from('profiles')
            .update({ referral_clicks: nextClicks })
            .eq('id', targetProfile.id);
        }
      }
    } catch (e) {
      console.error('Error tracking referral click:', e);
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
      const { data, error } = await supabase.from('products').insert([product]).select();
      if (error) throw error;
      const { data: allProducts } = await supabase.from('products').select('*');
      if (allProducts) set({ products: allProducts });
      return data?.[0] || null;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  },

  updateProduct: async (id, product) => {
    try {
      const { data, error } = await supabase.from('products').update(product).eq('id', id).select();
      if (error) throw error;
      const { data: allProducts } = await supabase.from('products').select('*');
      if (allProducts) set({ products: allProducts });
      return data?.[0] || null;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  },

  fetchProductDesigns: async (productId) => {
    try {
      const { data, error } = await supabase
        .from('product_designs')
        .select('*')
        .eq('product_id', productId);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching product designs:', error);
      return [];
    }
  },

  addProductDesign: async (design) => {
    try {
      const { data, error } = await supabase
        .from('product_designs')
        .insert([design])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error adding product design:', error);
      return null;
    }
  },

  deleteProductDesign: async (id) => {
    try {
      const { error } = await supabase
        .from('product_designs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product design:', error);
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
      console.error('Error adding category to DB, using local state fallback:', error);
      const fallbackCat = {
        ...category,
        id: `cat-${Date.now()}`
      };
      set({ categories: [...get().categories, fallbackCat] });
    }
  },

  updateCategory: async (id, category) => {
    try {
      const { error } = await supabase.from('categories').update(category).eq('id', id);
      if (error) throw error;
      const { data: allCats } = await supabase.from('categories').select('*');
      if (allCats) set({ categories: allCats });
    } catch (error) {
      console.error('Error updating category in DB, using local state fallback:', error);
      const updatedCats = get().categories.map(c => c.id === id ? { ...c, ...category } : c);
      set({ categories: updatedCats });
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
  },

  isAdminViewMode: typeof window !== 'undefined' ? sessionStorage.getItem('ff_admin_view_mode') === 'true' : false,
  setAdminViewMode: (active) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ff_admin_view_mode', active ? 'true' : 'false');
    }
    set({ isAdminViewMode: active });
  },

  // Chat & Messages States
  activeChat: null,
  activeChatMessages: [],
  adminChats: [],
  autoResponses: [],
  chatGreeting: '',

  fetchUserChat: async (phone) => {
    const { user, profile } = get();
    let chat = null;
    
    try {
      const userId = user?.id;
      const userPhone = (phone || profile?.phone || '').trim();
      
      // 1. Try to find existing chat by user_id first
      if (userId) {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('user_id', userId)
          .eq('user_deleted', false)
          .maybeSingle();
        if (data && !error) {
          chat = data;
        }
      }
      
      // 2. If not found by user_id, but we have a phone number, search by customer_phone
      if (!chat && userPhone) {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('customer_phone', userPhone)
          .eq('user_deleted', false)
          .maybeSingle();
        if (data && !error) {
          chat = data;
          // Link this guest chat to the logged-in user!
          if (userId && !chat.user_id) {
            const { data: updatedChat } = await supabase
              .from('chats')
              .update({ user_id: userId, customer_name: profile?.full_name || chat.customer_name })
              .eq('id', chat.id)
              .select()
              .maybeSingle();
            if (updatedChat) {
              chat = updatedChat;
            }
          }
        }
      }
      
      // 3. If still not found and we are logged in, create a new chat linked to user
      if (!chat && userId) {
        const namePrefix = user.email?.split('@')[0] || 'User';
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert([{ 
            user_id: userId, 
            customer_phone: userPhone || undefined, 
            customer_name: profile?.full_name || namePrefix 
          }])
          .select()
          .single();
        if (!createError && newChat) {
          chat = newChat;
        }
      }
      
      // 4. If not logged in but guest phone is provided, verify guest order history and create
      if (!chat && !userId && userPhone) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('customer_name')
          .eq('customer_phone', userPhone)
          .limit(1);
          
        const { data: customData } = await supabase
          .from('custom_requests')
          .select('customer_name')
          .eq('customer_phone', userPhone)
          .limit(1);
          
        if ((orderData && orderData.length > 0) || (customData && customData.length > 0)) {
          const guestName = (orderData?.[0]?.customer_name || customData?.[0]?.customer_name || 'Guest');
          const { data: newChat, error: createError } = await supabase
            .from('chats')
            .insert([{ customer_phone: userPhone, customer_name: guestName }])
            .select()
            .single();
          if (!createError && newChat) {
            chat = newChat;
          }
        }
      }

      if (chat) {
        set({ activeChat: chat });
        
        // Fetch messages for this chat
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: true });
          
        set({ activeChatMessages: messages || [] });
        return chat;
      }
      
      set({ activeChat: null, activeChatMessages: [] });
      return null;
    } catch (err) {
      console.error('Error fetching user chat:', err);
      set({ activeChat: null, activeChatMessages: [] });
      return null;
    }
  },

  sendChatMessage: async (chatId, message, sender) => {
    try {
      const activeChat = get().activeChat;
      if (activeChat?.is_blocked && sender === 'user') return;

      const { data: newMsg, error } = await supabase
        .from('chat_messages')
        .insert([{ chat_id: chatId, message, sender }])
        .select()
        .single();

      if (!error && newMsg) {
        set(state => ({
          activeChatMessages: [...state.activeChatMessages, newMsg]
        }));

        // Update chat's updated_at timestamp
        await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId);

        // Check for Auto Responses
        if (sender === 'user') {
          const cleanMsg = message.toLowerCase().trim();
          
          // Arabic cleanup function (ignoring simple diacritics and letters variations)
          const normalizeArabic = (text: string) => {
            return text
              .replace(/[\u064B-\u0652]/g, "") // remove diacritics
              .replace(/[أإآا]/g, "ا")
              .replace(/ة/g, "ه")
              .replace(/ى/g, "ي")
              .replace(/ؤ/g, "ء")
              .replace(/ئ/g, "ء");
          };

          const normalizedMsg = normalizeArabic(cleanMsg);
          const autoResps = get().autoResponses;
          
          const matchedResponse = autoResps.find(r => {
            if (!r.is_active) return false;
            return r.trigger_words.some((word: string) => {
              const cleanWord = word.toLowerCase().trim();
              const normWord = normalizeArabic(cleanWord);
              return normalizedMsg.includes(normWord) || cleanMsg.includes(cleanWord);
            });
          });

          if (matchedResponse) {
            // Wait 600ms to simulate bot typing/processing
            setTimeout(async () => {
              const { data: botMsg } = await supabase
                .from('chat_messages')
                .insert([{
                  chat_id: chatId,
                  message: matchedResponse.response_text,
                  sender: 'system'
                }])
                .select()
                .single();
                
              if (botMsg) {
                set(state => ({
                  activeChatMessages: [...state.activeChatMessages, botMsg]
                }));
              }
            }, 600);
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  },

  endUserChat: async (chatId) => {
    try {
      await supabase
        .from('chats')
        .update({ user_deleted: true, status: 'closed' })
        .eq('id', chatId);
      set({ activeChat: null, activeChatMessages: [] });
    } catch (err) {
      console.error('Error ending chat:', err);
    }
  },

  fetchAdminChats: async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false });
      if (!error && data) {
        set({ adminChats: data });
      }
    } catch (err) {
      console.error('Error fetching admin chats:', err);
    }
  },

  adminSendChatMessage: async (chatId, message) => {
    try {
      const { data: newMsg, error } = await supabase
        .from('chat_messages')
        .insert([{ chat_id: chatId, message, sender: 'admin' }])
        .select()
        .single();
        
      if (!error && newMsg) {
        // Reopen the chat for user if it was deleted or closed
        await supabase
          .from('chats')
          .update({ 
            status: 'open', 
            user_deleted: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', chatId);

        // If the admin is actively viewing this chat, append it
        const activeChat = get().activeChat;
        if (activeChat && activeChat.id === chatId) {
          set(state => ({
            activeChatMessages: [...state.activeChatMessages, newMsg],
            activeChat: { ...activeChat, status: 'open', user_deleted: false }
          }));
        }
        
        // Refresh admin chats list
        await get().fetchAdminChats();
      }
    } catch (err) {
      console.error('Error sending admin message:', err);
    }
  },

  adminCloseChat: async (chatId) => {
    try {
      await supabase
        .from('chats')
        .update({ status: 'closed' })
        .eq('id', chatId);
        
      const activeChat = get().activeChat;
      if (activeChat && activeChat.id === chatId) {
        set({ activeChat: { ...activeChat, status: 'closed' } });
      }
      await get().fetchAdminChats();
    } catch (err) {
      console.error('Error closing chat:', err);
    }
  },

  adminReopenChat: async (chatId) => {
    try {
      await supabase
        .from('chats')
        .update({ status: 'open', user_deleted: false })
        .eq('id', chatId);
        
      const activeChat = get().activeChat;
      if (activeChat && activeChat.id === chatId) {
        set({ activeChat: { ...activeChat, status: 'open', user_deleted: false } });
      }
      await get().fetchAdminChats();
    } catch (err) {
      console.error('Error reopening chat:', err);
    }
  },

  adminBlockUser: async (chatId) => {
    try {
      await supabase
        .from('chats')
        .update({ is_blocked: true })
        .eq('id', chatId);
        
      const activeChat = get().activeChat;
      if (activeChat && activeChat.id === chatId) {
        set({ activeChat: { ...activeChat, is_blocked: true } });
      }
      await get().fetchAdminChats();
    } catch (err) {
      console.error('Error blocking user:', err);
    }
  },

  adminUnblockUser: async (chatId) => {
    try {
      await supabase
        .from('chats')
        .update({ is_blocked: false })
        .eq('id', chatId);
        
      const activeChat = get().activeChat;
      if (activeChat && activeChat.id === chatId) {
        set({ activeChat: { ...activeChat, is_blocked: false } });
      }
      await get().fetchAdminChats();
    } catch (err) {
      console.error('Error unblocking user:', err);
    }
  },

  fetchAutoResponses: async () => {
    try {
      const { data, error } = await supabase
        .from('chat_auto_responses')
        .select('*');
      if (!error && data) {
        set({ autoResponses: data });
      }
    } catch (err) {
      console.error('Error fetching auto responses:', err);
    }
  },

  saveAutoResponse: async (resp) => {
    try {
      const { error } = await supabase
        .from('chat_auto_responses')
        .insert([resp]);
      if (!error) {
        await get().fetchAutoResponses();
      }
    } catch (err) {
      console.error('Error saving auto response:', err);
    }
  },

  deleteAutoResponse: async (id) => {
    try {
      const { error } = await supabase
        .from('chat_auto_responses')
        .delete()
        .eq('id', id);
      if (!error) {
        await get().fetchAutoResponses();
      }
    } catch (err) {
      console.error('Error deleting auto response:', err);
    }
  },

  adminStartChat: async (phone, name) => {
    try {
      const cleanPhone = phone.trim();
      const { data: existingChat } = await supabase
        .from('chats')
        .select('*')
        .eq('customer_phone', cleanPhone)
        .maybeSingle();

      let chat = null;
      if (existingChat) {
        await supabase
          .from('chats')
          .update({ status: 'open', user_deleted: false })
          .eq('id', existingChat.id);
          
        const { data: updatedChat } = await supabase
          .from('chats')
          .select('*')
          .eq('id', existingChat.id)
          .single();
          
        chat = updatedChat;
      } else {
        const { data: newChat } = await supabase
          .from('chats')
          .insert([{ customer_phone: cleanPhone, customer_name: name, status: 'open' }])
          .select()
          .single();
        chat = newChat;
      }

      await get().fetchAdminChats();
      return chat;
    } catch (err) {
      console.error('Error starting admin chat:', err);
      return null;
    }
  },

  usersList: [],
  fetchUsersList: async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (!error && profiles) {
        const mockUsers = typeof window !== 'undefined' 
          ? JSON.parse(localStorage.getItem('ff_mock_users') || '[]') 
          : [];
          
        const users = profiles.map((prof: any) => {
          const credentials = mockUsers.find((u: any) => u.id === prof.id || u.email === prof.email);
          return {
            ...prof,
            email: prof.email || credentials?.email || '',
            password: credentials?.password || '********'
          };
        });
        set({ usersList: users });
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  },

  adminUpdateUserProfile: async (userId, patch) => {
    try {
      const { password, email, full_name, phone, loyalty_points, address_data } = patch;
      
      const profileUpdates: Record<string, any> = {};
      if (email !== undefined) profileUpdates.email = email;
      if (full_name !== undefined) profileUpdates.full_name = full_name;
      if (phone !== undefined) profileUpdates.phone = phone;
      if (loyalty_points !== undefined) profileUpdates.loyalty_points = Number(loyalty_points);
      if (address_data !== undefined) profileUpdates.address_data = address_data;
      
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);
        
      if (error) throw error;

      if (typeof window !== 'undefined') {
        const mockUsers = JSON.parse(localStorage.getItem('ff_mock_users') || '[]');
        const updatedUsers = mockUsers.map((u: any) => {
          if (u.id === userId) {
            const updatedCreds = { ...u };
            if (email !== undefined) updatedCreds.email = email;
            if (password !== undefined) updatedCreds.password = password;
            return updatedCreds;
          }
          return u;
        });
        localStorage.setItem('ff_mock_users', JSON.stringify(updatedUsers));
      }

      await get().fetchUsersList();
    } catch (err) {
      console.error('Error updating user profile:', err);
      alert('Failed to update user details.');
    }
  },

  analyticsEvents: [] as any[],
  logAnalyticsEvent: async (type: string, details: Record<string, any> = {}) => {
    try {
      if (typeof window === 'undefined') return;
      let sessionId = sessionStorage.getItem('ff_analytics_session');
      if (!sessionId) {
        sessionId = 'sess-' + Math.random().toString(36).substring(7);
        sessionStorage.setItem('ff_analytics_session', sessionId);
      }

      const eventPayload = {
        event_type: type,
        session_id: sessionId,
        product_id: details.product_id || null,
        product_name: details.product_name || null
      };

      const { data: newEvt, error } = await supabase
        .from('analytics_events')
        .insert([eventPayload])
        .select()
        .single();

      if (!error && newEvt) {
        set(state => ({
          analyticsEvents: [newEvt, ...state.analyticsEvents]
        }));
      }
    } catch (err) {
      console.error('Error logging analytics event:', err);
    }
  },

  fetchAnalyticsEvents: async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        set({ analyticsEvents: data });
      }
    } catch (err) {
      console.error('Error fetching analytics events:', err);
    }
  },
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
  thresholdDiscount: number;
  thresholdOfferName: string;
  shipping: number;
  finalTotal: number;
}

export const getCartTotals = (
  cart: CartItem[], 
  cottonEnabled: boolean = true, 
  autoOffers: any[] = [],
  thresholdOffersList: any[] = []
): CartTotals => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let cottonDiscount = 0;
  const hasCotton = cottonEnabled && cart.some(item => item.product.gives_cotton_reward === true);
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (hasCotton && totalQty >= 2) {
    const flatItems = cart.flatMap(item => Array(item.quantity).fill(item));
    flatItems.sort((a, b) => b.price - a.price);
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

  // Calculate Threshold Offers
  let thresholdDiscount = 0;
  let thresholdOfferName = '';
  let freeDelivery = false;

  if (thresholdOffersList && thresholdOffersList.length > 0) {
    for (const offer of thresholdOffersList) {
      if (!offer.is_active) continue;
      if (subtotal >= offer.min_order_amount) {
        if (offer.discount_type === 'free_delivery') {
          freeDelivery = true;
          thresholdOfferName = offer.label_en || 'Free Delivery';
        } else if (offer.discount_type === 'percentage') {
          const disc = Math.round((subtotal * offer.discount_value) / 100);
          if (disc > thresholdDiscount) {
            thresholdDiscount = disc;
            thresholdOfferName = offer.label_en || `${offer.discount_value}% OFF`;
          }
        } else if (offer.discount_type === 'fixed') {
          const disc = Math.min(offer.discount_value, subtotal);
          if (disc > thresholdDiscount) {
            thresholdDiscount = disc;
            thresholdOfferName = offer.label_en || `${offer.discount_value} EGP OFF`;
          }
        }
      }
    }
  }
  
  const shipping = freeDelivery ? 0 : (subtotal > 0 ? 50 : 0);
  const finalTotal = Math.max(0, subtotal - cottonDiscount - autoAppliedDiscount - thresholdDiscount + shipping);
  
  return {
    subtotal,
    cottonDiscount,
    autoAppliedDiscount,
    autoAppliedOfferName,
    thresholdDiscount,
    thresholdOfferName,
    shipping,
    finalTotal
  };
};
