import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isPlaceholder = 
  !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseUrl.includes('placeholder') || 
  supabaseAnonKey.includes('placeholder');

export const isUsingMock = isPlaceholder;

// Fallback Mock LocalStorage Database for seamless offline demo
const getMockDb = () => {
  if (typeof window === 'undefined') return { products: [], categories: [], offers: [], custom_requests: [], settings: {}, orders: [] };
  
  const categoriesKey = 'ff_categories';
  const productsKey = 'ff_products';
  const offersKey = 'ff_offers';
  const customKey = 'ff_custom_requests';
  const settingsKey = 'ff_settings';
  const ordersKey = 'ff_orders';

  let categories = JSON.parse(localStorage.getItem(categoriesKey) || '[]');
  let products = JSON.parse(localStorage.getItem(productsKey) || '[]');
  let offers = JSON.parse(localStorage.getItem(offersKey) || '[]');
  let custom_requests = JSON.parse(localStorage.getItem(customKey) || '[]');
  let settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
  let orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');

  // Seed default data if empty
  if (categories.length === 0) {
    categories = [
      { id: '1', slug: 'games', name_en: 'Games', name_ar: 'ألعاب', display_order: 1, is_hidden: false },
      { id: '2', slug: 'movies', name_en: 'Movies', name_ar: 'أفلام', display_order: 2, is_hidden: false },
      { id: '3', slug: 'tv-shows', name_en: 'TV Shows', name_ar: 'مسلسلات', display_order: 3, is_hidden: false },
      { id: '4', slug: 'anime', name_en: 'Anime', name_ar: 'أنمي', display_order: 4, is_hidden: false },
      { id: '5', slug: 'football', name_en: 'Football', name_ar: 'كرة قدم', display_order: 5, is_hidden: false },
      { id: '6', slug: 'music', name_en: 'Music', name_ar: 'موسيقى', display_order: 6, is_hidden: false },
      { id: '7', slug: 'random', name_en: 'Random', name_ar: 'عشوائي', display_order: 7, is_hidden: false },
    ];
    localStorage.setItem(categoriesKey, JSON.stringify(categories));
  }

  if (products.length === 0) {
    products = [
      // 1. PLACEHOLDERS (Always shown)
      {
        id: 'p-games',
        slug: 'games-placeholder',
        name_en: 'Games Fandom Tee',
        name_ar: 'تيشيرت الفاندوم للألعاب',
        description_en: 'Official vintage collection theme placeholder shirt for gaming drops. Relaxed streetwear fit.',
        description_ar: 'تيشيرت الفكرة الكلاسيكية للألعاب. قصة مريحة لملابس الشارع.',
        category_id: '1',
        price: 490,
        sale_price: null,
        is_in_stock: true,
        display_order: 10,
        is_featured: false,
        is_trending: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/placeholders/Games.jpg']
      },
      {
        id: 'p-movies',
        slug: 'movies-placeholder',
        name_en: 'Movies Fandom Tee',
        name_ar: 'تيشيرت الفاندوم للأفلام',
        description_en: 'Official vintage collection theme placeholder shirt for cinema drops. Relaxed streetwear fit.',
        description_ar: 'تيشيرت الفكرة الكلاسيكية للأفلام والسينما. قصة مريحة لملابس الشارع.',
        category_id: '2',
        price: 490,
        sale_price: null,
        is_in_stock: true,
        display_order: 11,
        is_featured: false,
        is_trending: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/placeholders/Movies.jpg']
      },
      {
        id: 'p-shows',
        slug: 'shows-placeholder',
        name_en: 'TV Shows Fandom Tee',
        name_ar: 'تيشيرت الفاندوم للمسلسلات',
        description_en: 'Official vintage collection theme placeholder shirt for shows drops. Relaxed streetwear fit.',
        description_ar: 'تيشيرت الفكرة الكلاسيكية للمسلسلات التلفزيونية. قصة مريحة لملابس الشارع.',
        category_id: '3',
        price: 490,
        sale_price: null,
        is_in_stock: true,
        display_order: 12,
        is_featured: false,
        is_trending: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/placeholders/Shows.jpg']
      },
      {
        id: 'p-football',
        slug: 'football-placeholder',
        name_en: 'Football Fandom Tee',
        name_ar: 'تيشيرت الفاندوم لكرة القدم',
        description_en: 'Official vintage collection theme placeholder shirt for football drops. Relaxed streetwear fit.',
        description_ar: 'تيشيرت الفكرة الكلاسيكية لكرة القدم والرياضة. قصة مريحة لملابس الشارع.',
        category_id: '5',
        price: 490,
        sale_price: null,
        is_in_stock: true,
        display_order: 13,
        is_featured: false,
        is_trending: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/placeholders/Football.jpg']
      },
      {
        id: 'p-singers',
        slug: 'singers-placeholder',
        name_en: 'Singers Fandom Tee',
        name_ar: 'تيشيرت الفاندوم للمغنيين',
        description_en: 'Official vintage collection theme placeholder shirt for music drops. Relaxed streetwear fit.',
        description_ar: 'تيشيرت الفكرة الكلاسيكية للمغنيين والموسيقى. قصة مريحة لملابس الشارع.',
        category_id: '6',
        price: 490,
        sale_price: null,
        is_in_stock: true,
        display_order: 14,
        is_featured: false,
        is_trending: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/placeholders/Singers.jpg']
      },
      {
        id: 'p-random',
        slug: 'random-placeholder',
        name_en: 'Random Fandom Tee',
        name_ar: 'تيشيرت الفاندوم العشوائي',
        description_en: 'Official vintage collection theme placeholder shirt for random ideas. Relaxed streetwear fit.',
        description_ar: 'تيشيرت الفكرة الكلاسيكية للأفكار العشوائية. قصة مريحة لملابس الشارع.',
        category_id: '7',
        price: 490,
        sale_price: null,
        is_in_stock: true,
        display_order: 15,
        is_featured: false,
        is_trending: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/placeholders/Random.jpg']
      },

      // 2. READY ITEMS (From Images/Items)
      {
        id: 'r-fese3',
        slug: 'movies-fese3-tee',
        name_en: 'Fight Club / Se7en Distressed Tee',
        name_ar: 'تيشيرت نادي القتال وسبعة الممزق',
        description_en: 'Vintage faded print inspired by cinematic classics. Custom graphic layout, premium heavyweight cotton build.',
        description_ar: 'طبعة قديمة مميزة مستوحاة من كلاسيكيات السينما. تصميم جرافيك مخصص، خامة قطن ثقيل فاخر.',
        category_id: '2',
        price: 520,
        sale_price: 450,
        is_in_stock: true,
        display_order: 1,
        is_featured: true,
        is_trending: true,
        is_new_arrival: true,
        is_best_seller: true,
        is_limited_edition: true,
        is_pinned: true, // Pinned Item!
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/Movies (FESE3).jpg']
      },
      {
        id: 'r-got',
        slug: 'shows-got-tee',
        name_en: 'GOT Winter is Coming Tee',
        name_ar: 'تيشيرت صراع العروش الشتاء قادم',
        description_en: 'House Stark sigil representation with a streetwear gothic text overlay. Boxy fit.',
        description_ar: 'شعار عائلة ستارك مع نص قوطي بأسلوب ملابس الشارع المعاصرة. قصة مربعة واسعة.',
        category_id: '3',
        price: 490,
        sale_price: null,
        is_in_stock: true,
        display_order: 2,
        is_featured: true,
        is_trending: true,
        is_new_arrival: true,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: true, // Pinned Item!
        available_sizes: ['M', 'L', 'XL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/Shows (GOT).jpg']
      },
      {
        id: 'r-st',
        slug: 'shows-st-tee',
        name_en: 'Stranger Things Hawkins Tee',
        name_ar: 'تيشيرت أشياء غريبة هوكينز',
        description_en: 'Vintage athletic graphic print dedicated to the Hawkins High class of 86. Comfort cotton blend.',
        description_ar: 'طبعة رياضية كلاسيكية مخصصة لمدرسة هوكينز الثانوية دفعة ٨٦. خامة مريحة.',
        category_id: '3',
        price: 480,
        sale_price: 390,
        is_in_stock: true,
        display_order: 3,
        is_featured: false,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL'],
        material_options: ['Standard Cotton'],
        images: ['/items/Shows (ST).jpg']
      },
      {
        id: 'r-twlete',
        slug: 'song-twlete-tee',
        name_en: 'Twilight Band Tee',
        name_ar: 'تيشيرت فرقة توايلايت الموسيقية',
        description_en: 'Faded indie aesthetic design focusing on the nostalgic music and mood of the movie. Oversized fit.',
        description_ar: 'تصميم فني موسيقي قديم يركز على الموسيقى الحالمة وأجواء الفيلم. قصة واسعة فضفاضة.',
        category_id: '6',
        price: 510,
        sale_price: null,
        is_in_stock: true,
        display_order: 4,
        is_featured: true,
        is_trending: false,
        is_new_arrival: false,
        is_best_seller: true,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/Song (Twlete).jpg']
      }
    ];
    localStorage.setItem(productsKey, JSON.stringify(products));
  }

  if (offers.length === 0) {
    offers = [
      { id: 'o1', title_en: '25% OFF Premium Cotton Material', title_ar: 'خصم 25% على خامة القطن الفاخر', description_en: 'Get 25% off the premium heavy cotton upgrade for your second item.', description_ar: 'احصل على خصم 25% عند الترقية إلى خامة القطن الثقيل الفاخر للقطعة الثانية.', discount_text_en: '25% OFF', discount_text_ar: 'خصم 25%', code: 'PREMIUM25', is_active: true },
      { id: 'o2', title_en: 'Refer a Friend — Get 15% OFF', title_ar: 'رشح صديقاً — واحصل على 15% خصم', description_en: 'Tag a friend in our DMs. You both get 15% off your next fandom print.', description_ar: 'منشن صديقاً في رسائلنا. ستحصلان كلاهما على خصم 15% على طباعة الفاندوم التالية.', discount_text_en: '15% OFF', discount_text_ar: 'خصم 15%', code: 'FRIENDS15', is_active: true }
    ];
    localStorage.setItem(offersKey, JSON.stringify(offers));
  }

  if (Object.keys(settings).length === 0) {
    settings = {
      instagram_url: 'https://www.instagram.com/fandom.__.fit?igsh=cG9udzFxcjg5MGZv',
      tiktok_url: 'https://www.tiktok.com/@fandom._.fit?_r=1&_t=ZS-97n8CR3c4or',
      facebook_url: 'https://www.facebook.com/share/1GmUSwSQRE/',
      brand_name: 'Fandom Fit',
      tagline: 'Wear What You Love.',
      seo_title: 'Fandom Fit | Premium Streetwear',
      seo_desc: 'Bespoke fandom streetwear inspired by gaming, anime, and pop culture.',
      shipping_info_en: 'Free returns, shipping within 3-5 business days across Egypt.',
      shipping_info_ar: 'مرونة الاسترجاع، الشحن خلال ٣-٥ أيام عمل لجميع المحافظات.',
      announcement: '🔥 SPECIAL ANNOUNCEMENT: Direct Web checkout is now active! Try ordering right here! 🔥'
    };
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }

  // Set default settings if announcement key is missing
  if (!settings.announcement) {
    settings.announcement = '🔥 SPECIAL ANNOUNCEMENT: Direct Web checkout is now active! Try ordering right here! 🔥';
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }

  return { categories, products, offers, custom_requests, settings, orders };
};

const saveMockDb = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Mock Client Interface mimicking Supabase js calls
export const mockSupabase = {
  auth: {
    getUser: async () => {
      if (typeof window === 'undefined') return { data: { user: null } };
      const user = JSON.parse(sessionStorage.getItem('ff_admin_user') || 'null');
      return { data: { user } };
    },
    signInWithPassword: async ({ email, password }: any) => {
      if (email === 'admin@fandomfit.com' && password === 'admin123') {
        const user = { id: 'admin-id', email };
        sessionStorage.setItem('ff_admin_user', JSON.stringify(user));
        return { data: { user }, error: null };
      }
      return { data: null, error: { message: 'Invalid credentials. Use admin@fandomfit.com / admin123 for testing.' } };
    },
    signOut: async () => {
      sessionStorage.removeItem('ff_admin_user');
      return { error: null };
    }
  },
  from: (table: string) => {
    const db = getMockDb();
    
    return {
      select: (query = '*') => {
        let data: any = [];
        if (table === 'categories') data = db.categories.sort((a: any, b: any) => a.display_order - b.display_order);
        else if (table === 'products') data = db.products.sort((a: any, b: any) => a.display_order - b.display_order);
        else if (table === 'offers') data = db.offers;
        else if (table === 'orders') data = db.orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        else if (table === 'custom_requests') data = db.custom_requests.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        else if (table === 'settings' || table === 'homepage_sections') {
          // returns keys as rows
          data = Object.entries(db.settings).map(([key, value]) => ({ key, value }));
        }

        return {
          data,
          error: null,
          single: () => {
            if (table === 'settings') {
              return { data: { key: query, value: db.settings }, error: null };
            }
            return { data: data[0] || null, error: null };
          },
          eq: (field: string, value: any) => {
            let filtered = [...data];
            if (field === 'slug') filtered = data.filter((item: any) => item.slug === value);
            else if (field === 'id') filtered = data.filter((item: any) => item.id === value);
            else if (field === 'category_id') filtered = data.filter((item: any) => item.category_id === value);
            
            return {
              data: filtered,
              error: null,
              single: () => ({ data: filtered[0] || null, error: filtered.length ? null : { message: 'Not found' } })
            };
          }
        };
      },
      insert: async (rows: any[]) => {
        const rowsArray = Array.isArray(rows) ? rows : [rows];
        if (table === 'custom_requests') {
          const newRequests = rowsArray.map(r => ({
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            status: 'pending',
            reference_images: [],
            ...r
          }));
          const updated = [...db.custom_requests, ...newRequests];
          saveMockDb('ff_custom_requests', updated);
          return { data: newRequests, error: null };
        } else if (table === 'products') {
          const newProducts = rowsArray.map(r => ({
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            images: r.images || ['/placeholders/arcade_front.jpg'],
            ...r
          }));
          const updated = [...db.products, ...newProducts];
          saveMockDb('ff_products', updated);
          return { data: newProducts, error: null };
        } else if (table === 'categories') {
          const newCats = rowsArray.map(r => ({
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            ...r
          }));
          const updated = [...db.categories, ...newCats];
          saveMockDb('ff_categories', updated);
          return { data: newCats, error: null };
        } else if (table === 'offers') {
          const newOffers = rowsArray.map(r => ({
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            ...r
          }));
          const updated = [...db.offers, ...newOffers];
          saveMockDb('ff_offers', updated);
          return { data: newOffers, error: null };
        } else if (table === 'orders') {
          const newOrders = rowsArray.map(r => ({
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            status: 'pending',
            ...r
          }));
          const updated = [...db.orders, ...newOrders];
          saveMockDb('ff_orders', updated);
          return { data: newOrders, error: null };
        }
        return { data: rowsArray, error: null };
      },
      update: async (values: any) => {
        return {
          eq: (field: string, idVal: any) => {
            if (table === 'settings') {
              // values holds settings object
              const updatedSettings = { ...db.settings, ...values };
              saveMockDb('ff_settings', updatedSettings);
              return { data: updatedSettings, error: null };
            }
            if (table === 'products') {
              const updated = db.products.map((p: any) => p[field] === idVal ? { ...p, ...values } : p);
              saveMockDb('ff_products', updated);
              return { data: values, error: null };
            }
            if (table === 'categories') {
              const updated = db.categories.map((c: any) => c[field] === idVal ? { ...c, ...values } : c);
              saveMockDb('ff_categories', updated);
              return { data: values, error: null };
            }
            if (table === 'offers') {
              const updated = db.offers.map((o: any) => o[field] === idVal ? { ...o, ...values } : o);
              saveMockDb('ff_offers', updated);
              return { data: values, error: null };
            }
            if (table === 'custom_requests') {
              const updated = db.custom_requests.map((r: any) => r[field] === idVal ? { ...r, ...values } : r);
              saveMockDb('ff_custom_requests', updated);
              return { data: values, error: null };
            }
            if (table === 'orders') {
              const updated = db.orders.map((o: any) => o[field] === idVal ? { ...o, ...values } : o);
              saveMockDb('ff_orders', updated);
              return { data: values, error: null };
            }
            return { data: null, error: null };
          }
        };
      },
      delete: async () => {
        return {
          eq: (field: string, idVal: any) => {
            if (table === 'products') {
              const filtered = db.products.filter((p: any) => p[field] !== idVal);
              saveMockDb('ff_products', filtered);
            } else if (table === 'categories') {
              const filtered = db.categories.filter((c: any) => c[field] !== idVal);
              saveMockDb('ff_categories', filtered);
            } else if (table === 'offers') {
              const filtered = db.offers.filter((o: any) => o[field] !== idVal);
              saveMockDb('ff_offers', filtered);
            }
            return { error: null };
          }
        };
      }
    };
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        // Mock file upload: generate object URL
        const mockUrl = URL.createObjectURL(file);
        return { data: { path: mockUrl }, error: null };
      },
      getPublicUrl: (path: string) => {
        // If it starts with blob or standard path, return it, otherwise mock bucket path
        if (path.startsWith('blob:') || path.startsWith('/')) {
          return { data: { publicUrl: path } };
        }
        return { data: { publicUrl: `/placeholders/${path}` } };
      }
    })
  }
};

// Exports either the real Supabase client or our fully functioning localStorage mock client
export const supabase = isPlaceholder ? (mockSupabase as any) : createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
