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
  const productsKey = 'ff_products_v3';
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
      {
        id: 'r-amr-diab',
        slug: 'amr-diab-tee',
        name_en: 'Amr Diab Vintage Tee',
        name_ar: 'تيشيرت عمرو دياب الكلاسيكي',
        description_en: 'Vintage Amr Diab graphic tee celebrating the legendary music of the Arab world. Streetwear boxy fit.',
        description_ar: 'تيشيرت عمرو دياب الكلاسيكي يحتفل بموسيقى الهضبة الأسطورية. قصة واسعة لملابس الشارع.',
        category_id: '6',
        price: 500,
        sale_price: null,
        is_in_stock: true,
        display_order: 1,
        is_featured: true,
        is_trending: true,
        is_new_arrival: true,
        is_best_seller: true,
        is_limited_edition: false,
        is_pinned: true,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/AMR DIAB - SONGS.jpg']
      },
      {
        id: 'r-argok-mtkon4-sada',
        slug: 'argok-mtkons-sada-tee',
        name_en: 'Argok Mtkons Sada Typography Tee',
        name_ar: 'تيشيرت أرجوك متكونش ساده',
        description_en: 'Bold streetwear typography print "Argok Mtkons Sada" for a unique daily style statement. Comfortable heavy cotton.',
        description_ar: 'تيشيرت كلاسيكي مطبوع بعبارة "أرجوك متكونش ساده" بتصميم جريء ومميز. خامة قطن ثقيل ومريح.',
        category_id: '7',
        price: 480,
        sale_price: null,
        is_in_stock: true,
        display_order: 2,
        is_featured: false,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/ARGOK MTKON4 SADA - RANDOM.jpg']
      },
      {
        id: 'r-ariana-grande',
        slug: 'ariana-grande-tee',
        name_en: 'Ariana Grande Portrait Tee',
        name_ar: 'تيشيرت أريانا غراندي الكلاسيكي',
        description_en: 'Vintage Ariana Grande aesthetic print featuring iconic pop portrait art. Relaxed boxy streetwear design.',
        description_ar: 'تيشيرت أريانا غراندي بتصميم كلاسيكي مميز مع رسم بورتريه أيقوني. قصة واسعة مريحة.',
        category_id: '6',
        price: 520,
        sale_price: 450,
        is_in_stock: true,
        display_order: 3,
        is_featured: true,
        is_trending: true,
        is_new_arrival: false,
        is_best_seller: true,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/ARIANA GRANDE - SONGS.jpg']
      },
      {
        id: 'r-haaland',
        slug: 'haaland-erling-tee',
        name_en: 'Haaland Erling Football Tee',
        name_ar: 'تيشيرت إيرلينج هالاند الرياضي',
        description_en: 'Graphic tribute shirt to the ultimate striker Erling Haaland. Perfect relaxed fit for stadium and streetwear styles.',
        description_ar: 'تيشيرت إيرلينج هالاند الرياضي بتصميم جرافيك مميز. قصة مريحة مناسبة لملابس الشارع والملاعب.',
        category_id: '5',
        price: 490,
        sale_price: null,
        is_in_stock: true,
        display_order: 4,
        is_featured: false,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/HALLAND - FOOTBALL.jpg']
      },
      {
        id: 'r-ma-tygy-a3dy-3lek',
        slug: 'ma-tygy-a3dy-3lek-tee',
        name_en: 'Ma Tygy A3dy 3lek Graphic Tee',
        name_ar: 'تيشيرت ما تيجي أعدي عليك',
        description_en: 'Fun typography print inspired by popular music hits. Premium comfort cotton build with a stylish streetwear look.',
        description_ar: 'تيشيرت "ما تيجي أعدي عليك" بطبعة مميزة ومرحة مستوحاة من الأغاني الشهيرة. قطن فاخر ومريح.',
        category_id: '6',
        price: 480,
        sale_price: null,
        is_in_stock: true,
        display_order: 5,
        is_featured: false,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/MA TYGY A3DY 3LEK - SONGS.jpg']
      },
      {
        id: 'r-mo-salah',
        slug: 'mo-salah-egyptian-king-tee',
        name_en: 'Mo Salah Egyptian King Tee',
        name_ar: 'تيشيرت فخر العرب محمد صلاح',
        description_en: 'Celebrate the Egyptian King Mohamed Salah with this graphic streetwear piece. High quality fade-resistant print.',
        description_ar: 'تيشيرت فخر العرب محمد صلاح بتصميم جرافيك رائع. طبعة عالية الجودة مقاومة للبهتان.',
        category_id: '5',
        price: 490,
        sale_price: null,
        is_in_stock: true,
        display_order: 6,
        is_featured: true,
        is_trending: true,
        is_new_arrival: false,
        is_best_seller: true,
        is_limited_edition: false,
        is_pinned: true,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/MO SALAH - FOOTBALL.jpg']
      },
      {
        id: 'r-no-fair',
        slug: 'no-fair-football-tee',
        name_en: 'No Fair Football Tee',
        name_ar: 'تيشيرت نو فير لكرة القدم',
        description_en: 'Minimalist athletic concept print design for football lovers. Relaxed comfy streetwear cut.',
        description_ar: 'تيشيرت بتصميم رياضي بسيط وعصري لعشاق كرة القدم. قصة مريحة ومميزة لملابس الشارع.',
        category_id: '5',
        price: 480,
        sale_price: null,
        is_in_stock: true,
        display_order: 7,
        is_featured: false,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/NO FAIR - FOOTBALL.jpg']
      },
      {
        id: 'r-pll',
        slug: 'pretty-little-liars-tee',
        name_en: 'Pretty Little Liars Retro Tee',
        name_ar: 'تيشيرت بريتي ليتل لايرز الكلاسيكي',
        description_en: 'Mystery-themed nostalgic graphics inspired by Rosewood High. Heavyweight premium cotton blend.',
        description_ar: 'تيشيرت الغموض والإثارة مستوحى من مسلسل "Pretty Little Liars". خامة قطن ثقيل فاخر.',
        category_id: '3',
        price: 500,
        sale_price: null,
        is_in_stock: true,
        display_order: 8,
        is_featured: false,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/PRETTY LITTLE LIARS - TV SHOW.jpg']
      },
      {
        id: 'r-simmer',
        slug: 'simmer-gaming-tee',
        name_en: 'Simmer Gaming Graphic Tee',
        name_ar: 'تيشيرت جيمر مطبوع بالكامل',
        description_en: 'Plumbob-inspired creative typography graphic tee for gamers. Soft, durable premium weave.',
        description_ar: 'تيشيرت بتصميم جرافيك رائع مستوحى من عالم الألعاب ومجتمع اللاعبين. خامة ناعمة ومتينة.',
        category_id: '1',
        price: 490,
        sale_price: null,
        is_in_stock: true,
        display_order: 9,
        is_featured: false,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/SIMMER - GAMES.jpg']
      },
      {
        id: 'r-taylor-swift',
        slug: 'taylor-swift-eras-tee',
        name_en: 'Taylor Swift Eras Retro Tee',
        name_ar: 'تيشيرت تايلور سويفت ريترو',
        description_en: 'Retro style vintage collage print dedicated to the Eras of Taylor Swift. Comfort boxy street cut.',
        description_ar: 'تيشيرت تايلور سويفت بتصميم ريترو كلاسيكي رائع. قصة مربعة واسعة ومريحة للغاية.',
        category_id: '6',
        price: 520,
        sale_price: 460,
        is_in_stock: true,
        display_order: 10,
        is_featured: true,
        is_trending: false,
        is_new_arrival: false,
        is_best_seller: true,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/TAYLER SWIFT - SONGS.jpg']
      },
      {
        id: 'r-tb-ya-sydy-4okran',
        slug: 'tb-ya-sydy-4okran-tee',
        name_en: 'Tb Ya Sydy 4okran Nostalgic Tee',
        name_ar: 'تيشيرت طب يا سيدي شكراً الكلاسيكي',
        description_en: 'Nostalgic cinematic quote print from classic comedy movies. Streetwear premium heavyweight cotton.',
        description_ar: 'تيشيرت "طب يا سيدي شكراً" بطبعة مميزة ومضحكة مستوحاة من قفشات السينما الكلاسيكية. قطن ثقيل.',
        category_id: '2',
        price: 480,
        sale_price: null,
        is_in_stock: true,
        display_order: 11,
        is_featured: false,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/TB YA SYDY 4OKRAN - MOVIES.jpg']
      },
      {
        id: 'r-team-damon',
        slug: 'team-damon-salvatore-tee',
        name_en: 'Team Damon Salvatore Streetwear Tee',
        name_ar: 'تيشيرت فريق ديمون سالفاتور',
        description_en: 'Represent the elder Salvatore brother Damon in style with this graphic streetwear piece. Heavyweight drop shoulder.',
        description_ar: 'تيشيرت "فريق ديمون سالفاتور" لعشاق يوميات مصاص دماء. قصة واسعة وأكتاف منسدلة.',
        category_id: '3',
        price: 510,
        sale_price: null,
        is_in_stock: true,
        display_order: 12,
        is_featured: true,
        is_trending: true,
        is_new_arrival: false,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/TEAM DAMON TvD - TV SHOW.jpg']
      },
      {
        id: 'r-team-stefan',
        slug: 'team-stefan-salvatore-tee',
        name_en: 'Team Stefan Salvatore Vintage Tee',
        name_ar: 'تيشيرت فريق ستيفان سالفاتور',
        description_en: 'Show your support for Stefan Salvatore with this vintage faded print. Heavyweight comfy cotton build.',
        description_ar: 'تيشيرت "فريق ستيفان سالفاتور" بطبعة كلاسيكية باهتة ومميزة. قطن ثقيل فاخر ومريح.',
        category_id: '3',
        price: 510,
        sale_price: null,
        is_in_stock: true,
        display_order: 13,
        is_featured: false,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/TEAM STEFAN TvD - TV SHOW.jpg']
      },
      {
        id: 'r-sims4',
        slug: 'the-sims-4-plumbob-tee',
        name_en: 'The Sims 4 Plumbob Status Tee',
        name_ar: 'تيشيرت ذا سيمز ٤ بلومبوب',
        description_en: 'Plumbob status indicator design for gaming enthusiasts. Relaxed premium streetwear fit.',
        description_ar: 'تيشيرت اللعبة الشهيرة ذا سيمز ٤ لشخصيات الجيمينج. قصة مريحة لملابس الشارع العصرية.',
        category_id: '1',
        price: 490,
        sale_price: null,
        is_in_stock: true,
        display_order: 14,
        is_featured: false,
        is_trending: true,
        is_new_arrival: false,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/THE SIMS 4 - GAMES.jpg']
      },
      {
        id: 'r-tvd',
        slug: 'the-vampire-diaries-tee',
        name_en: 'The Vampire Diaries Mystic Falls Tee',
        name_ar: 'تيشيرت يوميات مصاص دماء ميتسيك فولز',
        description_en: 'Mystic Falls class of 2009 nostalgic graphic streetwear design. Heavyweight cotton build.',
        description_ar: 'تيشيرت ميستيك فولز كلاس من مسلسل "The Vampire Diaries". خامة قطنية ثقيلة ومميزة.',
        category_id: '3',
        price: 510,
        sale_price: null,
        is_in_stock: true,
        display_order: 15,
        is_featured: false,
        is_trending: false,
        is_new_arrival: true,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: false,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/TvD - TV SHOW.jpg']
      },
      {
        id: 'r-got-winter',
        slug: 'got-winter-is-coming-sigil-tee',
        name_en: 'GOT Winter is Coming Sigil Tee',
        name_ar: 'تيشيرت صراع العروش الشتاء قادم الكلاسيكي',
        description_en: 'Winter is Coming Stark crest graphic with streetwear distressed lettering. Comfort boxy street fit.',
        description_ar: 'تيشيرت شعار عائلة ستارك "الشتاء قادم" بطبعة عتيقة ومميزة. قصة مربعة واسعة لملابس الشارع.',
        category_id: '3',
        price: 490,
        sale_price: null,
        is_in_stock: true,
        display_order: 16,
        is_featured: true,
        is_trending: true,
        is_new_arrival: false,
        is_best_seller: false,
        is_limited_edition: false,
        is_pinned: true,
        available_sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        material_options: ['Standard Cotton', 'Premium Cotton'],
        images: ['/items/Winter is coming GOT - TV SHOW.jpg']
      }
    ];
    localStorage.setItem(productsKey, JSON.stringify(products));
  }

  if (offers.length === 0) {
    offers = [
      { id: 'o1', title_en: '25% OFF Premium Cotton Material', title_ar: 'خصم 25% على خامة القطن الفاخر', description_en: 'Get 25% off the premium heavy cotton upgrade for your second item.', description_ar: 'احصل على خصم 25% عند الترقية إلى خامة القطن الثقيل الفاخر للقطعة الثانية.', discount_text_en: '25% OFF', discount_text_ar: 'خصم 25%', code: 'PREMIUM25', is_active: true, discount_type: 'percentage', discount_value: 25, coupon_type: 'manual', is_one_time: false, is_public: true },
      { id: 'o2', title_en: 'Refer a Friend — Get 15% OFF', title_ar: 'رشح صديقاً — واحصل على 15% خصم', description_en: 'Tag a friend in our DMs. You both get 15% off your next fandom print.', description_ar: 'منشن صديقاً في رسائلنا. ستحصلان كلاهما على خصم 15% على طباعة الفاندوم التالية.', discount_text_en: '15% OFF', discount_text_ar: 'خصم 15%', code: 'FRIENDS15', is_active: true, discount_type: 'percentage', discount_value: 15, coupon_type: 'manual', is_one_time: false, is_public: true }
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
      announcement: '🔥 SPECIAL ANNOUNCEMENT: Direct Web checkout is now active! Try ordering right here! 🔥',
      auto_applied_offers: [
        { id: 'ao-1', name_en: 'Buy 3 Tee Promo (10% OFF)', name_ar: 'عرض شراء ٣ قطع (خصم ١٠٪)', type: 'quantity', min_quantity: 3, discount_percent: 10, is_active: true },
        { id: 'ao-2', name_en: 'Anime Special (15% OFF)', name_ar: 'عرض الأنمي الخاص (خصم ١٥٪)', type: 'tag', required_tag: 'anime', discount_percent: 15, is_active: true }
      ]
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
// Helper to generate chainable promises mimicking Supabase Client query builders
const makeChainable = (data: any, singleItem: any = null) => {
  const result = { data, error: null };
  const chain: any = {
    data,
    error: null,
    single: () => {
      const item = singleItem || (Array.isArray(data) ? data[0] : data) || null;
      return makeChainable(item, item);
    },
    maybeSingle: () => {
      const item = singleItem || (Array.isArray(data) ? data[0] : data) || null;
      return makeChainable(item, item);
    },
    eq: (field: string, value: any) => {
      if (Array.isArray(data)) {
        const filtered = data.filter((item: any) => item[field] === value);
        return makeChainable(filtered, filtered[0] || null);
      }
      return makeChainable(data, singleItem);
    },
    ilike: (field: string, value: any) => {
      if (Array.isArray(data)) {
        const cleanVal = String(value).toLowerCase().replace(/%/g, '');
        const filtered = data.filter((item: any) => String(item[field]).toLowerCase().includes(cleanVal));
        return makeChainable(filtered, filtered[0] || null);
      }
      return makeChainable(data, singleItem);
    },
    order: (field: string, options?: any) => {
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a: any, b: any) => {
          const aVal = a[field];
          const bVal = b[field];
          const desc = options?.ascending === false;
          if (aVal < bVal) return desc ? 1 : -1;
          if (aVal > bVal) return desc ? -1 : 1;
          return 0;
        });
        return makeChainable(sorted, sorted[0] || null);
      }
      return makeChainable(data, singleItem);
    },
    select: () => makeChainable(data, singleItem),
    then: (onfulfilled: any) => Promise.resolve(result).then(onfulfilled)
  };
  return chain;
};

// Mock Client Interface mimicking Supabase js calls
export const mockSupabase = {
  auth: {
    getUser: async () => {
      if (typeof window === 'undefined') return { data: { user: null } };
      const adminUser = JSON.parse(sessionStorage.getItem('ff_admin_user') || 'null');
      if (adminUser) return { data: { user: adminUser } };
      const regularUser = JSON.parse(sessionStorage.getItem('ff_current_user') || 'null');
      return { data: { user: regularUser } };
    },
    signUp: async ({ email, password, options }: any) => {
      if (typeof window === 'undefined') return { data: null, error: { message: 'Window not defined' } };
      const usersKey = 'ff_mock_users';
      const users = JSON.parse(localStorage.getItem(usersKey) || '[]');
      if (users.find((u: any) => u.email === email)) {
        return { data: null, error: { message: 'User already exists' } };
      }
      const newUser = { id: 'u-' + Math.random().toString(36).substring(7), email };
      users.push({ ...newUser, password });
      localStorage.setItem(usersKey, JSON.stringify(users));

      // Also create a profile
      const profilesKey = 'ff_profiles';
      const dbProfiles = JSON.parse(localStorage.getItem(profilesKey) || '[]');
      const phoneInput = options?.data?.phone || '';
      
      const newProfile = {
        id: newUser.id,
        email: email,
        phone: phoneInput,
        loyalty_points: 0,
        favorites: [],
        referral_code: `REF-${newUser.id.replace('u-', '').toUpperCase()}`,
        address_data: {},
        created_at: new Date().toISOString()
      };
      dbProfiles.push(newProfile);
      localStorage.setItem(profilesKey, JSON.stringify(dbProfiles));

      sessionStorage.setItem('ff_current_user', JSON.stringify(newUser));
      return { data: { user: newUser }, error: null };
    },
    signInWithPassword: async ({ email, password }: any) => {
      if (typeof window === 'undefined') return { data: null, error: { message: 'Window not defined' } };
      if (email === 'admin@fandomfit.com' && password === 'admin123') {
        const user = { id: 'admin-id', email };
        sessionStorage.setItem('ff_admin_user', JSON.stringify(user));
        return { data: { user }, error: null };
      }
      const usersKey = 'ff_mock_users';
      const users = JSON.parse(localStorage.getItem(usersKey) || '[]');
      const found = users.find((u: any) => u.email === email && u.password === password);
      if (found) {
        const user = { id: found.id, email: found.email };
        sessionStorage.setItem('ff_current_user', JSON.stringify(user));
        return { data: { user }, error: null };
      }
      return { data: null, error: { message: 'Invalid credentials' } };
    },
    signInWithOAuth: async ({ provider }: any) => {
      if (typeof window === 'undefined') return { data: null, error: null };
      // mock Google Auth
      const user = { id: 'google-user-id', email: 'google_user@gmail.com' };
      sessionStorage.setItem('ff_current_user', JSON.stringify(user));
      
      // Ensure profile exists
      const profilesKey = 'ff_profiles';
      const dbProfiles = JSON.parse(localStorage.getItem(profilesKey) || '[]');
      if (!dbProfiles.find((p: any) => p.id === user.id)) {
        const newProfile = {
          id: user.id,
          email: user.email,
          phone: '',
          loyalty_points: 0,
          favorites: [],
          referral_code: `REF-GOOGLE`,
          address_data: {},
          created_at: new Date().toISOString()
        };
        dbProfiles.push(newProfile);
        localStorage.setItem(profilesKey, JSON.stringify(dbProfiles));
      }
      return { data: { user }, error: null };
    },
    signOut: async () => {
      sessionStorage.removeItem('ff_admin_user');
      sessionStorage.removeItem('ff_current_user');
      return { error: null };
    }
  },
  from: (table: string) => {
    const db = getMockDb();
    
    // Add default values for profiles if missing
    if (typeof window !== 'undefined') {
      const profilesKey = 'ff_profiles';
      if (!localStorage.getItem(profilesKey)) {
        localStorage.setItem(profilesKey, '[]');
      }
    }

    const getTableData = () => {
      if (typeof window === 'undefined') return [];
      if (table === 'profiles') return JSON.parse(localStorage.getItem('ff_profiles') || '[]');
      if (table === 'categories') return db.categories.sort((a: any, b: any) => a.display_order - b.display_order);
      if (table === 'products') return db.products.sort((a: any, b: any) => a.display_order - b.display_order);
      if (table === 'offers') return db.offers;
      if (table === 'orders') return db.orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      if (table === 'custom_requests') return db.custom_requests.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      if (table === 'settings' || table === 'homepage_sections') {
        return Object.entries(db.settings).map(([key, value]) => ({ key, value }));
      }
      return [];
    };

    return {
      select: (query = '*') => {
        const data = getTableData();
        if (table === 'settings' && query !== '*') {
          return makeChainable({ key: query, value: db.settings }, { key: query, value: db.settings });
        }
        return makeChainable(data);
      },
      insert: (rows: any[]) => {
        const rowsArray = Array.isArray(rows) ? rows : [rows];
        const data = getTableData();
        let newRows = [];

        if (table === 'profiles') {
          newRows = rowsArray.map(r => ({
            id: r.id || 'u-' + Math.random().toString(36).substring(7),
            loyalty_points: r.loyalty_points || 0,
            favorites: r.favorites || [],
            address_data: r.address_data || {},
            created_at: new Date().toISOString(),
            ...r
          }));
          const updated = [...data, ...newRows];
          saveMockDb('ff_profiles', updated);
        } else if (table === 'custom_requests') {
          newRows = rowsArray.map(r => ({
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            status: 'pending',
            reference_images: [],
            ...r
          }));
          const updated = [...data, ...newRows];
          saveMockDb('ff_custom_requests', updated);
        } else if (table === 'products') {
          newRows = rowsArray.map(r => ({
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            images: r.images || ['/placeholders/arcade_front.jpg'],
            ...r
          }));
          const updated = [...data, ...newRows];
          saveMockDb('ff_products_v3', updated);
        } else if (table === 'categories') {
          newRows = rowsArray.map(r => ({
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            show_in_browse: r.show_in_browse !== false,
            ...r
          }));
          const updated = [...data, ...newRows];
          saveMockDb('ff_categories', updated);
        } else if (table === 'offers') {
          newRows = rowsArray.map(r => ({
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            ...r
          }));
          const updated = [...data, ...newRows];
          saveMockDb('ff_offers', updated);
        } else if (table === 'orders') {
          newRows = rowsArray.map(r => ({
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            status: 'pending',
            ...r
          }));
          const updated = [...data, ...newRows];
          saveMockDb('ff_orders', updated);
        } else {
          newRows = rowsArray;
        }

        return makeChainable(newRows, newRows[0]);
      },
      update: (values: any) => {
        return {
          eq: (field: string, idVal: any) => {
            const data = getTableData();
            let updatedData = [];

            if (table === 'settings') {
              const updatedSettings = { ...db.settings, ...values };
              saveMockDb('ff_settings', updatedSettings);
              return makeChainable(updatedSettings, updatedSettings);
            }

            const mockDbKeys: Record<string, string> = {
              profiles: 'ff_profiles',
              products: 'ff_products_v3',
              categories: 'ff_categories',
              offers: 'ff_offers',
              custom_requests: 'ff_custom_requests',
              orders: 'ff_orders'
            };

            const dbKey = mockDbKeys[table];
            if (dbKey) {
              updatedData = data.map((item: any) => item[field] === idVal ? { ...item, ...values } : item);
              saveMockDb(dbKey, updatedData);
            }

            const affected = updatedData.filter((item: any) => item[field] === idVal);
            return makeChainable(affected, affected[0]);
          }
        };
      },
      delete: () => {
        return {
          eq: (field: string, idVal: any) => {
            const data = getTableData();

            const mockDbKeys: Record<string, string> = {
              products: 'ff_products_v3',
              categories: 'ff_categories',
              offers: 'ff_offers',
              orders: 'ff_orders'
            };

            const dbKey = mockDbKeys[table];
            if (dbKey) {
              const filtered = data.filter((item: any) => item[field] !== idVal);
              saveMockDb(dbKey, filtered);
            }
            return makeChainable([]);
          }
        };
      }
    };
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        const mockUrl = URL.createObjectURL(file);
        return { data: { path: mockUrl }, error: null };
      },
      getPublicUrl: (path: string) => {
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
