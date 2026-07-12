'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import supabase, { isUsingMock } from '@/lib/supabase';
import { 
  LayoutDashboard, ShoppingBag, FolderOpen, Ticket, Palette, Settings, 
  LogOut, Plus, Edit, Trash2, Copy, Eye, ToggleLeft, ToggleRight, Check, Save, X, ShoppingCart, Tag
} from 'lucide-react';
import Image from 'next/image';

export default function AdminPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  
  // Zustand Store
  const { 
    products, categories, offers, settings, customRequests, orders, announcement,
    discountCampaigns, addDiscountCampaign, updateDiscountCampaign, deleteDiscountCampaign,
    fetchInitialData, addProduct, updateProduct, deleteProduct,
    addCategory, updateCategory, deleteCategory,
    addOffer, updateOffer, deleteOffer,
    fetchAdminRequests, updateRequestStatus, saveSettings,
    fetchOrders, completeOrder, updateAnnouncement, updateAnnouncementAr
  } = useStore();

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Tab State: 'dashboard' | 'products' | 'categories' | 'requests' | 'offers' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal / Editing states
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields State
  const [prodForm, setProdForm] = useState({
    name_en: '', name_ar: '', description_en: '', description_ar: '',
    category_id: '', price: 0, sale_price: '' as string | number,
    is_in_stock: true, is_featured: false, is_trending: false,
    is_new_arrival: false, is_best_seller: false, is_limited_edition: false,
    is_pinned: false,
    gives_cotton_reward: false,
    available_sizes: ['S', 'M', 'L', 'XL'], material_options: ['Standard Cotton', 'Premium Cotton'],
    images: [] as string[], display_order: 0
  });

  const [catForm, setCatForm] = useState({
    name_en: '', name_ar: '', slug: '', display_order: 0, is_hidden: false
  });

  const [offerForm, setOfferForm] = useState({
    title_en: '', title_ar: '', description_en: '', description_ar: '',
    discount_text_en: '', discount_text_ar: '', code: '', is_active: true,
    discount_percent: 10, max_uses: '' as string | number, max_uses_per_user: '' as string | number,
    show_on_homepage: false,
    discount_type: 'percentage',
    discount_value: 0,
    coupon_type: 'manual',
    min_order_amount: 0,
    is_one_time: false,
    is_public: true,
    expires_at: ''
  });

  const [campaignForm, setCampaignForm] = useState({
    name: '', discount_percent: 10, category_id: '', is_active: true
  });

  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [settingsForm, setSettingsForm] = useState({
    brand_name: '', tagline: '', instagram_url: '', tiktok_url: '', facebook_url: '',
    seo_title: '', seo_desc: '', shipping_info_en: '', shipping_info_ar: '',
    announcement: '',
    announcement_ar: '',
    fabric_premium_premium: 50,
    fabric_premium_heavy: 100,
    fabric_premium_oversized: 150,
    cotton_reward_system_enabled: true,
    referral_reward_system_enabled: true
  });

  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Sizing & Fabric dynamic options states
  const [sizeOptions, setSizeOptions] = useState(['S', 'M', 'L', 'XL', 'XXL', '3XL']);
  const [fabricOptions, setFabricOptions] = useState(['Standard Cotton', 'Premium Cotton', 'Heavy Cotton', 'Over-sized Heavy']);
  const [newCustomSize, setNewCustomSize] = useState('');
  const [newCustomFabric, setNewCustomFabric] = useState('');
  const [tagsText, setTagsText] = useState('');

  useEffect(() => {
    if (prodForm.available_sizes) {
      prodForm.available_sizes.forEach(size => {
        if (size && !sizeOptions.includes(size)) {
          setSizeOptions(prev => [...prev, size]);
        }
      });
    }
    if (prodForm.material_options) {
      prodForm.material_options.forEach(fabric => {
        if (fabric && !fabricOptions.includes(fabric)) {
          setFabricOptions(prev => [...prev, fabric]);
        }
      });
    }
  }, [prodForm.available_sizes, prodForm.material_options]);

  // Load Initial Data
  useEffect(() => {
    fetchInitialData();
    checkSession();
  }, [fetchInitialData]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminRequests();
      fetchOrders();
      // populate settings form once loaded
      const premiums = settings.fabric_premiums || {};
      setSettingsForm({
        brand_name: settings.brand_name || 'Fandom Fit',
        tagline: settings.tagline || 'Wear What You Love.',
        instagram_url: settings.instagram_url || '',
        tiktok_url: settings.tiktok_url || '',
        facebook_url: settings.facebook_url || '',
        seo_title: settings.seo_title || '',
        seo_desc: settings.seo_desc || '',
        shipping_info_en: settings.shipping_info_en || '',
        shipping_info_ar: settings.shipping_info_ar || '',
        announcement: settings.announcement || '',
        announcement_ar: settings.announcement_ar || '',
        fabric_premium_premium: Number(premiums.premium ?? 50),
        fabric_premium_heavy: Number(premiums.heavy ?? 100),
        fabric_premium_oversized: Number(premiums.oversized ?? 150),
        cotton_reward_system_enabled: settings.cotton_reward_system_enabled !== false,
        referral_reward_system_enabled: settings.referral_reward_system_enabled !== false
      });
    }
  }, [isAuthenticated, settings]);

  const checkSession = async () => {
    setAuthLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setIsAuthenticated(true);
    }
    setAuthLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
    } else {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  // CRUD handlers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate URL-friendly slug from English name
    const slug = prodForm.name_en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const finalProduct = {
      ...prodForm,
      slug,
      price: Number(prodForm.price),
      sale_price: prodForm.sale_price ? Number(prodForm.sale_price) : null,
      display_order: Number(prodForm.display_order),
      tags: tagsText.split(',').map(t => t.trim()).filter(t => t !== '')
    };

    if (editingItem) {
      await updateProduct(editingItem.id, finalProduct);
    } else {
      await addProduct(finalProduct);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = {
      ...catForm,
      display_order: Number(catForm.display_order)
    };

    if (editingItem) {
      await updateCategory(editingItem.id, finalCategory);
    } else {
      await addCategory(finalCategory);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalOffer = {
      ...offerForm,
      discount_percent: Number(offerForm.discount_percent),
      max_uses: offerForm.max_uses ? Number(offerForm.max_uses) : null,
      max_uses_per_user: offerForm.max_uses_per_user ? Number(offerForm.max_uses_per_user) : null,
      show_on_homepage: !!offerForm.show_on_homepage,
      discount_value: Number(offerForm.discount_value || 0),
      min_order_amount: Number(offerForm.min_order_amount || 0),
      is_one_time: !!offerForm.is_one_time,
      is_public: !!offerForm.is_public,
      discount_type: offerForm.discount_type as 'percentage' | 'fixed',
      coupon_type: offerForm.coupon_type as 'manual' | 'cotton_reward' | 'referral_reward' | 'referral_reward_thank_you',
      expires_at: offerForm.expires_at ? new Date(offerForm.expires_at).toISOString() : null
    };

    if (editingItem) {
      await updateOffer(editingItem.id, finalOffer);
    } else {
      await addOffer(finalOffer);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCampaign = {
      ...campaignForm,
      discount_percent: Number(campaignForm.discount_percent),
      category_id: campaignForm.category_id || null
    };

    if (editingItem) {
      await updateDiscountCampaign(editingItem.id, finalCampaign);
    } else {
      await addDiscountCampaign(finalCampaign);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(settingsForm);
    if (settingsForm.announcement !== undefined) {
      await updateAnnouncement(settingsForm.announcement);
    }
    if (settingsForm.announcement_ar !== undefined) {
      await updateAnnouncementAr(settingsForm.announcement_ar);
    }
    alert(t('settings.save_success'));
  };

  // File Upload Handlers (simulated local storage files in mock mode, or supabase upload)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);

    // Attempt to automatically create the bucket to avoid "bucket not found" error
    if (!isUsingMock) {
      try {
        await supabase.storage.createBucket('products', { public: true });
      } catch (err) {
        // Ignore (bucket likely already exists)
      }
    }

    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      if (isUsingMock) {
        // Mock File: create dynamic object URL
        const mockUrl = URL.createObjectURL(file);
        uploadedUrls.push(mockUrl);
      } else {
        // Real File Upload to Supabase bucket 'products'
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { data, error } = await supabase.storage.from('products').upload(fileName, file);
        if (error) {
          console.error('File upload error:', error);
          alert(`File upload failed for ${file.name}: ${error.message}`);
        } else if (data) {
          const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);
          uploadedUrls.push(publicUrl);
        }
      }
    }

    if (uploadedUrls.length > 0) {
      setProdForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-mono">
        <span className="animate-spin text-xl mr-2">⚙️</span> LOADING PORTAL...
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-mono select-none">
        <div className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-2xl max-w-sm w-full shadow-2xl">
          <div className="text-center mb-6">
            <span className="font-handwriting text-4xl text-brand-accent block transform rotate-[-2deg]">Fandom Fit</span>
            <h1 className="text-sm font-black tracking-widest text-zinc-500 uppercase mt-2">{t('login_title')}</h1>
            <p className="text-[10px] text-zinc-500 mt-1">{t('login_subtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-1">{t('email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fandomfit.com"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-1">{t('password')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-950 border border-red-800 rounded text-red-400 text-[10px] leading-relaxed">
                ⚠️ {authError}
              </div>
            )}

            {isUsingMock && (
              <div className="p-2.5 bg-blue-950/40 border border-blue-900/60 rounded text-blue-300 text-[10px] leading-relaxed">
                ℹ️ Sandbox Mode active. <br /> Use <b>admin@fandomfit.com</b> / <b>admin123</b> to log in.
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-xs tracking-wider transition-colors cursor-pointer"
            >
              {t('login_btn')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // MAIN ADMIN INTERFACE
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row dark select-none">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between shrink-0 p-4">
        
        {/* Top block */}
        <div>
          <div className="flex items-center gap-2 px-3 py-4 border-b border-zinc-800 mb-6">
            <span className="font-handwriting text-3xl text-brand-accent rotate-[-2deg]">Fandom Fit</span>
            <span className="text-[9px] font-black bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded uppercase border border-zinc-700">CMS</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Tabs */}
            {[
              { id: 'dashboard', name: t('sidebar.dashboard'), icon: <LayoutDashboard size={16} /> },
              { id: 'products', name: t('sidebar.products'), icon: <ShoppingBag size={16} /> },
              { id: 'categories', name: t('sidebar.categories'), icon: <FolderOpen size={16} /> },
              { id: 'offers', name: t('sidebar.offers'), icon: <Ticket size={16} /> },
              { id: 'discounts', name: locale === 'ar' ? 'حملات الخصم' : 'Discounts', icon: <Tag size={16} /> },
              { id: 'requests', name: t('sidebar.custom_requests'), icon: <Palette size={16} /> },
              { id: 'orders', name: locale === 'ar' ? 'الطلبات' : 'Orders', icon: <ShoppingCart size={16} /> },
              { id: 'settings', name: t('sidebar.settings'), icon: <Settings size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsFormOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-zinc-800 text-brand-accent border-l-3 border-brand-accent' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 mt-6 border-t border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
        >
          <LogOut size={16} />
          {t('logout_btn')}
        </button>

      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        
        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black uppercase text-white">{t('sidebar.dashboard')}</h2>
            
            {/* Stats list */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">{t('dashboard.total_products')}</span>
                <span className="text-3xl font-black text-white mt-1 block">{products.length}</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">{t('dashboard.total_categories')}</span>
                <span className="text-3xl font-black text-white mt-1 block">{categories.length}</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">{locale === 'ar' ? 'إجمالي الأرباح' : 'Total Revenue'}</span>
                <span className="text-3xl font-black text-green-500 mt-1 block">
                  {orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.price), 0)} EGP
                </span>
              </div>
              <div 
                onClick={() => { setActiveTab('orders'); setOrderStatusFilter('pending'); }}
                className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm cursor-pointer hover:bg-zinc-800/85 transition-colors"
              >
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">{locale === 'ar' ? 'الطلبات المعلقة' : 'Pending Orders'}</span>
                <span className="text-3xl font-black text-amber-500 mt-1 block">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">{t('dashboard.custom_requests')}</span>
                <span className="text-3xl font-black text-white mt-1 block">{customRequests.length}</span>
              </div>
            </div>

            {/* Recent items showcase */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <h3 className="text-sm font-black uppercase text-zinc-400 mb-4">{t('dashboard.recent_products')}</h3>
              
              {products.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {products.slice(0, 4).map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 border border-zinc-800 rounded bg-zinc-950 overflow-hidden shrink-0">
                          <Image 
                            src={p.images?.[0] || '/placeholders/arcade_front.jpg'} 
                            alt={p.name_en} 
                            fill 
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-white">{p.name_en}</span>
                          <span className="text-[10px] text-zinc-500 font-semibold">{categories.find(c => c.id === p.category_id)?.name_en || 'Uncategorized'}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-zinc-300">{p.price} EGP</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-zinc-500">{t('dashboard.no_recent')}</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase text-white">{t('sidebar.products')}</h2>
              
              {!isFormOpen && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setTagsText('');
                    setProdForm({
                      name_en: '', name_ar: '', description_en: '', description_ar: '',
                      category_id: categories[0]?.id || '', price: 0, sale_price: '',
                      is_in_stock: true, is_featured: false, is_trending: false,
                      is_new_arrival: true, is_best_seller: false, is_limited_edition: false,
                      is_pinned: false,
                      gives_cotton_reward: false,
                      available_sizes: ['S', 'M', 'L', 'XL'], material_options: ['Standard Cotton', 'Premium Cotton'],
                      images: [], display_order: 0
                    });
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-xs cursor-pointer"
                >
                  <Plus size={14} />
                  {t('products.add_new')}
                </button>
              )}
            </div>

            {isFormOpen ? (
              /* Add/Edit product form */
              <form onSubmit={handleSaveProduct} className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-2xl space-y-4 max-w-2xl">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    {editingItem ? 'Edit Product Details' : 'Add New Fandom Shirt'}
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => { setIsFormOpen(false); setEditingItem(null); }}
                    className="text-xs uppercase font-extrabold text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('products.fields.name_en')}</label>
                    <input
                      type="text" required
                      value={prodForm.name_en}
                      onChange={(e) => setProdForm({ ...prodForm, name_en: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('products.fields.name_ar')}</label>
                    <input
                      type="text" required
                      value={prodForm.name_ar}
                      onChange={(e) => setProdForm({ ...prodForm, name_ar: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('products.fields.desc_en')}</label>
                    <textarea
                      rows={2}
                      value={prodForm.description_en}
                      onChange={(e) => setProdForm({ ...prodForm, description_en: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('products.fields.desc_ar')}</label>
                    <textarea
                      rows={2}
                      value={prodForm.description_ar}
                      onChange={(e) => setProdForm({ ...prodForm, description_ar: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('products.fields.price')}</label>
                    <input
                      type="number" required
                      value={prodForm.price}
                      onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('products.fields.sale_price')}</label>
                    <input
                      type="number"
                      value={prodForm.sale_price}
                      onChange={(e) => setProdForm({ ...prodForm, sale_price: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('products.fields.category')}</label>
                    <select
                      value={prodForm.category_id}
                      onChange={(e) => setProdForm({ ...prodForm, category_id: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name_en}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sizes Selection Menu */}
                  <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-3">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block border-b border-zinc-900 pb-1.5">
                      Available Sizes Menu
                    </label>
                    
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((size) => {
                        const isChecked = prodForm.available_sizes.includes(size);
                        return (
                          <button
                            type="button"
                            key={size}
                            onClick={() => {
                              const updated = isChecked
                                ? prodForm.available_sizes.filter(s => s !== size)
                                : [...prodForm.available_sizes, size];
                              setProdForm({ ...prodForm, available_sizes: updated });
                            }}
                            className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-brand-accent text-white border-brand-accent shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Custom Size Field */}
                    <div className="flex gap-2 pt-1.5 border-t border-zinc-900">
                      <input
                        type="text"
                        placeholder="Add size (e.g. XS)"
                        value={newCustomSize}
                        onChange={(e) => setNewCustomSize(e.target.value.trim().toUpperCase())}
                        className="flex-grow px-2.5 py-1 bg-zinc-900 border border-zinc-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCustomSize && !sizeOptions.includes(newCustomSize)) {
                            setSizeOptions(prev => [...prev, newCustomSize]);
                            setProdForm({ 
                              ...prodForm, 
                              available_sizes: [...prodForm.available_sizes, newCustomSize] 
                            });
                            setNewCustomSize('');
                          }
                        }}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] uppercase font-black transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Fabrics Selection Menu */}
                  <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-3">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block border-b border-zinc-900 pb-1.5">
                      Fabrics & Materials Menu
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {fabricOptions.map((fabric) => {
                        const isChecked = prodForm.material_options.includes(fabric);
                        return (
                          <button
                            type="button"
                            key={fabric}
                            onClick={() => {
                              const updated = isChecked
                                ? prodForm.material_options.filter(f => f !== fabric)
                                : [...prodForm.material_options, fabric];
                              setProdForm({ ...prodForm, material_options: updated });
                            }}
                            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-brand-accent text-white border-brand-accent shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                            }`}
                          >
                            {fabric}
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Custom Fabric Field */}
                    <div className="flex gap-2 pt-1.5 border-t border-zinc-900">
                      <input
                        type="text"
                        placeholder="Add fabric (e.g. Heavy Blend)"
                        value={newCustomFabric}
                        onChange={(e) => setNewCustomFabric(e.target.value)}
                        className="flex-grow px-2.5 py-1 bg-zinc-900 border border-zinc-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCustomFabric && !fabricOptions.includes(newCustomFabric)) {
                            setFabricOptions(prev => [...prev, newCustomFabric]);
                            setProdForm({ 
                              ...prodForm, 
                              material_options: [...prodForm.material_options, newCustomFabric] 
                            });
                            setNewCustomFabric('');
                          }
                        }}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] uppercase font-black transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tag Checks */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                    <input 
                      type="checkbox" 
                      checked={prodForm.is_in_stock}
                      onChange={(e) => setProdForm({ ...prodForm, is_in_stock: e.target.checked })}
                      className="accent-brand-accent" 
                    />
                    {t('products.fields.in_stock')}
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                    <input 
                      type="checkbox" 
                      checked={prodForm.is_featured}
                      onChange={(e) => setProdForm({ ...prodForm, is_featured: e.target.checked })}
                      className="accent-brand-accent" 
                    />
                    {t('products.fields.featured')}
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                    <input 
                      type="checkbox" 
                      checked={prodForm.is_trending}
                      onChange={(e) => setProdForm({ ...prodForm, is_trending: e.target.checked })}
                      className="accent-brand-accent" 
                    />
                    {t('products.fields.trending')}
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                    <input 
                      type="checkbox" 
                      checked={prodForm.is_new_arrival}
                      onChange={(e) => setProdForm({ ...prodForm, is_new_arrival: e.target.checked })}
                      className="accent-brand-accent" 
                    />
                    {t('products.fields.new_arrival')}
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                    <input 
                      type="checkbox" 
                      checked={prodForm.is_best_seller}
                      onChange={(e) => setProdForm({ ...prodForm, is_best_seller: e.target.checked })}
                      className="accent-brand-accent" 
                    />
                    {t('products.fields.best_seller')}
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                    <input 
                      type="checkbox" 
                      checked={prodForm.is_pinned || false}
                      onChange={(e) => setProdForm({ ...prodForm, is_pinned: e.target.checked })}
                      className="accent-brand-accent" 
                    />
                    📌 {locale === 'ar' ? 'تثبيت المنتج' : 'Pin Drop'}
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-[#E07A5F]">
                    <input 
                      type="checkbox" 
                      checked={prodForm.gives_cotton_reward || false}
                      onChange={(e) => setProdForm({ ...prodForm, gives_cotton_reward: e.target.checked })}
                      className="accent-[#E07A5F]" 
                    />
                    🧶 {locale === 'ar' ? 'يعطي مكافأة قطن' : 'Gives Cotton Reward'}
                  </label>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Custom Tags (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Vintage, Oversized, Special Edition"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent placeholder-zinc-600"
                  />
                </div>

                {/* Images Upload Mock */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('products.fields.images')}</label>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {prodForm.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 border border-zinc-800 rounded bg-zinc-950 overflow-hidden">
                        <Image src={img} alt="upload-preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setProdForm({ ...prodForm, images: prodForm.images.filter((_, i) => i !== idx) })}
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    
                    <label className="w-16 h-16 border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded bg-zinc-950 flex flex-col items-center justify-center cursor-pointer text-zinc-500">
                      <Plus size={16} />
                      <span className="text-[8px] mt-1 font-bold">Upload</span>
                      <input 
                        type="file" 
                        multiple
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-xs cursor-pointer"
                  >
                    Save Drop
                  </button>
                </div>

              </form>
            ) : (
              /* Products List */
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px] text-left font-mono">
                  <thead className="bg-zinc-800 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="p-4">{locale === 'ar' ? 'المنتج' : 'Product'}</th>
                      <th className="p-4">{locale === 'ar' ? 'القسم' : 'Category'}</th>
                      <th className="p-4">{locale === 'ar' ? 'السعر' : 'Price'}</th>
                      <th className="p-4">{locale === 'ar' ? 'حالة المخزن' : 'Stock'}</th>
                      <th className="p-4 text-right">{locale === 'ar' ? 'خيارات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-xs">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-800/20 text-zinc-300">
                        <td className="p-4 font-bold flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded border border-zinc-800 bg-zinc-950 overflow-hidden shrink-0">
                            <Image 
                              src={p.images?.[0] || '/placeholders/arcade_front.jpg'} 
                              alt={p.name_en} 
                              fill 
                              className="object-cover"
                            />
                          </div>
                          {p.name_en}
                          {p.gives_cotton_reward && (
                            <span className="ml-2 px-1.5 py-0.5 bg-[#E07A5F]/20 text-[#E07A5F] border border-[#E07A5F]/40 rounded text-[9px] font-black uppercase tracking-wide shrink-0">
                              🧶 Cotton
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {categories.find(c => c.id === p.category_id)?.name_en || 'Uncategorized'}
                        </td>
                        <td className="p-4">
                          {p.price} EGP
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            p.is_in_stock 
                              ? 'bg-green-950/50 text-green-400 border border-green-900' 
                              : 'bg-red-950/50 text-red-400 border border-red-900'
                          }`}>
                            {p.is_in_stock ? t('products.fields.in_stock') : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(p);
                              setTagsText((p.tags || []).join(', '));
                              setProdForm({ ...p, sale_price: p.sale_price || '', is_pinned: p.is_pinned || false, gives_cotton_reward: p.gives_cotton_reward || false });
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 hover:bg-red-950/30 rounded text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        )}

        {/* TAB 3: CATEGORIES CRUD */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase text-white">{t('sidebar.categories')}</h2>
              
              {!isFormOpen && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setCatForm({
                      name_en: '', name_ar: '', slug: '', display_order: categories.length + 1, is_hidden: false
                    });
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-xs cursor-pointer"
                >
                  <Plus size={14} />
                  {t('categories.add_new')}
                </button>
              )}
            </div>

            {isFormOpen ? (
              <form onSubmit={handleSaveCategory} className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-2xl space-y-4 max-w-md">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    {editingItem ? 'Edit Category' : 'Create New Collection'}
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => { setIsFormOpen(false); setEditingItem(null); }}
                    className="text-xs uppercase font-extrabold text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('categories.name_en')}</label>
                  <input
                    type="text" required
                    value={catForm.name_en}
                    onChange={(e) => setCatForm({ ...catForm, name_en: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('categories.name_ar')}</label>
                  <input
                    type="text" required
                    value={catForm.name_ar}
                    onChange={(e) => setCatForm({ ...catForm, name_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('categories.slug')}</label>
                  <input
                    type="text" required
                    value={catForm.slug}
                    onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('categories.display_order')}</label>
                    <input
                      type="number"
                      value={catForm.display_order}
                      onChange={(e) => setCatForm({ ...catForm, display_order: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                      <input 
                        type="checkbox" 
                        checked={catForm.is_hidden}
                        onChange={(e) => setCatForm({ ...catForm, is_hidden: e.target.checked })}
                        className="accent-brand-accent" 
                      />
                      {t('categories.is_hidden')}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-xs cursor-pointer"
                >
                  Save Category
                </button>

              </form>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm max-w-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[550px] text-left font-mono">
                  <thead className="bg-zinc-800 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="p-4">{locale === 'ar' ? 'الاسم بالإنكليزية' : 'Name (EN)'}</th>
                      <th className="p-4">{locale === 'ar' ? 'الاسم بالعربية' : 'Name (AR)'}</th>
                      <th className="p-4">{locale === 'ar' ? 'الترتيب' : 'Order'}</th>
                      <th className="p-4 text-right">{locale === 'ar' ? 'خيارات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-xs">
                    {categories.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-800/20 text-zinc-300">
                        <td className="p-4 font-bold text-white">{c.name_en}</td>
                        <td className="p-4">{c.name_ar}</td>
                        <td className="p-4">{c.display_order}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(c);
                              setCatForm(c);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(c.id)}
                            className="p-1.5 hover:bg-red-950/30 rounded text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        )}

        {/* TAB 4: OFFERS CRUD */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase text-white">{t('sidebar.offers')}</h2>
              
              {!isFormOpen && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setOfferForm({
                      title_en: '', title_ar: '', description_en: '', description_ar: '',
                      discount_text_en: '10% OFF', discount_text_ar: 'خصم ١٠٪', code: '', is_active: true,
                      discount_percent: 10, max_uses: '', max_uses_per_user: '',
                      show_on_homepage: false,
                      discount_type: 'percentage',
                      discount_value: 0,
                      coupon_type: 'manual',
                      min_order_amount: 0,
                      is_one_time: false,
                      is_public: true,
                      expires_at: ''
                    });
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-xs cursor-pointer"
                >
                  <Plus size={14} />
                  {t('offers.add_new') || 'Add Coupon'}
                </button>
              )}
            </div>

            {isFormOpen ? (
              <form onSubmit={handleSaveOffer} className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-2xl space-y-4 max-w-md">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    {editingItem ? 'Edit Promo Ticket' : 'Create Promo Ticket'}
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => { setIsFormOpen(false); setEditingItem(null); }}
                    className="text-xs uppercase font-extrabold text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Coupon Code</label>
                  <input
                    type="text" required placeholder="e.g. SUMMER25"
                    value={offerForm.code}
                    onChange={(e) => setOfferForm({ ...offerForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Discount Tag (EN)</label>
                    <input
                      type="text" required placeholder="e.g. 25% OFF"
                      value={offerForm.discount_text_en}
                      onChange={(e) => setOfferForm({ ...offerForm, discount_text_en: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Discount Tag (AR)</label>
                    <input
                      type="text" required placeholder="e.g. خصم ٢٥٪"
                      value={offerForm.discount_text_ar}
                      onChange={(e) => setOfferForm({ ...offerForm, discount_text_ar: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Offer Title (EN)</label>
                  <input
                    type="text" required
                    value={offerForm.title_en}
                    onChange={(e) => setOfferForm({ ...offerForm, title_en: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Offer Title (AR)</label>
                  <input
                    type="text" required
                    value={offerForm.title_ar}
                    onChange={(e) => setOfferForm({ ...offerForm, title_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Discount %</label>
                    <input
                      type="number" required min={1} max={100}
                      value={offerForm.discount_percent}
                      onChange={(e) => setOfferForm({ ...offerForm, discount_percent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Max Total Uses</label>
                    <input
                      type="number" placeholder="Unlimited"
                      value={offerForm.max_uses}
                      onChange={(e) => setOfferForm({ ...offerForm, max_uses: e.target.value ? Number(e.target.value) : '' })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Max per User</label>
                    <input
                      type="number" placeholder="Unlimited"
                      value={offerForm.max_uses_per_user}
                      onChange={(e) => setOfferForm({ ...offerForm, max_uses_per_user: e.target.value ? Number(e.target.value) : '' })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Coupon Type</label>
                    <select
                      value={offerForm.coupon_type}
                      onChange={(e) => setOfferForm({ ...offerForm, coupon_type: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    >
                      <option value="manual">Manual / Public Code</option>
                      <option value="cotton_reward">Cotton Purchase Reward</option>
                      <option value="referral_reward">Referral Trigger Code</option>
                      <option value="referral_reward_thank_you">Referral Thank You Reward</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Discount Type</label>
                    <select
                      value={offerForm.discount_type}
                      onChange={(e) => setOfferForm({ ...offerForm, discount_type: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Value (EGP)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Discount Value</label>
                    <input
                      type="number" required min={0}
                      value={offerForm.discount_value}
                      onChange={(e) => setOfferForm({ ...offerForm, discount_value: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Min Order (EGP)</label>
                    <input
                      type="number" min={0}
                      value={offerForm.min_order_amount}
                      onChange={(e) => setOfferForm({ ...offerForm, min_order_amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={offerForm.expires_at}
                      onChange={(e) => setOfferForm({ ...offerForm, expires_at: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none text-zinc-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-1">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="is_one_time"
                      checked={offerForm.is_one_time}
                      onChange={(e) => setOfferForm({ ...offerForm, is_one_time: e.target.checked })}
                      className="accent-brand-accent" 
                    />
                    <label htmlFor="is_one_time" className="text-xs font-bold text-zinc-300 select-none">One-time Use Only</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="is_public"
                      checked={offerForm.is_public}
                      onChange={(e) => setOfferForm({ ...offerForm, is_public: e.target.checked })}
                      className="accent-brand-accent" 
                    />
                    <label htmlFor="is_public" className="text-xs font-bold text-zinc-300 select-none">Is Public Code</label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={offerForm.is_active}
                    onChange={(e) => setOfferForm({ ...offerForm, is_active: e.target.checked })}
                    className="accent-brand-accent" 
                  />
                  <label className="text-xs font-bold text-zinc-300">Active Offer</label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={offerForm.show_on_homepage}
                    onChange={(e) => setOfferForm({ ...offerForm, show_on_homepage: e.target.checked })}
                    className="accent-brand-accent" 
                  />
                  <label className="text-xs font-bold text-zinc-300">Show in Homepage (Fandom Loot)</label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-xs cursor-pointer"
                >
                  Save Offer
                </button>

              </form>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm max-w-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left font-mono">
                  <thead className="bg-zinc-800 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="p-4">Code</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Bound Phone</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-xs">
                    {offers.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-800/20 text-zinc-300">
                        <td className="p-4 font-bold text-white">{o.code}</td>
                        <td className="p-4 font-semibold text-brand-accent">
                          {o.discount_type === 'fixed' ? `${o.discount_value} EGP` : `${o.discount_percent}%`}
                        </td>
                        <td className="p-4 capitalize text-[10px] text-zinc-400 font-bold">
                          {o.coupon_type ? o.coupon_type.replace(/_/g, ' ') : 'manual'}
                        </td>
                        <td className="p-4 text-[10px] font-bold text-zinc-300">
                          {o.bound_phone || <span className="text-zinc-600">-</span>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            o.is_active 
                              ? 'bg-green-950/50 text-green-400 border border-green-900' 
                              : 'bg-red-950/50 text-red-400 border border-red-900'
                          }`}>
                            {o.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(o);
                              setOfferForm({
                                ...o,
                                discount_percent: o.discount_percent || 10,
                                max_uses: o.max_uses ?? '',
                                max_uses_per_user: o.max_uses_per_user ?? '',
                                show_on_homepage: o.show_on_homepage ?? false,
                                discount_type: o.discount_type || 'percentage',
                                discount_value: o.discount_value ?? 0,
                                coupon_type: o.coupon_type || 'manual',
                                min_order_amount: o.min_order_amount ?? 0,
                                is_one_time: o.is_one_time ?? false,
                                is_public: o.is_public ?? true,
                                expires_at: o.expires_at ? new Date(o.expires_at).toISOString().split('T')[0] : ''
                              });
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(o.id)}
                            className="p-1.5 hover:bg-red-950/30 rounded text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        )}

        {/* TAB 4.5: DISCOUNT CAMPAIGNS CRUD */}
        {activeTab === 'discounts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase text-white">{locale === 'ar' ? 'حملات الخصم' : 'Discount Campaigns'}</h2>
              
              {!isFormOpen && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setCampaignForm({
                      name: '', discount_percent: 10, category_id: '', is_active: true
                    });
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-xs cursor-pointer"
                >
                  <Plus size={14} />
                  {t('discounts.add_new') || 'Add Campaign'}
                </button>
              )}
            </div>

            {isFormOpen ? (
              <form onSubmit={handleSaveCampaign} className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-2xl space-y-4 max-w-md">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    {editingItem ? (locale === 'ar' ? 'تعديل حملة الخصم' : 'Edit Discount Campaign') : (locale === 'ar' ? 'إنشاء حملة خصم جديدة' : 'Create Discount Campaign')}
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => { setIsFormOpen(false); setEditingItem(null); }}
                    className="text-xs uppercase font-extrabold text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Campaign Name</label>
                  <input
                    type="text" required placeholder="e.g. Summer Special 15%"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Discount %</label>
                    <input
                      type="number" required min={1} max={100}
                      value={campaignForm.discount_percent}
                      onChange={(e) => setCampaignForm({ ...campaignForm, discount_percent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Target Category</label>
                    <select
                      value={campaignForm.category_id}
                      onChange={(e) => setCampaignForm({ ...campaignForm, category_id: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                    >
                      <option value="">{locale === 'ar' ? 'كل المنتجات (عام)' : 'All Items (Global)'}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name_en}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={campaignForm.is_active}
                    onChange={(e) => setCampaignForm({ ...campaignForm, is_active: e.target.checked })}
                    className="accent-brand-accent" 
                  />
                  <label className="text-xs font-bold text-zinc-300">Active Campaign</label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-xs cursor-pointer"
                >
                  Save Campaign
                </button>
              </form>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm max-w-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[550px] text-left font-mono">
                    <thead className="bg-zinc-800 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Discount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-xs">
                      {discountCampaigns && discountCampaigns.length > 0 ? (
                        discountCampaigns.map((c) => (
                          <tr key={c.id} className="hover:bg-zinc-800/20 text-zinc-300">
                            <td className="p-4 font-bold text-white">{c.name}</td>
                            <td className="p-4">
                              {c.category_id 
                                ? (categories.find(cat => cat.id === c.category_id)?.name_en || 'Uncategorized')
                                : (locale === 'ar' ? 'كل المنتجات (عام)' : 'All Items (Global)')}
                            </td>
                            <td className="p-4 font-bold text-brand-accent">{c.discount_percent}% OFF</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                c.is_active 
                                  ? 'bg-green-950/50 text-green-400 border border-green-900' 
                                  : 'bg-red-950/50 text-red-400 border border-red-900'
                              }`}>
                                {c.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-4 text-right flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(c);
                                  setCampaignForm({
                                    name: c.name,
                                    discount_percent: c.discount_percent,
                                    category_id: c.category_id || '',
                                    is_active: c.is_active
                                  });
                                  setIsFormOpen(true);
                                }}
                                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(c.id)}
                                className="p-1.5 hover:bg-red-950/30 rounded text-zinc-400 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-zinc-500 font-semibold">
                            No discount campaigns active yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CUSTOM DESIGN REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase text-white">{t('sidebar.custom_requests')}</h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left font-mono">
                <thead className="bg-zinc-800 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="p-4">{t('custom_requests.client')}</th>
                    <th className="p-4">{t('custom_requests.instagram')}</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">{t('custom_requests.status')}</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-xs">
                  {customRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-zinc-800/20 text-zinc-300">
                      <td className="p-4 font-bold text-white">{req.customer_name}</td>
                      <td className="p-4 text-brand-accent">
                        <a 
                          href={`https://instagram.com/${req.instagram_username.replace('@', '')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {req.instagram_username}
                        </a>
                      </td>
                      <td className="p-4 max-w-xs truncate">{req.description}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          req.status === 'completed' ? 'bg-green-950/50 text-green-400 border border-green-900' :
                          req.status === 'in_progress' ? 'bg-amber-950/50 text-amber-400 border border-amber-900' :
                          'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}>
                          {t(`custom_requests.${req.status}`)}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <select
                          value={req.status}
                          onChange={(e) => updateRequestStatus(req.id, e.target.value, req.notes || '')}
                          className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white text-[10px]"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase text-white">{t('sidebar.settings')}</h2>

            <form onSubmit={handleSaveSettings} className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-2xl space-y-4 max-w-lg">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.brand_name')}</label>
                  <input
                    type="text"
                    value={settingsForm.brand_name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, brand_name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.tagline')}</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.instagram_url')}</label>
                <input
                  type="text"
                  value={settingsForm.instagram_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.tiktok_url')}</label>
                  <input
                    type="text"
                    value={settingsForm.tiktok_url}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tiktok_url: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.facebook_url')}</label>
                  <input
                    type="text"
                    value={settingsForm.facebook_url}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.seo_title')}</label>
                  <input
                    type="text"
                    value={settingsForm.seo_title}
                    onChange={(e) => setSettingsForm({ ...settingsForm, seo_title: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.seo_desc')}</label>
                  <input
                    type="text"
                    value={settingsForm.seo_desc}
                    onChange={(e) => setSettingsForm({ ...settingsForm, seo_desc: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-2">Fabric Pricing Customization (Added Premiums in EGP)</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Premium Fabric</label>
                    <input
                      type="number" min={0}
                      value={settingsForm.fabric_premium_premium}
                      onChange={(e) => setSettingsForm({ ...settingsForm, fabric_premium_premium: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Heavy Fabric</label>
                    <input
                      type="number" min={0}
                      value={settingsForm.fabric_premium_heavy}
                      onChange={(e) => setSettingsForm({ ...settingsForm, fabric_premium_heavy: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Oversized Fabric</label>
                    <input
                      type="number" min={0}
                      value={settingsForm.fabric_premium_oversized}
                      onChange={(e) => setSettingsForm({ ...settingsForm, fabric_premium_oversized: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-3">
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">System Reward Engine Controls</label>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="cotton_reward_system_enabled"
                    checked={settingsForm.cotton_reward_system_enabled}
                    onChange={(e) => setSettingsForm({ ...settingsForm, cotton_reward_system_enabled: e.target.checked })}
                    className="accent-brand-accent animate-none" 
                  />
                  <label htmlFor="cotton_reward_system_enabled" className="text-xs font-bold text-zinc-300 select-none">
                    🧶 Enable Cotton Reward System & Cart Discounts (25% OFF 2nd Item)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="referral_reward_system_enabled"
                    checked={settingsForm.referral_reward_system_enabled}
                    onChange={(e) => setSettingsForm({ ...settingsForm, referral_reward_system_enabled: e.target.checked })}
                    className="accent-brand-accent animate-none" 
                  />
                  <label htmlFor="referral_reward_system_enabled" className="text-xs font-bold text-zinc-300 select-none">
                    🎁 Enable Referral Reward Sharing System (15% OFF)
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-2">Scrolling Homepage Announcement Bar</label>
                <div className="space-y-2">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">EN</span> English Text
                    </label>
                    <input
                      type="text"
                      value={settingsForm.announcement}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                      placeholder="e.g. Free Shipping across Cairo for orders above 1000 EGP!"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">AR</span> Arabic Text
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={settingsForm.announcement_ar}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcement_ar: e.target.value })}
                      placeholder="مثال: شحن مجاني داخل القاهرة للطلبات فوق ١٠٠٠ جنيه!"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent text-right font-arabic"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-xs cursor-pointer transition-colors"
              >
                <Save size={14} />
                Save Settings
              </button>

            </form>
          </div>
        )}

        {/* TAB 7: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-black uppercase text-white">{locale === 'ar' ? 'إدارة الطلبات' : 'Orders Management'}</h2>
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder={locale === 'ar' ? 'ابحث بالكود، الهاتف، أو الاسم...' : 'Search by code, phone, or name...'}
                className="w-full sm:max-w-xs px-3.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
              />
            </div>

            <div className="flex gap-2 border-b border-zinc-800 pb-2">
              {[
                { id: 'all', label: locale === 'ar' ? 'كل الطلبات' : 'All Orders' },
                { id: 'pending', label: locale === 'ar' ? 'قيد الانتظار' : 'Pending' },
                { id: 'completed', label: locale === 'ar' ? 'المكتملة' : 'Completed' },
              ].map((status) => (
                <button
                  key={status.id}
                  onClick={() => setOrderStatusFilter(status.id as any)}
                  className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                    orderStatusFilter === status.id
                      ? 'bg-zinc-800 text-brand-accent border-zinc-700'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left font-mono">
                <thead className="bg-zinc-800 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="p-4">{locale === 'ar' ? 'الكود' : 'Code'}</th>
                    <th className="p-4">{locale === 'ar' ? 'العميل' : 'Customer'}</th>
                    <th className="p-4">{locale === 'ar' ? 'رقم الهاتف' : 'Phone'}</th>
                    <th className="p-4">{locale === 'ar' ? 'المحافظة / العنوان' : 'Location'}</th>
                    <th className="p-4">{locale === 'ar' ? 'المنتجات / الملاحظات' : 'Order Details'}</th>
                    <th className="p-4 text-right">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-xs">
                  {orders && orders.length > 0 ? (
                    (() => {
                      const filtered = [...orders].filter(o => {
                        const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                        if (!matchesStatus) return false;

                        const code = o.id.split('-')[0].toLowerCase();
                        const query = orderSearchQuery.toLowerCase();
                        return code.includes(query) || 
                               o.customer_name.toLowerCase().includes(query) || 
                               o.customer_phone.includes(query);
                      });
                      
                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-zinc-500 font-semibold">
                              {locale === 'ar' ? 'لم يتم العثور على نتائج.' : 'No matching orders found.'}
                            </td>
                          </tr>
                        );
                      }

                      return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-800/20 text-zinc-300">
                          <td className="p-4 font-bold text-brand-accent uppercase">#{order.id.split('-')[0]}</td>
                          <td className="p-4 font-bold text-white">{order.customer_name}</td>
                          <td className="p-4 text-brand-accent font-semibold">{order.customer_phone}</td>
                          <td className="p-4 max-w-xs font-semibold">{order.location}</td>
                          <td className="p-4 max-w-sm">
                            <div className="text-white font-bold">{order.product_name} ({order.price} EGP)</div>
                            {order.items && Array.isArray(order.items) && (
                              <div className="mt-1.5 space-y-1 bg-zinc-950 p-2 border border-zinc-800 rounded">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="text-[10px] flex items-center justify-between text-zinc-300">
                                    <span>
                                      • {item.product_name} ({item.size}) x{item.quantity}
                                    </span>
                                    <span className="text-[9px] text-zinc-500 font-bold">
                                      ({item.fabric})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="text-[10px] text-zinc-400 mt-1.5 font-bold space-y-0.5">
                              {order.coupon_code && (
                                <div className="text-green-500 text-[9px] uppercase">
                                  🎟️ Coupon: {order.coupon_code}
                                </div>
                              )}
                              {order.referral_code && (
                                <div className="text-blue-400 text-[9px] uppercase">
                                  🔗 Referred By: {order.referral_code}
                                </div>
                              )}
                              {order.reward_coupon_code && (
                                <div className="text-amber-500 text-[9px] uppercase font-black">
                                  🎁 Reward Issued: {order.reward_coupon_code}
                                </div>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-1 whitespace-pre-wrap">{order.notes}</div>
                          </td>
                        <td className="p-4 text-right">
                          {order.status === 'completed' ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-950/50 text-green-400 border border-green-900 uppercase">
                              {locale === 'ar' ? 'مكتمل' : 'Completed'}
                            </span>
                          ) : (
                            <button
                              onClick={() => completeOrder(order.id)}
                              className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] uppercase font-black transition-colors cursor-pointer"
                            >
                              {locale === 'ar' ? 'تحديد كمكتمل' : 'Mark Completed'}
                            </button>
                          )}
                        </td>
                      </tr>
                      ))
                    })()
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500 font-semibold">
                        {locale === 'ar' ? 'لا توجد طلبات بعد.' : 'No orders logged on this system yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}

      </main>

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 font-mono">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-sm w-full text-center">
            <h4 className="text-sm font-black uppercase text-red-500 mb-3">⚠️ Danger Area</h4>
            <p className="text-xs font-semibold text-zinc-400 mb-6 leading-relaxed">
              Are you sure you want to delete this resource? This operation is permanent.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (activeTab === 'products') await deleteProduct(deleteConfirmId);
                  else if (activeTab === 'categories') await deleteCategory(deleteConfirmId);
                  else if (activeTab === 'offers') await deleteOffer(deleteConfirmId);
                  else if (activeTab === 'discounts') await deleteDiscountCampaign(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded uppercase cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
