'use client';

import { useState, useEffect, Fragment } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import supabase, { isUsingMock } from '@/lib/supabase';
import { 
  LayoutDashboard, ShoppingBag, FolderOpen, Ticket, Palette, Settings, 
  LogOut, Plus, Edit, Trash2, Copy, Eye, EyeOff, ToggleLeft, ToggleRight, Check, Save, X, ShoppingCart, Tag,
  MessageSquare, Users, BarChart3, Bot, Trophy, ShieldAlert, Mail, Ban
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
    fetchOrders, completeOrder, updateAnnouncement, updateAnnouncementAr,
    adminChats, activeChat, activeChatMessages, autoResponses, usersList, analyticsEvents,
    fetchAdminChats, fetchUserChat
  } = useStore();

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Tab State: 'dashboard' | 'products' | 'categories' | 'requests' | 'offers' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mainCategory, setMainCategory] = useState<'orders' | 'managemental'>('orders');
  const [expandedRequestRowId, setExpandedRequestRowId] = useState<string | null>(null);

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
    is_soon: false,
    is_preorder: false,
    available_sizes: ['S', 'M', 'L', 'XL'], material_options: ['Standard Cotton', 'Premium Cotton'],
    images: [] as string[], display_order: 0,
    fit_type: 'both',
    stock_quantities: {} as Record<string, number>
  });

  const [imageLinkInput, setImageLinkInput] = useState('');

  // Product Designs States (Admin Only)
  const [allDesigns, setAllDesigns] = useState<any[]>([]);
  const [queuedDesigns, setQueuedDesigns] = useState<Array<{ id?: string, design_url: string, notes: string }>>([]);
  const [productDesigns, setProductDesigns] = useState<any[]>([]);
  const [designUrlInput, setDesignUrlInput] = useState('');
  const [designNotesInput, setDesignNotesInput] = useState('');
  const [isUploadingDesign, setIsUploadingDesign] = useState(false);
  const [editingDesignId, setEditingDesignId] = useState<string | null>(null);
  const [editingDesignIdx, setEditingDesignIdx] = useState<number | null>(null);
  const [editingDesignNotes, setEditingDesignNotes] = useState('');
  
  // Designs Explorer extra states
  const [explorerProductId, setExplorerProductId] = useState<string | null>(null);
  const [isUploadingExplorerDesign, setIsUploadingExplorerDesign] = useState(false);
  const [explorerDesignNotesInput, setExplorerDesignNotesInput] = useState('');
  const [explorerDesignUrlInput, setExplorerDesignUrlInput] = useState('');

  const { fetchProductDesigns, addProductDesign, updateProductDesign, deleteProductDesign } = useStore();


  const [catForm, setCatForm] = useState({
    name_en: '', name_ar: '', slug: '', display_order: 0, is_hidden: false, show_in_browse: true,
    default_sizes: '', default_fabrics: '', default_tags: ''
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
  const [isMarkingRefunded, setIsMarkingRefunded] = useState<string | null>(null);

  // Live Chat admin panel states
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [adminChatInput, setAdminChatInput] = useState('');
  const [chatListFilter, setChatListFilter] = useState<'all' | 'open' | 'closed' | 'blocked'>('open');
  const [isStartChatOpen, setIsStartChatOpen] = useState(false);
  const [startChatPhone, setStartChatPhone] = useState('');
  const [startChatName, setStartChatName] = useState('');
  const [autoResponseTrigger, setAutoResponseTrigger] = useState('');
  const [autoResponseText, setAutoResponseText] = useState('');
  const [chatGreetingInput, setChatGreetingInput] = useState('');

  // Email Dispatcher states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalRecipient, setEmailModalRecipient] = useState('');
  const [emailModalSubject, setEmailModalSubject] = useState('');
  const [emailModalBody, setEmailModalBody] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);

  // Users Management states
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    full_name: '', email: '', phone: '', loyalty_points: 0, password: '',
    address_governorate: '', address_city: '', address_street: ''
  });

  // Analytics states
  const [analyticsFilter, setAnalyticsFilter] = useState<'day' | 'week' | 'month' | 'year' | 'total'>('total');


  const [settingsForm, setSettingsForm] = useState({
    brand_name: '', tagline: '', instagram_url: '', tiktok_url: '', facebook_url: '',
    seo_title: '', seo_desc: '', shipping_info_en: '', shipping_info_ar: '',
    announcement: '',
    announcement_ar: '',
    fabric_premium_premium: 50,
    fabric_premium_heavy: 100,
    fabric_premium_oversized: 150,
    cotton_reward_system_enabled: true,
    referral_reward_system_enabled: true,
    show_stock_quantities: true,
    size_chart_img_en: '',
    size_chart_img_ar: '',
    size_chart_table: '',
    auto_applied_offers: '',
    default_sizes: 'S, M, L, XL, XXL',
    default_fabrics: 'Standard Cotton, Premium Cotton',
    default_tags: 'New Drop',
    loyalty_orders_threshold: 5,
    loyalty_discount_percent: 20,
    referral_clicks_threshold: 5,
    good_stock_threshold: 10,
    low_stock_threshold: 3,
    favicon_url: '',
    logo_url: '',
    loading_logo_url: '',
    delivery_fee: 50,
    chat_widget_enabled: true,
    global_preorder_mode: false,
    hero_product_id: '',
    terms_en: '',
    terms_ar: '',
    email_template_confirmation_subject: '',
    email_template_confirmation_body: '',
    email_template_approved_subject: '',
    email_template_approved_body: '',
    email_template_rejected_subject: '',
    email_template_rejected_body: '',
    account_fields: {} as Record<string, string>,
    text_overrides: {} as Record<string, string>,
    why_choose_us: [] as any[],
    faqs: [] as any[]
  });

  // Payment gateway settings states
  const [isPaymentSessionValid, setIsPaymentSessionValid] = useState(false);
  const [paymentPasswordInput, setPaymentPasswordInput] = useState('');
  const [paymentPasswordError, setPaymentPasswordError] = useState('');
  const [paymentSettingsForm, setPaymentSettingsForm] = useState({
    paymob_api_key: '',
    paymob_secret_key: '',
    paymob_integration_id_card: '',
    paymob_integration_id_fawry: '',
    paymob_hmac_secret: '',
    paymob_public_key: '',
    paymob_enabled: false,
    instapay_phone: '',
    instapay_name: '',
    instapay_qr_code: '',
    instapay_link: '',
    instapay_enabled: true,
    cod_enabled: true
  });
  const [revealApiKey, setRevealApiKey] = useState(false);
  const [revealSecretKey, setRevealSecretKey] = useState(false);
  const [revealHmacSecret, setRevealHmacSecret] = useState(false);
  const [revealPublicKey, setRevealPublicKey] = useState(false);
  const [isUploadingQrCode, setIsUploadingQrCode] = useState(false);

  // Custom Requests accepting price state
  const [acceptingReqId, setAcceptingReqId] = useState<string | null>(null);
  const [customRequestPrice, setCustomRequestPrice] = useState<string>('');

  // Orders rejection details state
  const [rejectionReasonInput, setRejectionReasonInput] = useState<Record<string, string>>({});
  const [showRejectBox, setShowRejectBox] = useState<Record<string, boolean>>({});

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingLoadingLogo, setIsUploadingLoadingLogo] = useState(false);

  const [sizeTable, setSizeTable] = useState<{ headers: string[]; rows: string[][] }>({
    headers: ['Size', 'Width (Chest - cm)', 'Length (cm)', 'Sleeve (cm)'],
    rows: [
      ['S', '52', '70', '21'],
      ['M', '55', '72', '22'],
      ['L', '58', '74', '23']
    ]
  });

  const [autoOffers, setAutoOffers] = useState<any[]>([]);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isAutoOffersOpen, setIsAutoOffersOpen] = useState(false);
  const [thresholdOffers, setThresholdOffers] = useState<any[]>([]);
  const [isThresholdOffersOpen, setIsThresholdOffersOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [sizeChartsList, setSizeChartsList] = useState<any[]>([]);

  // Bulk Edit States
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkTargetType, setBulkTargetType] = useState<'all' | 'category'>('all');
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [bulkSizes, setBulkSizes] = useState<string[]>([]);
  const [bulkFabrics, setBulkFabrics] = useState<string[]>([]);
  const [bulkFitType, setBulkFitType] = useState('both');
  const [bulkTags, setBulkTags] = useState('');
  const [bulkUpdateSizesEnabled, setBulkUpdateSizesEnabled] = useState(false);
  const [bulkUpdateFabricsEnabled, setBulkUpdateFabricsEnabled] = useState(false);
  const [bulkUpdateFitTypeEnabled, setBulkUpdateFitTypeEnabled] = useState(false);
  const [bulkUpdateTagsEnabled, setBulkUpdateTagsEnabled] = useState(false);
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkSalePrice, setBulkSalePrice] = useState('');
  const [bulkUpdatePriceEnabled, setBulkUpdatePriceEnabled] = useState(false);
  const [bulkUpdateSalePriceEnabled, setBulkUpdateSalePriceEnabled] = useState(false);

  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [designsSearchQuery, setDesignsSearchQuery] = useState('');
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('');
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Record<string, boolean>>({});

  // Sizing & Fabric dynamic options states
  const [sizeOptions, setSizeOptions] = useState(['S', 'M', 'L', 'XL', 'XXL', '3XL']);
  const [fabricOptions, setFabricOptions] = useState(['Standard Cotton', 'Premium Cotton', 'Heavy Cotton', 'Over-sized Heavy']);
  const [newCustomSize, setNewCustomSize] = useState('');
  const [newCustomFabric, setNewCustomFabric] = useState('');
  const [tagsText, setTagsText] = useState('');

  // Visual Tag Positioner Modal States
  const [isTagPositionerOpen, setIsTagPositionerOpen] = useState(false);
  const [selectedTagToPosition, setSelectedTagToPosition] = useState('');
  const [tagBgColor, setTagBgColor] = useState('#F2CC8F');
  const [tagTextColor, setTagTextColor] = useState('#000000');
  const [tagRotation, setTagRotation] = useState(0);
  const [tagFontSize, setTagFontSize] = useState(10);

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

  // Poll for admin chats updates
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'chats') return;
    const timer = setInterval(() => {
      fetchAdminChats();
      const currentSelectedId = selectedChatId;
      if (currentSelectedId) {
        const currentChatObj = useStore.getState().adminChats.find((c: any) => c.id === currentSelectedId);
        if (currentChatObj) {
          fetchUserChat(currentChatObj.customer_phone || undefined);
        }
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [isAuthenticated, activeTab, selectedChatId, fetchAdminChats, fetchUserChat]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminRequests();
      fetchOrders();
      useStore.getState().fetchUsersList();

      // Fetch all product designs for printing reference check
      supabase.from('product_designs').select('*').then(({ data }: any) => {
        if (data) setAllDesigns(data);
      });
      // populate settings form once loaded
      const premiums = settings.fabric_premiums || {};

      let tableVal = settings.size_chart_table;
      if (tableVal) {
        try {
          const parsed = typeof tableVal === 'string' ? JSON.parse(tableVal) : tableVal;
          if (parsed && parsed.headers && parsed.rows) {
            setSizeTable(parsed);
          }
        } catch(e) {}
      }

      let offersVal = settings.auto_applied_offers;
      if (offersVal) {
        try {
          const parsed = typeof offersVal === 'string' ? JSON.parse(offersVal) : offersVal;
          if (Array.isArray(parsed)) {
            setAutoOffers(parsed);
          }
        } catch(e) {}
      }

      let thresholdVal = settings.threshold_offers;
      if (thresholdVal) {
        try {
          const parsed = typeof thresholdVal === 'string' ? JSON.parse(thresholdVal) : thresholdVal;
          if (Array.isArray(parsed)) {
            setThresholdOffers(parsed);
          }
        } catch(e) {}
      }

      let chartsVal = settings.size_charts;
      if (chartsVal) {
        try {
          const parsed = typeof chartsVal === 'string' ? JSON.parse(chartsVal) : chartsVal;
          if (Array.isArray(parsed)) {
            setSizeChartsList(parsed);
          }
        } catch(e) {}
      } else {
        setSizeChartsList([
          {
            id: 'oversized',
            name_en: 'Oversized Fit Size Chart',
            name_ar: 'جدول قياسات المقاس الواسع',
            img_en: settings.size_chart_img_en || '',
            img_ar: settings.size_chart_img_ar || '',
            table: sizeTable
          },
          {
            id: 'regular',
            name_en: 'Regular Fit Size Chart',
            name_ar: 'جدول قياسات المقاس المعتاد',
            img_en: '',
            img_ar: '',
            table: {
              headers: ['Size', 'Width (Chest - cm)', 'Length (cm)', 'Sleeve (cm)'],
              rows: [
                ['S', '50', '68', '20'],
                ['M', '53', '70', '21'],
                ['L', '56', '72', '22']
              ]
            }
          }
        ]);
      }

      let customAccFields = {
        name: 'required',
        email: 'optional',
        phone: 'required',
        governorate: 'required',
        city: 'required',
        address: 'required',
        notes: 'optional'
      };
      try {
        if (settings.account_fields) {
          customAccFields = typeof settings.account_fields === 'string'
            ? JSON.parse(settings.account_fields)
            : settings.account_fields;
        }
      } catch (e) {
        console.error(e);
      }

      let customOverrides = {};
      try {
        if (settings.text_overrides) {
          customOverrides = typeof settings.text_overrides === 'string'
            ? JSON.parse(settings.text_overrides)
            : settings.text_overrides;
        }
      } catch (e) {
        console.error(e);
      }

      let customWhy = [];
      try {
        if (settings.why_choose_us) {
          customWhy = typeof settings.why_choose_us === 'string'
            ? JSON.parse(settings.why_choose_us)
            : settings.why_choose_us;
        }
      } catch (e) {
        console.error(e);
      }

      let customFaqs = [];
      try {
        if (settings.faqs) {
          customFaqs = typeof settings.faqs === 'string'
            ? JSON.parse(settings.faqs)
            : settings.faqs;
        }
      } catch (e) {
        console.error(e);
      }

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
        referral_reward_system_enabled: settings.referral_reward_system_enabled !== false,
        show_stock_quantities: settings.show_stock_quantities !== false,
        size_chart_img_en: settings.size_chart_img_en || '',
        size_chart_img_ar: settings.size_chart_img_ar || '',
        size_chart_table: typeof settings.size_chart_table === 'string' ? settings.size_chart_table : JSON.stringify(settings.size_chart_table || ''),
        auto_applied_offers: typeof settings.auto_applied_offers === 'string' ? settings.auto_applied_offers : JSON.stringify(settings.auto_applied_offers || ''),
        default_sizes: settings.default_sizes || 'S, M, L, XL, XXL',
        default_fabrics: settings.default_fabrics || 'Standard Cotton, Premium Cotton',
        default_tags: settings.default_tags || 'New Drop',
        loyalty_orders_threshold: settings.loyalty_orders_threshold ?? 5,
        loyalty_discount_percent: settings.loyalty_discount_percent ?? 20,
        referral_clicks_threshold: settings.referral_clicks_threshold ?? 5,
        good_stock_threshold: Number(settings.good_stock_threshold ?? 10),
        low_stock_threshold: Number(settings.low_stock_threshold ?? 3),
        favicon_url: settings.favicon_url || '',
        logo_url: settings.logo_url || '',
        loading_logo_url: settings.loading_logo_url || '',
        delivery_fee: Number(settings.delivery_fee ?? 50),
        chat_widget_enabled: settings.chat_widget_enabled !== false,
        global_preorder_mode: settings.global_preorder_mode === true,
        hero_product_id: settings.hero_product_id || '',
        terms_en: settings.terms_en || '',
        terms_ar: settings.terms_ar || '',
        email_template_confirmation_subject: settings.email_template_confirmation_subject || '',
        email_template_confirmation_body: settings.email_template_confirmation_body || '',
        email_template_approved_subject: settings.email_template_approved_subject || '',
        email_template_approved_body: settings.email_template_approved_body || '',
        email_template_rejected_subject: settings.email_template_rejected_subject || '',
        email_template_rejected_body: settings.email_template_rejected_body || '',
        account_fields: customAccFields,
        text_overrides: customOverrides,
        why_choose_us: Array.isArray(customWhy) ? customWhy : [],
        faqs: Array.isArray(customFaqs) ? customFaqs : []
      });
    }
  }, [isAuthenticated, settings]);

  // ── Supabase Realtime: auto-refresh orders when new ones arrive ──────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('admin-orders-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
        fetchAdminRequests();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, fetchOrders, fetchAdminRequests]);

  // Load and parse payment settings
  useEffect(() => {
    if (settings) {
      try {
        const ps = settings.payment_settings;
        const parsed = typeof ps === 'string' ? JSON.parse(ps) : ps;
        if (parsed) {
          setPaymentSettingsForm({
            paymob_api_key: parsed.paymob_api_key || '',
            paymob_secret_key: parsed.paymob_secret_key || '',
            paymob_integration_id_card: parsed.paymob_integration_id_card || '',
            paymob_integration_id_fawry: parsed.paymob_integration_id_fawry || '',
            paymob_hmac_secret: parsed.paymob_hmac_secret || '',
            paymob_public_key: parsed.paymob_public_key || '',
            paymob_enabled: parsed.paymob_enabled === true,
            instapay_phone: parsed.instapay_phone || '',
            instapay_name: parsed.instapay_name || '',
            instapay_qr_code: parsed.instapay_qr_code || '',
            instapay_link: parsed.instapay_link || '',
            instapay_enabled: parsed.instapay_enabled !== false,
            cod_enabled: parsed.cod_enabled !== false
          });
        }
      } catch (e) {
        console.error("Error loading payment settings:", e);
      }
    }
  }, [settings]);

  // Load designs when editing a product
  useEffect(() => {
    if (editingItem) {
      fetchProductDesigns(editingItem.id).then((designs) => {
        setProductDesigns(designs);
      });
    } else {
      setProductDesigns([]);
    }
  }, [editingItem, fetchProductDesigns]);

  // Design Upload/Link Handlers
  const handleDesignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);
    setIsUploadingDesign(true);

    try {
      for (const file of selectedFiles) {
        let designUrl = '';
        if (isUsingMock) {
          const base64 = await fileToBase64(file);
          designUrl = base64;
        } else {
          const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const { data, error } = await supabase.storage.from('designs').upload(fileName, file);
          if (error) {
            alert(`Design upload failed for ${file.name}: ${error.message}`);
            continue;
          }
          if (data) {
            const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(data.path);
            designUrl = publicUrl;
          }
        }

        if (designUrl) {
          if (editingItem) {
            const saved = await addProductDesign({
              product_id: editingItem.id,
              design_url: designUrl,
              notes: designNotesInput || file.name
            });
            if (saved) {
              setProductDesigns(prev => [...prev, saved]);
              setAllDesigns(prev => [...prev, saved]);
            }
          } else {
            setQueuedDesigns(prev => [...prev, {
              design_url: designUrl,
              notes: designNotesInput || file.name
            }]);
          }
        }
      }
      setDesignNotesInput('');
    } catch (err: any) {
      console.error('Design upload error:', err);
      alert('Failed to upload design files.');
    } finally {
      setIsUploadingDesign(false);
    }
  };

  const handleAddDesignLink = async () => {
    const trimmedUrl = designUrlInput.trim();
    if (!trimmedUrl) return;

    if (editingItem) {
      const saved = await addProductDesign({
        product_id: editingItem.id,
        design_url: trimmedUrl,
        notes: designNotesInput || 'External Link'
      });
      if (saved) {
        setProductDesigns(prev => [...prev, saved]);
        setAllDesigns(prev => [...prev, saved]);
        setDesignUrlInput('');
        setDesignNotesInput('');
      }
    } else {
      setQueuedDesigns(prev => [...prev, {
        design_url: trimmedUrl,
        notes: designNotesInput || 'External Link'
      }]);
      setDesignUrlInput('');
      setDesignNotesInput('');
    }
  };

  const handleStartEditDesign = (design: any, idx: number) => {
    if (design.id) {
      setEditingDesignId(design.id);
      setEditingDesignIdx(null);
    } else {
      setEditingDesignId(null);
      setEditingDesignIdx(idx);
    }
    setEditingDesignNotes(design.notes || '');
  };

  const handleSaveDesignNotes = async (design: any, idx: number) => {
    const trimmed = editingDesignNotes.trim();
    if (!trimmed) return;

    if (design.id) {
      // Saved design in Supabase
      const updated = await updateProductDesign(design.id, { notes: trimmed });
      if (updated) {
        setProductDesigns(prev => prev.map(d => d.id === design.id ? { ...d, notes: trimmed } : d));
        setAllDesigns(prev => prev.map(d => d.id === design.id ? { ...d, notes: trimmed } : d));
      }
    } else {
      // Queued design locally
      setQueuedDesigns(prev => prev.map((d, i) => i === idx ? { ...d, notes: trimmed } : d));
    }

    setEditingDesignId(null);
    setEditingDesignIdx(null);
    setEditingDesignNotes('');
  };

  const handleDeleteDesign = async (designId: string | undefined, idx: number) => {
    if (editingItem && designId) {
      await deleteProductDesign(designId);
      setProductDesigns(prev => prev.filter(d => d.id !== designId));
      setAllDesigns(prev => prev.filter(d => d.id !== designId));
    } else {
      setQueuedDesigns(prev => prev.filter((_, i) => i !== idx));
    }
  };

  // Designs Explorer handlers
  const handleExplorerDesignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!explorerProductId || !e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);
    setIsUploadingExplorerDesign(true);

    try {
      for (const file of selectedFiles) {
        let designUrl = '';
        if (isUsingMock) {
          const base64 = await fileToBase64(file);
          designUrl = base64;
        } else {
          const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const { data, error } = await supabase.storage.from('designs').upload(fileName, file);
          if (error) {
            alert(`Upload failed for ${file.name}: ${error.message}`);
            continue;
          }
          if (data) {
            const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(data.path);
            designUrl = publicUrl;
          }
        }

        if (designUrl) {
          const saved = await addProductDesign({
            product_id: explorerProductId,
            design_url: designUrl,
            notes: explorerDesignNotesInput || file.name
          });
          if (saved) {
            setAllDesigns(prev => [...prev, saved]);
          }
        }
      }
      setExplorerDesignNotesInput('');
    } catch (err: any) {
      console.error('Explorer design upload error:', err);
      alert('Failed to upload designs.');
    } finally {
      setIsUploadingExplorerDesign(false);
    }
  };

  const handleExplorerAddDesignLink = async () => {
    if (!explorerProductId) return;
    const trimmedUrl = explorerDesignUrlInput.trim();
    if (!trimmedUrl) return;

    const saved = await addProductDesign({
      product_id: explorerProductId,
      design_url: trimmedUrl,
      notes: explorerDesignNotesInput || 'External Link'
    });
    if (saved) {
      setAllDesigns(prev => [...prev, saved]);
      setExplorerDesignUrlInput('');
      setExplorerDesignNotesInput('');
    }
  };

  const handleExplorerDeleteDesign = async (designId: string) => {
    if (confirm('Are you sure you want to delete this design file?')) {
      await deleteProductDesign(designId);
      setAllDesigns(prev => prev.filter(d => d.id !== designId));
    }
  };

  const downloadSingleDesign = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllProductDesigns = async (productDesignsList: any[], productName: string) => {
    for (let i = 0; i < productDesignsList.length; i++) {
      const d = productDesignsList[i];
      const ext = d.design_url.split('.').pop()?.split('?')[0] || 'jpg';
      const name = `${productName.replace(/\s+/g, '_')}_design_${i + 1}_${d.notes.replace(/\s+/g, '_')}.${ext}`;
      downloadSingleDesign(d.design_url, name);
      await new Promise(resolve => setTimeout(resolve, 350));
    }
  };

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

  // Helper to split tags text while ignoring commas inside JSON objects
  const splitTagsText = (text: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inBraces = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '{') inBraces++;
      if (char === '}') inBraces--;
      if (char === ',' && inBraces === 0) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      result.push(current.trim());
    }
    return result;
  };

  const handleBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !bulkUpdateSizesEnabled && 
      !bulkUpdateFabricsEnabled && 
      !bulkUpdateFitTypeEnabled && 
      !bulkUpdateTagsEnabled &&
      !bulkUpdatePriceEnabled &&
      !bulkUpdateSalePriceEnabled
    ) {
      alert('Please enable and check at least one attribute toggle to bulk update!');
      return;
    }

    const confirmMsg = bulkTargetType === 'all' 
      ? 'Are you sure you want to bulk update ALL products in the catalog?' 
      : `Are you sure you want to bulk update products under the selected category?`;
    
    if (!confirm(confirmMsg)) return;

    // Filter target products
    const targetProducts = products.filter(p => {
      if (bulkTargetType === 'category') {
        return p.category_id === bulkCategoryId;
      }
      return true;
    });

    if (targetProducts.length === 0) {
      alert('No products found matching the bulk edit filter target.');
      return;
    }

    // Build update payload
    const updatePayload: Record<string, any> = {};
    if (bulkUpdateSizesEnabled) updatePayload.available_sizes = bulkSizes;
    if (bulkUpdateFabricsEnabled) updatePayload.material_options = bulkFabrics;
    if (bulkUpdateFitTypeEnabled) updatePayload.fit_type = bulkFitType as 'regular' | 'oversized' | 'both';
    if (bulkUpdateTagsEnabled) updatePayload.tags = splitTagsText(bulkTags);
    
    if (bulkUpdatePriceEnabled) {
      if (isNaN(Number(bulkPrice)) || Number(bulkPrice) < 0 || bulkPrice.trim() === '') {
        alert('Please enter a valid price number.');
        return;
      }
      updatePayload.price = Number(bulkPrice);
    }
    
    if (bulkUpdateSalePriceEnabled) {
      if (bulkSalePrice.trim() === '') {
        updatePayload.sale_price = null;
      } else {
        if (isNaN(Number(bulkSalePrice)) || Number(bulkSalePrice) < 0) {
          alert('Please enter a valid sale price number or leave blank to clear sale price.');
          return;
        }
        updatePayload.sale_price = Number(bulkSalePrice);
      }
    }

    let successCount = 0;
    for (const prod of targetProducts) {
      try {
        await updateProduct(prod.id, updatePayload);
        successCount++;
      } catch (err) {
        console.error(`Failed to bulk update product ${prod.name_en || prod.id}:`, err);
      }
    }

    alert(`Successfully bulk updated ${successCount} of ${targetProducts.length} target products.`);
    setIsBulkEditOpen(false);
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
      tags: splitTagsText(tagsText),
      fit_type: prodForm.fit_type as 'regular' | 'oversized' | 'both',
      // Dynamically compute in-stock status based on size quantities
      is_in_stock: (prodForm.stock_quantities && Object.keys(prodForm.stock_quantities).length > 0)
        ? Object.values(prodForm.stock_quantities).some(q => Number(q) > 0)
        : prodForm.is_in_stock
    };

    if (editingItem) {
      await updateProduct(editingItem.id, finalProduct);
    } else {
      const savedProd = await addProduct(finalProduct);
      if (savedProd && queuedDesigns.length > 0) {
        for (const design of queuedDesigns) {
          await addProductDesign({
            product_id: savedProd.id,
            design_url: design.design_url,
            notes: design.notes
          });
        }
      }
    }
    setQueuedDesigns([]);
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

  const updateOffersList = (nextList: any[]) => {
    setAutoOffers(nextList);
    setSettingsForm(prev => ({ ...prev, auto_applied_offers: JSON.stringify(nextList) }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalSettings = { 
      ...settingsForm,
      size_charts: sizeChartsList
    } as any;

    // Parse size chart table if custom JSON
    if (typeof finalSettings.size_chart_table === 'string' && finalSettings.size_chart_table.trim()) {
      try {
        finalSettings.size_chart_table = JSON.parse(finalSettings.size_chart_table);
      } catch (err) {
        alert('Invalid Fallback Size Chart Table JSON syntax! Please check formatting.');
        return;
      }
    }
    
    // Parse auto-applied promo campaigns if custom JSON
    if (typeof finalSettings.auto_applied_offers === 'string' && finalSettings.auto_applied_offers.trim()) {
      try {
        finalSettings.auto_applied_offers = JSON.parse(finalSettings.auto_applied_offers);
      } catch (err) {
        alert('Invalid Auto-applied Promo Campaigns JSON syntax! Please check formatting.');
        return;
      }
    }

    await saveSettings(finalSettings);
    if (finalSettings.announcement !== undefined) {
      await updateAnnouncement(finalSettings.announcement);
    }
    if (finalSettings.announcement_ar !== undefined) {
      await updateAnnouncementAr(finalSettings.announcement_ar);
    }
    alert(t('settings.save_success'));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  // File Upload Handlers (simulated local storage files in mock mode, or supabase upload)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);



    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      if (isUsingMock) {
        try {
          const base64 = await fileToBase64(file);
          uploadedUrls.push(base64);
        } catch (err) {
          console.error('Mock upload conversion error:', err);
        }
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

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFavicon(true);
    try {
      if (isUsingMock) {
        const base64 = await fileToBase64(file);
        setSettingsForm(prev => ({ ...prev, favicon_url: base64 }));
      } else {
        const fileExt = file.name.split('.').pop();
        const fileName = `favicon-${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('products').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);
        setSettingsForm(prev => ({ ...prev, favicon_url: publicUrl }));
      }
      alert(locale === 'ar' ? '✅ تم رفع الأيقونة بنجاح! احفظ الإعدادات لتطبيقها.' : '✅ Favicon uploaded! Save settings to apply.');
    } catch (err: any) {
      alert(locale === 'ar' ? `فشل رفع الملف: ${err.message}` : `Upload failed: ${err.message}`);
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      if (isUsingMock) {
        const base64 = await fileToBase64(file);
        setSettingsForm(prev => ({ ...prev, logo_url: base64 }));
      } else {
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('products').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);
        setSettingsForm(prev => ({ ...prev, logo_url: publicUrl }));
      }
      alert(locale === 'ar' ? '✅ تم رفع اللوجو بنجاح! احفظ الإعدادات لتطبيقها.' : '✅ Website logo uploaded! Save settings to apply.');
    } catch (err: any) {
      alert(locale === 'ar' ? `فشل رفع الملف: ${err.message}` : `Upload failed: ${err.message}`);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLoadingLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLoadingLogo(true);
    try {
      if (isUsingMock) {
        const base64 = await fileToBase64(file);
        setSettingsForm(prev => ({ ...prev, loading_logo_url: base64 }));
      } else {
        const fileExt = file.name.split('.').pop();
        const fileName = `loading-logo-${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('products').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);
        setSettingsForm(prev => ({ ...prev, loading_logo_url: publicUrl }));
      }
      alert(locale === 'ar' ? '✅ تم رفع لوجو شاشة التحميل بنجاح! احفظ الإعدادات لتطبيقها.' : '✅ Loading screen logo uploaded! Save settings to apply.');
    } catch (err: any) {
      alert(locale === 'ar' ? `فشل رفع الملف: ${err.message}` : `Upload failed: ${err.message}`);
    } finally {
      setIsUploadingLoadingLogo(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingQrCode(true);
    try {
      if (isUsingMock) {
        const base64 = await fileToBase64(file);
        setPaymentSettingsForm(prev => ({ ...prev, instapay_qr_code: base64 }));
      } else {
        const fileExt = file.name.split('.').pop();
        const fileName = `instapay-qr-${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('products').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);
        setPaymentSettingsForm(prev => ({ ...prev, instapay_qr_code: publicUrl }));
      }
      alert(locale === 'ar' ? '✅ تم رفع رمز انستاباي الاستجابة السريعة (QR) بنجاح!' : '✅ InstaPay QR Code uploaded successfully!');
    } catch (err: any) {
      alert(locale === 'ar' ? `فشل رفع الملف: ${err.message}` : `Upload failed: ${err.message}`);
    } finally {
      setIsUploadingQrCode(false);
    }
  };

  const handleVerifyPaymentPassword = async () => {
    if (!paymentPasswordInput) return;
    try {
      const res = await fetch('/api/admin/verify-payment-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: paymentPasswordInput })
      });
      const data = await res.json();
      if (data.success) {
        setIsPaymentSessionValid(true);
        setPaymentPasswordError('');
      } else {
        setPaymentPasswordError(data.error || 'Incorrect Password');
      }
    } catch (e) {
      console.error(e);
      setPaymentPasswordError('Verification error');
    }
  };

  const handleSavePaymentSettings = async () => {
    try {
      const { error: updateErr } = await supabase
        .from('settings')
        .upsert({
          key: 'payment_settings',
          value: paymentSettingsForm
        });

      if (updateErr) {
        throw updateErr;
      }

      alert('Payment configurations saved successfully!');
      await useStore.getState().fetchInitialData();
    } catch (e: any) {
      console.error("Error saving payment settings:", e);
      alert('Failed to save payment settings: ' + e.message);
    }
  };

  const handleSendCustomEmail = async () => {
    if (!emailModalRecipient.trim() || !emailModalSubject.trim() || !emailModalBody.trim()) {
      alert('Please fill in all email fields (recipient, subject, and message).');
      return;
    }

    setIsEmailSending(true);
    try {
      const res = await fetch('/api/admin/send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailModalRecipient.trim(),
          subject: emailModalSubject.trim(),
          message: emailModalBody.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch email');
      }

      alert('Email sent successfully to ' + emailModalRecipient);
      setIsEmailModalOpen(false);
      setEmailModalSubject('');
      setEmailModalBody('');
    } catch (e: any) {
      console.error(e);
      alert('Error sending email: ' + e.message);
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleMarkRefunded = async (orderId: string) => {
    setIsMarkingRefunded(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ is_refunded: true })
        .eq('id', orderId);
      if (error) throw error;
      alert(locale === 'ar' ? 'تم تحديد الطلب كـ مسترجع بنجاح!' : 'Order marked as refunded successfully!');
      await fetchOrders();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsMarkingRefunded(null);
    }
  };

  const getCancelledCount = (phone: string) => {
    if (!phone) return 0;
    return orders.filter(o => o.customer_phone === phone && o.status === 'cancelled').length;
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

  const handlePrintOrders = (targetOrders: any[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let labelsHtml = '';
    targetOrders.forEach(o => {
      const itemsList = o.items || [];
      let itemsTableRows = '';
      itemsList.forEach((item: any) => {
        const prodName = item.product_name || item.product?.name_en || 'Custom Product';
        const size = item.size || 'M';
        const fabric = item.fabric || 'Standard Cotton';
        const fit = item.fit_type || item.fitType || 'Oversized';
        const qty = item.quantity || 1;
        itemsTableRows += `
          <tr>
            <td style="font-weight: 900;">${prodName}</td>
            <td>${size}</td>
            <td>${fabric}</td>
            <td>${fit}</td>
            <td style="text-align: center; font-weight: 900;">x${qty}</td>
          </tr>
        `;
      });

      const customerEmailHtml = o.customer_email 
        ? `<div class="info-text" style="font-size: 11px; font-weight: 500; color: #555;">✉️ ${o.customer_email}</div>` 
        : '';

      const notesHtml = o.notes 
        ? `<div class="section-title">Customer Shipping Notes:</div><div class="notes">${o.notes}</div>` 
        : '';

      labelsHtml += `
        <div class="label-card">
          <div class="header">
            <div class="brand">Fandom Fit</div>
            <div class="title">Shipping Label</div>
          </div>
          
          <div class="grid">
            <div>
              <div class="section-title">Ship To (Recipient):</div>
              <div class="info-box">
                <div class="info-text" style="font-size: 15px; font-weight: 900;">${o.customer_name}</div>
                <div class="info-text" style="font-family: monospace; font-size: 14px;">📞 ${o.customer_phone}</div>
                ${customerEmailHtml}
              </div>
            </div>
            
            <div>
              <div class="section-title">Delivery Address:</div>
              <div class="info-box">
                <div class="info-text">${o.governorate || ''} - ${o.city || ''}</div>
                <div class="info-text" style="font-weight: 500; font-size: 12px; margin-top: 2px;">${o.address || o.location}</div>
              </div>
            </div>
          </div>
          
          <div class="grid">
            <div>
              <div class="section-title">Order Code:</div>
              <div class="info-box" style="font-family: monospace; font-weight: 900; font-size: 14px;">
                ${o.order_code || o.id.substring(0, 8).toUpperCase()}
              </div>
            </div>
            
            <div>
              <div class="section-title">Payment Mode:</div>
              <div class="info-box" style="font-weight: 900; font-size: 12px; text-transform: uppercase;">
                ${o.payment_method === 'cod' ? 'Cash on Delivery (COD)' : o.payment_method.toUpperCase()}
              </div>
            </div>
          </div>

          <div class="section-title">Items Spec Breakdown:</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="width: 80px;">Size</th>
                <th style="width: 100px;">Fabric</th>
                <th style="width: 100px;">Fit</th>
                <th style="width: 60px; text-align: center;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableRows}
            </tbody>
          </table>

          ${notesHtml}

          <div class="total-row">
            Amount to Collect: <span style="font-size: 18px; font-weight: 900;">${o.price} EGP</span>
          </div>
        </div>
      `;
    });

    const htmlContent = `
      <html>
        <head>
          <title>Fandom Fit - Shipping Labels</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
              -webkit-print-color-adjust: exact;
            }
            .label-card {
              width: 100%;
              max-width: 800px;
              margin: 20px auto;
              padding: 20px;
              border: 3px solid #000;
              border-radius: 16px;
              box-sizing: border-box;
              page-break-after: always;
              position: relative;
            }
            .header {
              border-bottom: 3px solid #000;
              padding-bottom: 12px;
              margin-bottom: 15px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand {
              font-size: 22px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .title {
              font-size: 11px;
              font-weight: 900;
              background: #000;
              color: #fff;
              padding: 4px 8px;
              text-transform: uppercase;
              border-radius: 6px;
            }
            .grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .section-title {
              font-size: 10px;
              font-weight: 900;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .info-box {
              background: #f8f8f8;
              border: 2px solid #000;
              border-radius: 10px;
              padding: 10px;
            }
            .info-text {
              font-size: 13px;
              font-weight: 700;
              line-height: 1.4;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            .items-table th, .items-table td {
              border: 2px solid #000;
              padding: 8px;
              font-size: 11px;
              text-align: left;
            }
            .items-table th {
              background: #f0f0f0;
              font-weight: 950;
              text-transform: uppercase;
            }
            .total-row {
              font-weight: 900;
              font-size: 14px;
              text-align: right;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 2px dashed #000;
            }
            .notes {
              font-size: 10px;
              font-weight: 700;
              background: #fff9e6;
              border: 2px dashed #ffc107;
              padding: 10px;
              border-radius: 10px;
              margin-top: 10px;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .label-card {
                margin: 0;
                border: 3px solid #000;
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          ${labelsHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleExportToExcel = (targetOrders: any[]) => {
    const headers = [
      'Order Code',
      'Status',
      'Created Date',
      'Customer Name',
      'Phone Number',
      'Email',
      'Governorate',
      'City',
      'Address',
      'Items Ordered',
      'Total Price (EGP)',
      'Payment Method',
      'Notes'
    ];

    const getStatusLabel = (status: string) => {
      const labels: Record<string, string> = {
        pending: 'Pending',
        pending_verification: 'Pending Verification',
        completed: 'Completed',
        rejected: 'Rejected',
        shipping: 'Shipping',
        ready_to_ship: 'Ready To Ship',
        pending_payment: 'Pending Payment'
      };
      return labels[status] || status;
    };

    const getPaymentMethodLabel = (pm: string) => {
      const labels: Record<string, string> = {
        cod: 'Cash on Delivery (COD)',
        instapay: 'Instapay Transfer',
        paymob_card: 'Credit/Debit Card',
        paymob_fawry: 'Fawry Payment'
      };
      return labels[pm] || pm;
    };

    let totalItemsCount = 0;
    const rows = targetOrders.map(o => {
      const itemsString = (o.items || []).map((i: any) => {
        const name = i.product_name || i.product?.name_en || 'Item';
        const size = i.size || 'M';
        const fabric = i.fabric || 'Standard';
        const fit = i.fit_type || i.fitType || 'Oversized';
        const qty = i.quantity || 1;
        totalItemsCount += Number(qty);
        return `${name} (${size}, ${fabric}, ${fit} x${qty})`;
      }).join('\n');

      return [
        o.order_code || o.id.split('-')[0].toUpperCase(),
        getStatusLabel(o.status),
        new Date(o.created_at).toLocaleDateString(),
        o.customer_name,
        o.customer_phone,
        o.customer_email || 'No Email',
        o.governorate || '',
        o.city || '',
        (o.address || o.location || '').replace(/"/g, '""'),
        itemsString.replace(/"/g, '""'),
        `${o.price} EGP`,
        getPaymentMethodLabel(o.payment_method),
        (o.notes || '').replace(/\n/g, ' ').replace(/"/g, '""')
      ];
    });

    const totalRevenue = targetOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);

    const summaryRows = [
      [],
      ['SUMMARY STATISTICS', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Total Exported Orders', `${targetOrders.length} orders`, '', '', '', '', '', '', '', '', '', '', ''],
      ['Total Apparel Items', `${totalItemsCount} pieces`, '', '', '', '', '', '', '', '', '', '', ''],
      ['Total Sales Volume', `${totalRevenue} EGP`, '', '', '', '', '', '', '', '', '', '', '']
    ];

    const csvContent = [
      'sep=,',
      `"FANDOM FIT - EXPORTED ORDERS REPORT",,,,,,,,,,,,`,
      `"Generated On: ${new Date().toLocaleString()}",,,,,,,,,,,,`,
      `,,,,,,,,,,,,`,
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(',')),
      ...summaryRows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fandom-fit-orders-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

          {/* Main Categories Switch */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-xl mb-6 select-none">
            <button
              type="button"
              onClick={() => {
                setMainCategory('orders');
                setActiveTab('dashboard');
              }}
              className={`py-2 px-1 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer text-center ${
                mainCategory === 'orders' 
                  ? 'bg-zinc-800 text-brand-accent shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {locale === 'ar' ? 'عمليات الطلبات' : 'Orders Tab'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMainCategory('managemental');
                setActiveTab('settings');
              }}
              className={`py-2 px-1 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer text-center ${
                mainCategory === 'managemental' 
                  ? 'bg-zinc-800 text-brand-accent shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {locale === 'ar' ? 'لوحة الإدارة' : 'Managemental'}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Tabs */}
            {[
              { id: 'dashboard', name: t('sidebar.dashboard'), icon: <LayoutDashboard size={16} />, cat: 'orders' },
              { id: 'products', name: t('sidebar.products'), icon: <ShoppingBag size={16} />, cat: 'orders' },
              { id: 'categories', name: t('sidebar.categories'), icon: <FolderOpen size={16} />, cat: 'orders' },
              { id: 'offers', name: t('sidebar.offers'), icon: <Ticket size={16} />, cat: 'orders' },
              { id: 'discounts', name: locale === 'ar' ? 'حملات الخصم' : 'Discounts', icon: <Tag size={16} />, cat: 'orders' },
              { id: 'requests', name: t('sidebar.custom_requests'), icon: <Palette size={16} />, cat: 'orders' },
              { id: 'orders', name: locale === 'ar' ? 'الطلبات' : 'Orders', icon: <ShoppingCart size={16} />, cat: 'orders' },
              { id: 'cancelled-orders', name: locale === 'ar' ? 'الطلبات الملغاة' : 'Cancelled Orders', icon: <Ban size={16} />, cat: 'orders' },
              { id: 'designs-explorer', name: locale === 'ar' ? 'التصاميم والطباعة' : 'Designs Explorer', icon: <Palette size={16} />, cat: 'orders' },
              { id: 'chats', name: locale === 'ar' ? 'المحادثات المباشرة' : 'Live Chat', icon: <MessageSquare size={16} />, cat: 'orders' },
              { id: 'email-sender', name: locale === 'ar' ? 'مرسل البريد الإلكتروني' : 'Email Sender', icon: <Mail size={16} />, cat: 'orders' },
              { id: 'users', name: locale === 'ar' ? 'إدارة المستخدمين' : 'Users Management', icon: <Users size={16} />, cat: 'managemental' },
              { id: 'analytics', name: locale === 'ar' ? 'تحليلات الموقع' : 'Web Analytics', icon: <BarChart3 size={16} />, cat: 'managemental' },
              { id: 'settings', name: t('sidebar.settings'), icon: <Settings size={16} />, cat: 'managemental' },
            ].filter(t => t.cat === mainCategory).map((tab) => (
              <button
                key={tab.id}
                onClick={() => { 
                  setActiveTab(tab.id); 
                  setIsFormOpen(false); 
                  if (tab.id === 'requests') {
                    useStore.getState().fetchAdminRequests();
                    useStore.getState().fetchUsersList();
                  } else if (tab.id === 'designs-explorer') {
                    supabase.from('product_designs').select('*').then(({ data }: any) => {
                      if (data) setAllDesigns(data);
                    });
                  } else if (tab.id === 'chats') {
                    useStore.getState().fetchAdminChats();
                    useStore.getState().fetchAutoResponses();
                  } else if (tab.id === 'users') {
                    useStore.getState().fetchUsersList();
                  } else if (tab.id === 'analytics') {
                    useStore.getState().fetchAnalyticsEvents();
                  }
                }}
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

            {/* Quick Lookup Bar */}
            <div className="bg-zinc-900 border-4 border-black p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-xl text-left font-mono">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#E07A5F] mb-2">🔍 Quick Code Lookup</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Order Code or Problem Code..."
                  value={dashboardSearchQuery}
                  onChange={(e) => setDashboardSearchQuery(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent font-mono select-text"
                />
                {dashboardSearchQuery && (
                  <button
                    onClick={() => setDashboardSearchQuery('')}
                    className="px-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {dashboardSearchQuery.trim() && (() => {
                const query = dashboardSearchQuery.trim().toLowerCase();
                const matchedOrders = orders.filter(o => {
                  const code = (o.order_code || o.id.split('-')[0]).toLowerCase();
                  const rejCode = o.rejection_reason && o.rejection_reason.toLowerCase().includes(query);
                  return code.includes(query) || !!rejCode;
                });

                if (matchedOrders.length === 0) {
                  return (
                    <p className="text-[10px] font-bold text-zinc-500 mt-3 italic">
                      No matching orders or problem codes found.
                    </p>
                  );
                }

                return (
                  <div className="mt-4 space-y-3 border-t border-zinc-850 pt-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Search Results:</span>
                    {matchedOrders.map(o => (
                      <div key={o.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-left select-text">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-mono font-bold text-xs select-all">{o.order_code || o.id.substring(0, 8)}</span>
                          <span className="px-1.5 py-0.5 bg-zinc-800 text-[8px] uppercase font-bold text-brand-accent rounded border border-zinc-700">{o.status}</span>
                        </div>
                        <div className="text-[10px] space-y-1 mt-1 text-zinc-300">
                          <p><strong className="text-zinc-500 font-bold block">Customer:</strong> {o.customer_name} ({o.customer_phone})</p>
                          {o.customer_email && <p><strong className="text-zinc-500 font-bold block">Email:</strong> {o.customer_email}</p>}
                          <p><strong className="text-zinc-500 font-bold block">Total:</strong> {o.price} EGP | <strong className="text-zinc-500 font-bold block">Payment:</strong> {o.payment_method}</p>
                          {o.rejection_reason && (
                            <p className="text-[#E07A5F] bg-[#E07A5F]/10 border border-[#E07A5F]/20 p-1.5 rounded mt-1 font-mono text-[9px] whitespace-pre-wrap">
                              {o.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* ────── OUT-OF-STOCK & LOW STOCK ALERTS ────── */}
            {(() => {
              const goodThresh = Number(settings.good_stock_threshold ?? settingsForm.good_stock_threshold ?? 10);
              const lowThresh  = Number(settings.low_stock_threshold  ?? settingsForm.low_stock_threshold  ?? 3);
              const oosProducts = products.filter(p => {
                const hasSizes = (p.available_sizes || []).length > 0;
                const total = (p.available_sizes || []).reduce((s, sz) => s + ((p.stock_quantities as any)?.[sz] ?? 0), 0);
                return !p.is_in_stock || (hasSizes && total === 0);
              });
              const lowStockProducts = products.filter(p => {
                const hasSizes = (p.available_sizes || []).length > 0;
                const total = (p.available_sizes || []).reduce((s, sz) => s + ((p.stock_quantities as any)?.[sz] ?? 0), 0);
                const isOOS = !p.is_in_stock || (hasSizes && total === 0);
                return !isOOS && total < lowThresh;
              });
              return (
                <>
                  {oosProducts.length > 0 && (
                    <div className="bg-zinc-900 border border-zinc-700 border-l-4 border-l-zinc-500 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">⬛</span>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-300">
                          {oosProducts.length} Product{oosProducts.length !== 1 ? 's' : ''} Out of Stock
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {oosProducts.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActiveTab('products');
                              setEditingItem(p);
                              setTagsText((p.tags || []).join(', '));
                              setQueuedDesigns([]);
                              setProdForm({ ...p, sale_price: p.sale_price || '', is_pinned: p.is_pinned || false, gives_cotton_reward: p.gives_cotton_reward || false, is_soon: p.is_soon || false, is_preorder: p.is_preorder || false, fit_type: p.fit_type || 'both', stock_quantities: p.stock_quantities || {} });
                              setIsFormOpen(true);
                            }}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full text-[10px] font-bold text-zinc-300 cursor-pointer transition-colors"
                          >
                            {p.name_en}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {lowStockProducts.length > 0 && (
                    <div className="bg-rose-950/20 border border-rose-900/40 border-l-4 border-l-rose-500 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">🔴</span>
                        <span className="text-xs font-black uppercase tracking-widest text-rose-300">
                          {lowStockProducts.length} Product{lowStockProducts.length !== 1 ? 's' : ''} Running Low (below {lowThresh} units)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {lowStockProducts.map(p => {
                          const total = (p.available_sizes || []).reduce((s, sz) => s + ((p.stock_quantities as any)?.[sz] ?? 0), 0);
                          return (
                            <button
                              key={p.id}
                              onClick={() => {
                                setActiveTab('products');
                                setEditingItem(p);
                                setTagsText((p.tags || []).join(', '));
                                setQueuedDesigns([]);
                                setProdForm({ ...p, sale_price: p.sale_price || '', is_pinned: p.is_pinned || false, gives_cotton_reward: p.gives_cotton_reward || false, is_soon: p.is_soon || false, is_preorder: p.is_preorder || false, fit_type: p.fit_type || 'both', stock_quantities: p.stock_quantities || {} });
                                setIsFormOpen(true);
                              }}
                              className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900/60 rounded-full text-[10px] font-bold text-rose-300 cursor-pointer transition-colors"
                            >
                              {p.name_en} <span className="text-rose-500">({total})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {oosProducts.length === 0 && lowStockProducts.length === 0 && products.length > 0 && (
                    <div className="bg-emerald-950/20 border border-emerald-900/40 border-l-4 border-l-emerald-500 rounded-xl p-3 flex items-center gap-2">
                      <span>🟢</span>
                      <span className="text-xs font-bold text-emerald-300">All products are well stocked!</span>
                    </div>
                  )}
                </>
              );
            })()}

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
                    setQueuedDesigns([]);
                    setTagsText(settingsForm.default_tags || '');
                    const defaultSizes = settingsForm.default_sizes 
                      ? settingsForm.default_sizes.split(',').map(s => s.trim()) 
                      : ['S', 'M', 'L', 'XL'];
                    const defaultFabrics = settingsForm.default_fabrics 
                      ? settingsForm.default_fabrics.split(',').map(f => f.trim()) 
                      : ['Standard Cotton', 'Premium Cotton'];
                    setProdForm({
                      name_en: '', name_ar: '', description_en: '', description_ar: '',
                      category_id: categories[0]?.id || '', price: 0, sale_price: '',
                      is_in_stock: true, is_featured: false, is_trending: false,
                      is_new_arrival: true, is_best_seller: false, is_limited_edition: false,
                      is_pinned: false,
                      gives_cotton_reward: false,
                      is_soon: false,
                      is_preorder: false,
                      available_sizes: defaultSizes,
                      material_options: defaultFabrics,
                      images: [], display_order: 0,
                      fit_type: 'both',
                      stock_quantities: {}
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

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                      onChange={(e) => {
                        const newCatId = e.target.value;
                        const cat = categories.find(c => c.id === newCatId);
                        let sizes = prodForm.available_sizes;
                        let fabrics = prodForm.material_options;
                        let tags = tagsText;

                        if (cat) {
                          if ((cat as any).default_sizes) {
                            sizes = (cat as any).default_sizes.split(',').map((s: string) => s.trim());
                          }
                          if ((cat as any).default_fabrics) {
                            fabrics = (cat as any).default_fabrics.split(',').map((f: string) => f.trim());
                          }
                          if ((cat as any).default_tags) {
                            tags = (cat as any).default_tags;
                          }
                        }

                        setTagsText(tags);
                        setProdForm({
                          ...prodForm,
                          category_id: newCatId,
                          available_sizes: sizes,
                          material_options: fabrics
                        });
                      }}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name_en}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        const cat = categories.find(c => c.id === prodForm.category_id);
                        let sizesStr = settingsForm.default_sizes || 'S, M, L, XL, XXL';
                        let fabricsStr = settingsForm.default_fabrics || 'Standard Cotton, Premium Cotton';
                        let tagsStr = settingsForm.default_tags || 'New Drop';

                        if (cat) {
                          if ((cat as any).default_sizes) sizesStr = (cat as any).default_sizes;
                          if ((cat as any).default_fabrics) fabricsStr = (cat as any).default_fabrics;
                          if ((cat as any).default_tags) tagsStr = (cat as any).default_tags;
                        }

                        setTagsText(tagsStr);
                        setProdForm({
                          ...prodForm,
                          available_sizes: sizesStr.split(',').map(s => s.trim()),
                          material_options: fabricsStr.split(',').map(f => f.trim())
                        });
                      }}
                      className="text-[9px] font-black uppercase text-brand-accent hover:underline mt-1.5 block cursor-pointer"
                    >
                      Reset options to Category/Global Defaults
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Fit Type Option</label>
                    <select
                      value={prodForm.fit_type || 'both'}
                      onChange={(e) => setProdForm({ ...prodForm, fit_type: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent cursor-pointer"
                    >
                      <option value="both">Both (Regular & Oversized)</option>
                      <option value="oversized">Oversized Only</option>
                      <option value="regular">Regular Only</option>
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

                    {/* Size Stock Levels */}
                    {prodForm.available_sizes.length > 0 && (
                      <div className="pt-3 border-t border-zinc-900">
                        <p className="text-[9px] uppercase font-bold text-zinc-500 mb-2">Stock per Size</p>
                        <div className="flex flex-wrap gap-2">
                          {prodForm.available_sizes.map((size) => {
                            const qty = (prodForm.stock_quantities as any)?.[size] ?? 0;
                            const goodThresh = settingsForm.good_stock_threshold || 10;
                            const lowThresh = settingsForm.low_stock_threshold || 3;
                            const dotColor = qty === 0
                              ? 'bg-zinc-500'
                              : qty < lowThresh
                              ? 'bg-rose-500'
                              : qty < goodThresh
                              ? 'bg-amber-400'
                              : 'bg-emerald-500';
                            return (
                              <div key={size} className="bg-zinc-900 px-2.5 py-2 rounded-lg border border-zinc-800 flex flex-col items-center gap-1.5 min-w-[60px]">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                                  <span className="text-[10px] font-mono font-black text-zinc-300">{size}</span>
                                </div>
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="0"
                                  value={qty}
                                  onChange={(e) => {
                                    const newQty = Math.max(0, parseInt(e.target.value) || 0);
                                    setProdForm(prev => ({
                                      ...prev,
                                      stock_quantities: {
                                        ...((prev.stock_quantities || {}) as any),
                                        [size]: newQty
                                      }
                                    }));
                                  }}
                                  className="w-14 px-1.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-white text-xs font-mono text-center focus:outline-none focus:border-brand-accent"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                  <label className="flex items-center gap-2 text-xs font-bold text-purple-400">
                    <input 
                      type="checkbox" 
                      checked={prodForm.is_soon || false}
                      onChange={(e) => setProdForm({ ...prodForm, is_soon: e.target.checked })}
                      className="accent-purple-400" 
                    />
                    🕐 {locale === 'ar' ? 'قريباً (Coming Soon)' : 'Coming Soon'}
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <input 
                      type="checkbox" 
                      checked={prodForm.is_preorder || false}
                      onChange={(e) => setProdForm({ ...prodForm, is_preorder: e.target.checked })}
                      className="accent-blue-400" 
                    />
                    🛒 {locale === 'ar' ? 'طلب مسبق (Pre-Order)' : 'Pre-Order'}
                  </label>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Custom Tags (Comma Separated)</label>
                    {prodForm.images && prodForm.images.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const tagsList = tagsText.split(',').map(s => s.trim()).filter(Boolean);
                          if (tagsList.length > 0) {
                            let firstTag = tagsList[0];
                            try {
                              if (firstTag.startsWith('{')) {
                                firstTag = JSON.parse(firstTag).name;
                              }
                            } catch(err) {}
                            setSelectedTagToPosition(firstTag);
                          }
                          setIsTagPositionerOpen(true);
                        }}
                        className="px-2 py-0.5 bg-brand-accent text-white hover:bg-brand-accent/90 rounded text-[9px] font-black uppercase transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        📐 Position Tags Visually
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {/* Modern Badge Tag List */}
                    <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-850 rounded-lg min-h-[40px] items-center">
                      {splitTagsText(tagsText).map((tagVal, i) => {
                        let displayName = tagVal;
                        let isCustomPos = false;
                        try {
                          if (tagVal.startsWith('{')) {
                            const parsed = JSON.parse(tagVal);
                            displayName = parsed.name;
                            isCustomPos = parsed.posX !== null;
                          }
                        } catch(e) {}
                        if (!displayName) return null;
                        return (
                          <span key={i} className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            isCustomPos 
                              ? 'bg-amber-950/40 text-amber-400 border-amber-900'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                          }`}>
                            {displayName} {isCustomPos && '📍'}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = splitTagsText(tagsText).filter(t => t !== tagVal);
                                setTagsText(updated.join(', '));
                              }}
                              className="text-zinc-500 hover:text-red-400 font-extrabold cursor-pointer text-xs"
                            >
                              &times;
                            </button>
                          </span>
                        );
                      })}
                      
                      <input
                        type="text"
                        placeholder="Add new tag & press Enter/Comma..."
                        onKeyDown={(e) => {
                          if (e.key === ',' || e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (!val) return;
                            const existing = splitTagsText(tagsText);
                            // Avoid duplicate names (even if position is set)
                            const names = existing.map(t => {
                              try {
                                if (t.startsWith('{')) return JSON.parse(t).name;
                              } catch(err) {}
                              return t;
                            });
                            if (!names.includes(val)) {
                              setTagsText([...existing, val].join(', '));
                            }
                            e.currentTarget.value = '';
                          }
                        }}
                        className="bg-transparent border-none outline-none text-white text-xs flex-1 min-w-[120px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Images Upload Mock */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('products.fields.images')}</label>
                  
                  {/* Uploader & Url bar */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image link URL here..."
                      value={imageLinkInput}
                      onChange={(e) => setImageLinkInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = imageLinkInput.trim();
                        if (trimmed) {
                          setProdForm({ ...prodForm, images: [...prodForm.images, trimmed] });
                          setImageLinkInput('');
                        }
                      }}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer shrink-0"
                    >
                      Add URL
                    </button>
                    <label className="px-3 py-2 bg-brand-accent hover:bg-brand-accent/90 border border-brand-accent text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1 shrink-0 transition-colors">
                      ⬆ Upload File
                      <input 
                        type="file" 
                        multiple
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Thumbnail Previews */}
                  {prodForm.images.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                      {prodForm.images.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 border border-zinc-800 rounded bg-zinc-900 overflow-hidden shrink-0 group/img">
                          <Image src={img} alt="upload-preview" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => setProdForm({ ...prodForm, images: prodForm.images.filter((_, i) => i !== idx) })}
                            className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 cursor-pointer border border-black shadow"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Designs Section (Admin Only) */}
                <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl space-y-4">
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
                    <label className="text-[10px] uppercase font-black text-brand-accent tracking-wider flex items-center gap-1.5">
                      🔒 Product Designs (Admin Eye Only)
                    </label>
                    <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono uppercase">
                      {isUsingMock ? 'Sandbox Storage' : 'Secure Private Bucket'}
                    </span>
                  </div>

                  {/* Current designs list */}
                  {((editingItem ? productDesigns : queuedDesigns) || []).length > 0 ? (
                    <div className="space-y-2">
                      {((editingItem ? productDesigns : queuedDesigns) || []).map((design, idx) => {
                        const isEditingThis = editingItem 
                          ? (design.id === editingDesignId)
                          : (idx === editingDesignIdx);

                        return (
                          <div key={design.id || idx} className="flex items-center justify-between p-2.5 bg-zinc-900 rounded border border-zinc-850 gap-4">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Visual Thumbnail if it's an image */}
                              <div className="relative w-9 h-9 bg-zinc-950 border border-zinc-800 rounded overflow-hidden shrink-0 flex items-center justify-center">
                                {design.design_url.startsWith('data:image') || design.design_url.includes('.jpg') || design.design_url.includes('.png') || design.design_url.includes('.webp') || design.design_url.startsWith('blob:') ? (
                                  <Image src={design.design_url} alt="design-thumb" fill className="object-cover" />
                                ) : (
                                  <span className="text-[10px] text-zinc-500 font-black">FILE</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                {isEditingThis ? (
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      value={editingDesignNotes}
                                      onChange={(e) => setEditingDesignNotes(e.target.value)}
                                      className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white text-xs focus:outline-none flex-1 font-bold"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveDesignNotes(design, idx)}
                                      className="p-1 text-green-500 hover:bg-zinc-800 rounded"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingDesignId(null);
                                        setEditingDesignIdx(null);
                                      }}
                                      className="p-1 text-zinc-400 hover:bg-zinc-800 rounded"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-xs font-bold text-white block truncate">{design.notes}</span>
                                    <a 
                                      href={design.design_url} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="text-[9px] font-black text-brand-accent hover:underline block truncate max-w-[200px]"
                                    >
                                      View / Download Design Source File
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {!isEditingThis && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditDesign(design, idx)}
                                  className="p-1 text-zinc-500 hover:text-brand-accent transition-colors cursor-pointer"
                                  title="Edit notes"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDesign(design.id, idx)}
                                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Delete design"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-600 font-semibold italic text-center py-2">No design mockups or print files uploaded yet.</p>
                  )}

                  {/* Add new design uploader */}
                  <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-850/70 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Design Label / Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Front Chest Print PSD, Back Mockup"
                          value={designNotesInput}
                          onChange={(e) => setDesignNotesInput(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Add Design File Link (Optional)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Paste design URL or Google Drive link..."
                            value={designUrlInput}
                            onChange={(e) => setDesignUrlInput(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white text-xs focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddDesignLink}
                            disabled={!designUrlInput.trim()}
                            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white rounded text-[10px] uppercase font-black cursor-pointer shrink-0 transition-colors border border-zinc-700"
                          >
                            Add Link
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* File uploader */}
                    <div className="pt-2 border-t border-zinc-855 flex justify-between items-center gap-3">
                      <span className="text-[9px] text-zinc-500 font-semibold">Or upload print files / mockups directly:</span>
                      <label className="px-3 py-1.5 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white rounded text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors shrink-0">
                        {isUploadingDesign ? 'Uploading...' : '⬆ Upload Design File'}
                        <input 
                          type="file" 
                          multiple
                          disabled={isUploadingDesign}
                          onChange={handleDesignUpload} 
                          className="hidden" 
                        />
                      </label>
                    </div>
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
              <div className="space-y-6">
                
                {/* ⚡ Bulk Edit Products Panel */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setIsBulkEditOpen(!isBulkEditOpen)}
                    className="w-full flex justify-between items-center p-4 text-xs font-black uppercase text-white bg-zinc-850 hover:bg-zinc-800 cursor-pointer select-none transition-colors border-b border-zinc-800"
                  >
                    <span className="flex items-center gap-2">
                      ⚡ Bulk Edit Products Tool (Update multiple items at once)
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">{isBulkEditOpen ? '▲ Close Tool' : '▼ Open Tool'}</span>
                  </button>

                  {isBulkEditOpen && (
                    <form onSubmit={handleBulkUpdate} className="p-4 sm:p-6 space-y-6 bg-zinc-900/60 border-t border-zinc-800">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Column 1: Target Scope */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-brand-accent pb-1 border-b border-zinc-800">1. Target Scope</h4>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block">Update target products</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name="bulk-target"
                                  checked={bulkTargetType === 'all'}
                                  onChange={() => setBulkTargetType('all')}
                                  className="accent-brand-accent"
                                />
                                All Products
                              </label>
                              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name="bulk-target"
                                  checked={bulkTargetType === 'category'}
                                  onChange={() => setBulkTargetType('category')}
                                  className="accent-brand-accent"
                                />
                                By Category
                              </label>
                            </div>
                          </div>

                          {bulkTargetType === 'category' && (
                            <div>
                              <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Select Target Category</label>
                              <select
                                value={bulkCategoryId}
                                onChange={(e) => setBulkCategoryId(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent cursor-pointer font-mono"
                              >
                                <option value="">-- Choose Category --</option>
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>{c.name_en}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* Column 2: Fields to Change */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-brand-accent pb-1 border-b border-zinc-800">2. Values to Modify</h4>
                          
                          <p className="text-[9px] text-zinc-500 uppercase leading-relaxed">
                            Check the boxes next to each attribute you want to overwrite, select the new values, and click run. Checked items will overwrite target products.
                          </p>

                          <div className="space-y-4">
                            {/* Option 1: Sizes */}
                            <div className="bg-zinc-950 p-3 border border-zinc-850 rounded-xl space-y-2">
                              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bulkUpdateSizesEnabled}
                                  onChange={(e) => setBulkUpdateSizesEnabled(e.target.checked)}
                                  className="accent-brand-accent"
                                />
                                Overwrite Sizes List
                              </label>
                              {bulkUpdateSizesEnabled && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {sizeOptions.map(sz => {
                                    const checked = bulkSizes.includes(sz);
                                    return (
                                      <button
                                        type="button"
                                        key={sz}
                                        onClick={() => {
                                          const next = checked ? bulkSizes.filter(s => s !== sz) : [...bulkSizes, sz];
                                          setBulkSizes(next);
                                        }}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                          checked ? 'bg-brand-accent text-white border-brand-accent' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                                        }`}
                                      >
                                        {sz}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Option 2: Fabrics */}
                            <div className="bg-zinc-950 p-3 border border-zinc-850 rounded-xl space-y-2">
                              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bulkUpdateFabricsEnabled}
                                  onChange={(e) => setBulkUpdateFabricsEnabled(e.target.checked)}
                                  className="accent-brand-accent"
                                />
                                Overwrite Material Options
                              </label>
                              {bulkUpdateFabricsEnabled && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {fabricOptions.map(fb => {
                                    const checked = bulkFabrics.includes(fb);
                                    return (
                                      <button
                                        type="button"
                                        key={fb}
                                        onClick={() => {
                                          const next = checked ? bulkFabrics.filter(f => f !== fb) : [...bulkFabrics, fb];
                                          setBulkFabrics(next);
                                        }}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                          checked ? 'bg-brand-accent text-white border-brand-accent' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                                        }`}
                                      >
                                        {fb}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Option 3: Fit Type */}
                            <div className="bg-zinc-950 p-3 border border-zinc-850 rounded-xl space-y-2">
                              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bulkUpdateFitTypeEnabled}
                                  onChange={(e) => setBulkUpdateFitTypeEnabled(e.target.checked)}
                                  className="accent-brand-accent"
                                />
                                Overwrite Fit Type Option
                              </label>
                              {bulkUpdateFitTypeEnabled && (
                                <select
                                  value={bulkFitType}
                                  onChange={(e) => setBulkFitType(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] cursor-pointer"
                                >
                                  <option value="both">Both (Regular & Oversized)</option>
                                  <option value="oversized">Oversized Only</option>
                                  <option value="regular">Regular Only</option>
                                </select>
                              )}
                            </div>

                            {/* Option 4: Custom Tags */}
                            <div className="bg-zinc-950 p-3 border border-zinc-850 rounded-xl space-y-2">
                              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bulkUpdateTagsEnabled}
                                  onChange={(e) => setBulkUpdateTagsEnabled(e.target.checked)}
                                  className="accent-brand-accent"
                                />
                                Overwrite Custom Tags
                              </label>
                              {bulkUpdateTagsEnabled && (
                                <input
                                  type="text"
                                  placeholder="e.g. Hot, Summer Drop, anime"
                                  value={bulkTags}
                                  onChange={(e) => setBulkTags(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] focus:outline-none"
                                />
                              )}
                            </div>

                            {/* Option 5: Price */}
                            <div className="bg-zinc-950 p-3 border border-zinc-850 rounded-xl space-y-2">
                              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bulkUpdatePriceEnabled}
                                  onChange={(e) => setBulkUpdatePriceEnabled(e.target.checked)}
                                  className="accent-brand-accent"
                                />
                                Overwrite Price (EGP)
                              </label>
                              {bulkUpdatePriceEnabled && (
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="e.g. 450"
                                  value={bulkPrice}
                                  onChange={(e) => setBulkPrice(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] focus:outline-none"
                                />
                              )}
                            </div>

                            {/* Option 6: Sale Price */}
                            <div className="bg-zinc-950 p-3 border border-zinc-850 rounded-xl space-y-2">
                              <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bulkUpdateSalePriceEnabled}
                                  onChange={(e) => setBulkUpdateSalePriceEnabled(e.target.checked)}
                                  className="accent-brand-accent"
                                />
                                Overwrite Sale Price (EGP)
                              </label>
                              {bulkUpdateSalePriceEnabled && (
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="Leave blank to clear sale price, or enter e.g. 390"
                                  value={bulkSalePrice}
                                  onChange={(e) => setBulkSalePrice(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] focus:outline-none"
                                />
                              )}
                            </div>

                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-zinc-800">
                        <button
                          type="submit"
                          className="px-5 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-[10px] cursor-pointer shadow transition-colors"
                        >
                          ⚡ Run Bulk Update
                        </button>
                      </div>

                    </form>
                  )}
                </div>

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
                    {products.map((p) => {
                      const totalStock = (p.available_sizes || []).reduce(
                        (sum, sz) => sum + ((p.stock_quantities as any)?.[sz] ?? 0), 0
                      );
                      const goodThresh = Number(settings.good_stock_threshold ?? settingsForm.good_stock_threshold ?? 10);
                      const lowThresh  = Number(settings.low_stock_threshold  ?? settingsForm.low_stock_threshold  ?? 3);
                      const hasSizes = (p.available_sizes || []).length > 0;
                      const isOOS = !p.is_in_stock || (hasSizes && totalStock === 0);
                      const rowBorder = isOOS
                        ? 'border-l-4 border-l-zinc-600'
                        : totalStock < lowThresh
                        ? 'border-l-4 border-l-rose-500'
                        : totalStock < goodThresh
                        ? 'border-l-4 border-l-amber-400'
                        : 'border-l-4 border-l-emerald-500';
                      return (
                        <tr key={p.id} className={`hover:bg-zinc-800/20 text-zinc-300 ${rowBorder} ${p.is_hidden ? 'opacity-40 select-none' : ''}`}>
                          {/* Product name + image */}
                          <td className="p-4 font-bold">
                            <div className="flex items-center gap-3">
                              <div className="relative w-8 h-8 rounded border border-zinc-800 bg-zinc-950 overflow-hidden shrink-0">
                                <Image
                                  src={p.images?.[0] || '/placeholders/arcade_front.jpg'}
                                  alt={p.name_en}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="flex items-center gap-1.5">
                                  {p.name_en}
                                  {p.is_hidden && (
                                    <span className="px-1 py-0.5 bg-red-950/80 text-red-400 border border-red-900 rounded text-[8px] font-black uppercase tracking-wider shrink-0 font-sans">
                                      Hidden / مخفي
                                    </span>
                                  )}
                                </span>
                              </div>
                              {p.gives_cotton_reward && (
                                <span className="px-1.5 py-0.5 bg-[#E07A5F]/20 text-[#E07A5F] border border-[#E07A5F]/40 rounded text-[9px] font-black uppercase tracking-wide shrink-0">
                                  🧶 Cotton
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Category */}
                          <td className="p-4">
                            {categories.find(c => c.id === p.category_id)?.name_en || 'Uncategorized'}
                          </td>
                          {/* Price */}
                          <td className="p-4">
                            {p.price} EGP
                          </td>
                          {/* Stock status */}
                          <td className="p-4">
                            <div className="flex flex-col gap-1.5">
                              <span className={`inline-block w-max px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                isOOS
                                  ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                  : totalStock < lowThresh
                                  ? 'bg-rose-950/50 text-rose-400 border border-rose-900'
                                  : totalStock < goodThresh
                                  ? 'bg-amber-950/50 text-amber-400 border border-amber-900'
                                  : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900'
                              }`}>
                                {isOOS ? '⬛ Out of Stock' : totalStock < lowThresh ? '🔴 Low' : totalStock < goodThresh ? '🟡 Medium' : '🟢 Good'}
                              </span>
                              {hasSizes && p.stock_quantities && (
                                <div className="flex flex-wrap gap-1">
                                  {(p.available_sizes || []).map(sz => {
                                    const q = (p.stock_quantities as any)?.[sz] ?? 0;
                                    return (
                                      <span key={sz} className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                        q === 0 ? 'border-zinc-700 text-zinc-500 bg-zinc-900' :
                                        q < lowThresh ? 'border-rose-900/60 text-rose-400 bg-rose-950/20' :
                                        q < goodThresh ? 'border-amber-900/60 text-amber-400 bg-amber-950/20' :
                                        'border-emerald-900/60 text-emerald-400 bg-emerald-950/20'
                                      }`}>
                                        {sz}:{q}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  await updateProduct(p.id, { is_hidden: !p.is_hidden });
                                }}
                                className={`p-1.5 hover:bg-zinc-800 rounded cursor-pointer transition-colors ${
                                  p.is_hidden ? 'text-rose-500 hover:text-rose-400' : 'text-zinc-400 hover:text-white'
                                }`}
                                title={p.is_hidden ? 'Unhide Product / إظهار المنتج' : 'Hide Product / إخفاء المنتج'}
                              >
                                {p.is_hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingItem(p);
                                  setTagsText((p.tags || []).join(', '));
                                  setQueuedDesigns([]);
                                  setProdForm({
                                    ...p,
                                    sale_price: p.sale_price || '',
                                    is_pinned: p.is_pinned || false,
                                    gives_cotton_reward: p.gives_cotton_reward || false,
                                    is_soon: p.is_soon || false,
                                    is_preorder: p.is_preorder || false,
                                    fit_type: p.fit_type || 'both',
                                    stock_quantities: p.stock_quantities || {}
                                  });
                                  setIsFormOpen(true);
                                }}
                                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(p.id)}
                                className="p-1.5 hover:bg-red-950/30 rounded text-zinc-400 hover:text-red-400 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>
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
                      name_en: '', name_ar: '', slug: '', display_order: categories.length + 1, is_hidden: false, show_in_browse: true,
                      default_sizes: '', default_fabrics: '', default_tags: ''
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
                  <div className="flex items-end pb-2 flex-col gap-2 justify-center">
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                      <input 
                        type="checkbox" 
                        checked={catForm.is_hidden}
                        onChange={(e) => setCatForm({ ...catForm, is_hidden: e.target.checked })}
                        className="accent-brand-accent animate-none" 
                      />
                      {t('categories.is_hidden')}
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                      <input 
                        type="checkbox" 
                        checked={catForm.show_in_browse || false}
                        onChange={(e) => setCatForm({ ...catForm, show_in_browse: e.target.checked })}
                        className="accent-brand-accent animate-none" 
                      />
                      Show in Browse by Fandom
                    </label>
                  </div>
                </div>

                {/* Category-level Defaults (Request 9) */}
                <div className="border-t border-zinc-800 pt-3 mt-3 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-zinc-400">Category Defaults</h4>
                  
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Default Sizes (e.g. S, M, L)</label>
                    <input
                      type="text"
                      placeholder="e.g. S, M, L, XL"
                      value={catForm.default_sizes || ''}
                      onChange={(e) => setCatForm({ ...catForm, default_sizes: e.target.value })}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Default Fabrics (e.g. Standard Cotton)</label>
                    <input
                      type="text"
                      placeholder="e.g. Standard Cotton, Premium Cotton"
                      value={catForm.default_fabrics || ''}
                      onChange={(e) => setCatForm({ ...catForm, default_fabrics: e.target.value })}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Default Tags (e.g. New Drop)</label>
                    <input
                      type="text"
                      placeholder="e.g. New Drop, anime"
                      value={catForm.default_tags || ''}
                      onChange={(e) => setCatForm({ ...catForm, default_tags: e.target.value })}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
                    />
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
                              setCatForm({
                                name_en: c.name_en,
                                name_ar: c.name_ar,
                                slug: c.slug,
                                display_order: c.display_order,
                                is_hidden: c.is_hidden,
                                show_in_browse: c.show_in_browse !== false,
                                default_sizes: (c as any).default_sizes || '',
                                default_fabrics: (c as any).default_fabrics || '',
                                default_tags: (c as any).default_tags || ''
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

            {/* Expandable Auto-Applied campaigns & special conditions panel (Request 10) */}
            <div className="mt-8 border border-zinc-800 bg-zinc-900 rounded-2xl overflow-hidden max-w-2xl">
              <button
                type="button"
                onClick={() => setIsAutoOffersOpen(!isAutoOffersOpen)}
                className="w-full flex justify-between items-center p-4 text-sm font-black uppercase text-white bg-zinc-850 hover:bg-zinc-800 cursor-pointer select-none transition-colors border-b border-zinc-800"
              >
                <span className="flex items-center gap-2">
                  🏷️ Auto-Applied Campaigns & Special Offers ({autoOffers.length})
                </span>
                <span>{isAutoOffersOpen ? '▲ Collapse' : '▼ Expand & Edit'}</span>
              </button>

              {isAutoOffersOpen && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] text-zinc-400 uppercase leading-relaxed max-w-md">
                      Setup automated multi-buy, tag-based, or conditional order discounts that apply instantly during shopping cart and checkout flows.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const newOffer = {
                          id: `ao-${Date.now()}`,
                          name_en: 'New Promo Offer',
                          name_ar: 'عرض ترويجي جديد',
                          type: 'quantity', // 'quantity' | 'tag' | 'both'
                          min_quantity: 2,
                          required_tag: '',
                          discount_percent: 10,
                          is_active: true
                        };
                        const nextList = [...autoOffers, newOffer];
                        setAutoOffers(nextList);
                        setSettingsForm(prev => ({ ...prev, auto_applied_offers: JSON.stringify(nextList) }));
                      }}
                      className="px-3 py-1.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded text-[10px] font-bold uppercase cursor-pointer transition-colors"
                    >
                      + Add Campaign
                    </button>
                  </div>

                  <div className="space-y-4">
                    {autoOffers.map((offer, idx) => (
                      <div key={offer.id} className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => {
                            const nextList = autoOffers.filter(o => o.id !== offer.id);
                            setAutoOffers(nextList);
                            setSettingsForm(prev => ({ ...prev, auto_applied_offers: JSON.stringify(nextList) }));
                          }}
                          className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 cursor-pointer transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Campaign Name (English)</label>
                            <input
                              type="text"
                              value={offer.name_en || ''}
                              onChange={(e) => {
                                const nextList = autoOffers.map((o, i) => i === idx ? { ...o, name_en: e.target.value } : o);
                                setAutoOffers(nextList);
                                setSettingsForm(prev => ({ ...prev, auto_applied_offers: JSON.stringify(nextList) }));
                              }}
                              className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Campaign Name (Arabic)</label>
                            <input
                              type="text"
                              dir="rtl"
                              value={offer.name_ar || ''}
                              onChange={(e) => {
                                const nextList = autoOffers.map((o, i) => i === idx ? { ...o, name_ar: e.target.value } : o);
                                setAutoOffers(nextList);
                                setSettingsForm(prev => ({ ...prev, auto_applied_offers: JSON.stringify(nextList) }));
                              }}
                              className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] text-right font-arabic"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Discount Type</label>
                            <select
                              value={offer.type || 'quantity'}
                              onChange={(e) => {
                                const nextList = autoOffers.map((o, i) => i === idx ? { ...o, type: e.target.value } : o);
                                setAutoOffers(nextList);
                                setSettingsForm(prev => ({ ...prev, auto_applied_offers: JSON.stringify(nextList) }));
                              }}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] focus:outline-none"
                            >
                              <option value="quantity">Min Quantity</option>
                              <option value="tag">Required Tag</option>
                              <option value="both">Both</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Min Qty</label>
                            <input
                              type="number"
                              value={offer.min_quantity ?? 1}
                              onChange={(e) => {
                                const nextList = autoOffers.map((o, i) => i === idx ? { ...o, min_quantity: Number(e.target.value) } : o);
                                setAutoOffers(nextList);
                                setSettingsForm(prev => ({ ...prev, auto_applied_offers: JSON.stringify(nextList) }));
                              }}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Required Tag</label>
                            <input
                              type="text"
                              value={offer.required_tag || ''}
                              onChange={(e) => {
                                const nextList = autoOffers.map((o, i) => i === idx ? { ...o, required_tag: e.target.value } : o);
                                setAutoOffers(nextList);
                                setSettingsForm(prev => ({ ...prev, auto_applied_offers: JSON.stringify(nextList) }));
                              }}
                              placeholder="e.g. anime"
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Discount %</label>
                            <input
                              type="number"
                              value={offer.discount_percent ?? 10}
                              onChange={(e) => {
                                const nextList = autoOffers.map((o, i) => i === idx ? { ...o, discount_percent: Number(e.target.value) } : o);
                                setAutoOffers(nextList);
                                setSettingsForm(prev => ({ ...prev, auto_applied_offers: JSON.stringify(nextList) }));
                              }}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 h-7">
                            <input
                              type="checkbox"
                              checked={!!offer.is_active}
                              onChange={(e) => {
                                const nextList = autoOffers.map((o, i) => i === idx ? { ...o, is_active: e.target.checked } : o);
                                setAutoOffers(nextList);
                                setSettingsForm(prev => ({ ...prev, auto_applied_offers: JSON.stringify(nextList) }));
                              }}
                              className="accent-brand-accent cursor-pointer"
                            />
                            <span className="text-[9px] uppercase font-bold text-zinc-400">Active</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-zinc-850">
                    <button
                      type="button"
                      onClick={async () => {
                        const finalSettings = { ...settings, auto_applied_offers: JSON.stringify(autoOffers) };
                        await saveSettings(finalSettings);
                        alert('Auto-applied Campaigns Saved successfully!');
                      }}
                      className="px-6 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-xs cursor-pointer transition-colors"
                    >
                      Save Auto-Applied Campaigns
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Order Threshold Discounts Panel */}
            <div className="mt-6 border border-zinc-800 bg-zinc-900 rounded-2xl overflow-hidden max-w-2xl">
              <button
                type="button"
                onClick={() => setIsThresholdOffersOpen(!isThresholdOffersOpen)}
                className="w-full flex justify-between items-center p-4 text-sm font-black uppercase text-white bg-zinc-850 hover:bg-zinc-800 cursor-pointer select-none transition-colors border-b border-zinc-800"
              >
                <span className="flex items-center gap-2">
                  💰 Order Amount Threshold Discounts ({thresholdOffers.filter(o => o.is_active).length} active)
                </span>
                <span>{isThresholdOffersOpen ? '▲ Collapse' : '▼ Expand & Edit'}</span>
              </button>

              {isThresholdOffersOpen && (
                <div className="p-4 sm:p-6 space-y-5">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] text-zinc-400 uppercase leading-relaxed max-w-md">
                      Set discount conditions based on cart total. When a customer's order exceeds the minimum, the discount applies automatically.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const newOffer = {
                          id: `thresh-${Date.now()}`,
                          min_order_amount: 500,
                          discount_type: 'percentage', // 'percentage' | 'fixed' | 'free_delivery'
                          discount_value: 10,
                          label_en: 'Order Discount',
                          label_ar: 'خصم على الطلب',
                          is_active: true
                        };
                        const nextList = [...thresholdOffers, newOffer];
                        setThresholdOffers(nextList);
                      }}
                      className="px-3 py-1.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded text-[10px] font-bold uppercase cursor-pointer transition-colors shrink-0"
                    >
                      + Add Threshold
                    </button>
                  </div>

                  <div className="space-y-4">
                    {thresholdOffers.map((offer, idx) => (
                      <div key={offer.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => setThresholdOffers(thresholdOffers.filter((_, i) => i !== idx))}
                          className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Min Order Amount (EGP)</label>
                            <input
                              type="number" min={0}
                              value={offer.min_order_amount}
                              onChange={(e) => {
                                const next = [...thresholdOffers];
                                next[idx] = { ...next[idx], min_order_amount: Number(e.target.value) };
                                setThresholdOffers(next);
                              }}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Discount Type</label>
                            <select
                              value={offer.discount_type}
                              onChange={(e) => {
                                const next = [...thresholdOffers];
                                next[idx] = { ...next[idx], discount_type: e.target.value };
                                setThresholdOffers(next);
                              }}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                            >
                              <option value="percentage">Percentage (%)</option>
                              <option value="fixed">Fixed Amount (EGP)</option>
                              <option value="free_delivery">Free Delivery</option>
                            </select>
                          </div>
                        </div>

                        {offer.discount_type !== 'free_delivery' && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">
                                {offer.discount_type === 'percentage' ? 'Discount %' : 'Discount Amount (EGP)'}
                              </label>
                              <input
                                type="number" min={0}
                                value={offer.discount_value}
                                onChange={(e) => {
                                  const next = [...thresholdOffers];
                                  next[idx] = { ...next[idx], discount_value: Number(e.target.value) };
                                  setThresholdOffers(next);
                                }}
                                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Label (English)</label>
                              <input
                                type="text"
                                value={offer.label_en || ''}
                                onChange={(e) => {
                                  const next = [...thresholdOffers];
                                  next[idx] = { ...next[idx], label_en: e.target.value };
                                  setThresholdOffers(next);
                                }}
                                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={offer.is_active}
                            onChange={(e) => {
                              const next = [...thresholdOffers];
                              next[idx] = { ...next[idx], is_active: e.target.checked };
                              setThresholdOffers(next);
                            }}
                            className="accent-brand-accent"
                          />
                          <label className="text-[10px] font-bold text-zinc-300">Active</label>
                          <span className="text-[9px] text-zinc-500 ml-2">
                            {offer.is_active
                              ? `✅ Orders over ${offer.min_order_amount} EGP → ${offer.discount_type === 'free_delivery' ? 'Free Delivery' : offer.discount_type === 'percentage' ? `${offer.discount_value}% off` : `${offer.discount_value} EGP off`}`
                              : '⚪ Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={async () => {
                        await saveSettings({ ...settings, threshold_offers: JSON.stringify(thresholdOffers) });
                        alert('Threshold Offers saved!');
                      }}
                      className="px-6 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg uppercase text-xs cursor-pointer"
                    >
                      Save Threshold Offers
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOM DESIGN REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-black uppercase text-white">{t('sidebar.custom_requests')}</h2>
              <input
                type="text"
                value={requestSearchQuery}
                onChange={(e) => setRequestSearchQuery(e.target.value)}
                placeholder={locale === 'ar' ? 'ابحث بالاسم، انستغرام، أو الكود...' : 'Search by name, Instagram, or code...'}
                className="w-full sm:max-w-xs px-3.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent font-mono select-text"
              />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left font-mono">
                 <thead className="bg-zinc-800 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                   <tr>
                     <th className="p-4 w-[80px]">Details</th>
                     <th className="p-4">{t('custom_requests.client')}</th>
                     <th className="p-4">{t('custom_requests.instagram')}</th>
                     <th className="p-4">Description</th>
                     <th className="p-4">{t('custom_requests.status')}</th>
                     <th className="p-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800 text-xs">
                   {(() => {
                      const query = requestSearchQuery.toLowerCase().trim();
                      const filteredRequests = customRequests.filter(req => {
                        if (!query) return true;
                        const clientName = (req.customer_name || '').toLowerCase();
                        const clientIg = (req.instagram_username || '').toLowerCase();
                        const clientEmail = (req.email || '').toLowerCase();
                        const clientPhone = (req.customer_phone || '').toLowerCase();
                        const reqId = req.id.toLowerCase();
                        
                        const directMatch = clientName.includes(query) || 
                                           clientIg.includes(query) || 
                                           clientEmail.includes(query) || 
                                           clientPhone.includes(query) || 
                                           reqId.includes(query);
                                           
                        if (directMatch) return true;

                        const matchingOrder = orders.find(o => {
                          const hasReqId = o.notes && o.notes.toLowerCase().includes(req.id.toLowerCase().substring(0, 8));
                          const hasProblemCode = o.rejection_reason && o.rejection_reason.toLowerCase().includes(query);
                          return hasReqId && hasProblemCode;
                        });

                        return !!matchingOrder;
                      });
                      return filteredRequests;
                    })().map((req) => (
                     <Fragment key={req.id}>
                       <tr className="hover:bg-zinc-800/20 text-zinc-300">
                         <td className="p-4">
                           <button
                             type="button"
                             onClick={() => setExpandedRequestRowId(expandedRequestRowId === req.id ? null : req.id)}
                             className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[9px] font-bold cursor-pointer transition-colors"
                           >
                             {expandedRequestRowId === req.id ? 'Hide' : 'Show'}
                           </button>
                         </td>
                         <td className="p-4 font-bold text-white">
                           <div>{req.customer_name}</div>
                           {req.email && <div className="text-[10px] text-zinc-500 font-normal">{req.email}</div>}
                         </td>
                         <td className="p-4 text-brand-accent">
                           <a 
                             href={`https://instagram.com/${req.instagram_username.replace('@', '')}`}
                             target="_blank" rel="noopener noreferrer"
                             className="hover:underline"
                           >
                             {req.instagram_username}
                           </a>
                         </td>
                         <td className="p-4 max-w-xs">
                           <div className="truncate" title={req.description}>{req.description}</div>
                           {req.price ? (
                             <div className="text-[10px] text-brand-accent font-black mt-0.5">{req.price} EGP</div>
                           ) : null}
                         </td>
                         <td className="p-4">
                           <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                             req.status === 'completed' ? 'bg-green-950/50 text-green-400 border border-green-900' :
                             req.status === 'accepted' ? 'bg-blue-950/50 text-blue-400 border border-blue-900' :
                             req.status === 'declined' ? 'bg-red-950/50 text-red-400 border border-red-900' :
                             req.status === 'in_progress' ? 'bg-amber-950/50 text-amber-400 border border-amber-900' :
                             'bg-zinc-800 text-zinc-400 border border-zinc-700'
                           }`}>
                             {t(`custom_requests.${req.status}`) || req.status}
                           </span>
                         </td>
                         <td className="p-4 text-right">
                           <div className="flex flex-col items-end gap-2">
                             <select
                               value={req.status}
                               onChange={(e) => {
                                 const newStatus = e.target.value;
                                 if (newStatus === 'accepted') {
                                   setAcceptingReqId(req.id);
                                   setCustomRequestPrice(req.price ? req.price.toString() : '');
                                 } else {
                                   updateRequestStatus(req.id, newStatus, req.notes || '');
                                 }
                               }}
                               className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white text-[10px]"
                             >
                               <option value="pending">Pending</option>
                               <option value="accepted">Accepted</option>
                               <option value="declined">Declined</option>
                               <option value="in_progress">In Progress</option>
                               <option value="completed">Completed</option>
                             </select>

                             {acceptingReqId === req.id && (
                               <div className="flex items-center gap-1.5 mt-1 bg-zinc-950 p-1.5 border border-zinc-800 rounded shadow-md">
                                 <input
                                   type="number"
                                   placeholder="Price EGP"
                                   value={customRequestPrice}
                                   onChange={(e) => setCustomRequestPrice(e.target.value)}
                                   className="w-16 px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px] text-white font-mono"
                                 />
                                 <button
                                   onClick={async () => {
                                     const priceNum = parseFloat(customRequestPrice);
                                     if (isNaN(priceNum) || priceNum <= 0) {
                                       alert('Please enter a valid price');
                                       return;
                                     }
                                     await updateRequestStatus(req.id, 'accepted', req.notes || '', priceNum);
                                     setAcceptingReqId(null);
                                     setCustomRequestPrice('');
                                   }}
                                   className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white rounded text-[9px] font-bold"
                                 >
                                   Accept
                                 </button>
                                 <button
                                   onClick={() => {
                                     setAcceptingReqId(null);
                                     setCustomRequestPrice('');
                                   }}
                                   className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-[9px] font-bold"
                                 >
                                   Cancel
                                 </button>
                               </div>
                             )}
                           </div>
                         </td>
                       </tr>

                       {expandedRequestRowId === req.id && (() => {
                         const userProfile = usersList.find((u: any) => u.id === req.user_id);
                         const otherReqs = customRequests.filter((r: any) => 
                           r.id !== req.id && 
                           ((req.user_id && r.user_id === req.user_id) || (req.email && r.email === req.email))
                         );

                         return (
                           <tr className="bg-zinc-950/70 border-b border-zinc-800">
                             <td colSpan={6} className="p-5 text-zinc-300">
                               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                 
                                 {/* 1. Client Registered Account Info */}
                                 <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3 font-sans">
                                   <h4 className="text-xs font-black uppercase text-brand-accent border-b border-zinc-800 pb-1.5 flex items-center gap-1.5 select-none">
                                     <span>👤 Customer Profile info</span>
                                   </h4>
                                   {userProfile ? (
                                     <div className="space-y-2 text-[11px] leading-relaxed">
                                       <div>
                                         <span className="text-zinc-500 font-bold block">Account Full Name:</span>
                                         <span className="text-white font-mono">{userProfile.address_data?.customer_name || 'Not Set'}</span>
                                       </div>
                                       <div>
                                         <span className="text-zinc-500 font-bold block">Registered Email:</span>
                                         <div className="flex items-center gap-1.5 mt-0.5">
                                           <span className="text-white font-mono select-all">{userProfile.email}</span>
                                           <button
                                             onClick={() => {
                                               setEmailModalRecipient(userProfile.email);
                                               setEmailModalSubject('');
                                               setEmailModalBody('');
                                               setActiveTab('email-sender');
                                             }}
                                             className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-brand-accent rounded text-[8px] uppercase font-bold border border-zinc-750 cursor-pointer"
                                           >
                                             Email
                                           </button>
                                         </div>
                                       </div>
                                       <div>
                                         <span className="text-zinc-500 font-bold block">Registered Phone:</span>
                                         <span className="text-white font-mono select-all">{userProfile.phone || 'N/A'}</span>
                                       </div>
                                       <div>
                                         <span className="text-zinc-500 font-bold block">Loyalty Points:</span>
                                         <span className="text-brand-accent font-black">{userProfile.loyalty_points || 0} Points</span>
                                       </div>
                                       <div className="pt-1.5 border-t border-zinc-800">
                                         <span className="text-zinc-500 font-bold block">Saved Shipping Address:</span>
                                         <p className="text-white font-mono text-[10px] bg-zinc-950 p-2 rounded border border-zinc-800 mt-1">
                                           {userProfile.address_data?.governorate ? (
                                             <>
                                               {userProfile.address_data.governorate} - {userProfile.address_data.city}<br />
                                               {userProfile.address_data.address || userProfile.address_data.street}
                                             </>
                                           ) : (
                                             'No shipping address saved'
                                           )}
                                         </p>
                                       </div>
                                     </div>
                                   ) : (
                                     <div className="text-[11px] text-zinc-500 bg-zinc-950 p-3 rounded border border-zinc-800 text-center font-mono">
                                       No linked account. Custom request submitted using:
                                       <div className="text-white mt-1 select-all">{req.email || 'No email provided'}</div>
                                       <div className="text-white select-all">{req.customer_phone || 'No phone provided'}</div>
                                     </div>
                                   )}
                                 </div>

                                 {/* 2. Custom Idea Description & Uploaded Images */}
                                 <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3 font-sans">
                                   <h4 className="text-xs font-black uppercase text-brand-accent border-b border-zinc-800 pb-1.5 select-none">
                                     💡 Custom Request details
                                   </h4>
                                   <div className="space-y-2 text-[11px] leading-relaxed">
                                     <div>
                                       <span className="text-zinc-500 font-bold block">Submitter Name:</span>
                                       <span className="text-white font-mono">{req.customer_name}</span>
                                     </div>
                                     <div>
                                       <span className="text-zinc-500 font-bold block">Contact Email:</span>
                                       <span className="text-white font-mono select-all">{req.email || 'N/A'}</span>
                                          {req.email && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEmailModalRecipient(req.email || '');
                                                setEmailModalSubject('');
                                                setEmailModalBody('');
                                                setActiveTab('email-sender');
                                              }}
                                              className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-brand-accent rounded text-[8px] uppercase font-bold border border-zinc-750 cursor-pointer inline-block ml-1.5 align-middle"
                                            >
                                              Email
                                            </button>
                                          )}
                                     </div>
                                     <div>
                                       <span className="text-zinc-500 font-bold block">Contact Phone:</span>
                                       <span className="text-white font-mono select-all">{req.customer_phone || 'N/A'}</span>
                                     </div>
                                     <div>
                                       <span className="text-zinc-500 font-bold block">Instagram Username:</span>
                                       <span className="text-brand-accent font-mono select-all">@{req.instagram_username}</span>
                                     </div>
                                     <div>
                                       <span className="text-zinc-500 font-bold block">Garment Idea Description:</span>
                                       <p className="text-white text-[10px] bg-zinc-950 p-2.5 rounded border border-zinc-800 mt-1 leading-normal whitespace-pre-wrap select-text font-mono">
                                         {req.description}
                                       </p>
                                     </div>

                                     {/* Reference Images */}
                                     {req.reference_images && req.reference_images.length > 0 ? (
                                       <div className="pt-2">
                                         <span className="text-zinc-500 font-bold block mb-1.5">Uploaded Reference Pics:</span>
                                         <div className="flex gap-2 flex-wrap">
                                           {req.reference_images.map((img: string, idx: number) => (
                                             <a
                                               key={idx}
                                               href={img}
                                               target="_blank"
                                               rel="noopener noreferrer"
                                               className="relative w-14 h-14 border border-zinc-700 hover:border-brand-accent rounded overflow-hidden bg-zinc-950 flex items-center justify-center cursor-zoom-in transition-colors group"
                                             >
                                               <img src={img} alt="ref" className="w-full h-full object-cover" />
                                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-mono font-bold transition-opacity">
                                                 [VIEW]
                                               </div>
                                             </a>
                                           ))}
                                         </div>
                                       </div>
                                     ) : (
                                       <div className="text-[10px] text-zinc-500 italic mt-2">No reference pictures uploaded.</div>
                                     )}
                                   </div>
                                 </div>

                                 {/* 3. User Custom Requests History */}
                                 <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3 font-sans">
                                   <h4 className="text-xs font-black uppercase text-brand-accent border-b border-zinc-800 pb-1.5 select-none">
                                     📂 Customer Request History ({otherReqs.length})
                                   </h4>
                                   {otherReqs.length > 0 ? (
                                     <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                                       {otherReqs.map((other: any) => (
                                         <div key={other.id} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1.5">
                                           <div className="flex justify-between items-center text-[9px]">
                                             <span className="text-zinc-500 font-mono font-bold">
                                               {new Date(other.created_at).toLocaleDateString()}
                                             </span>
                                             <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase ${
                                               other.status === 'completed' ? 'bg-green-950/40 text-green-400 border border-green-900' :
                                               other.status === 'accepted' ? 'bg-blue-950/40 text-blue-400 border border-blue-900' :
                                               other.status === 'declined' ? 'bg-red-950/40 text-red-400 border border-red-900' :
                                               'bg-zinc-850 text-zinc-400 border border-zinc-700'
                                             }`}>
                                               {other.status}
                                             </span>
                                           </div>
                                           <p className="text-[10px] text-white font-mono line-clamp-2 select-text" title={other.description}>
                                             {other.description}
                                           </p>

                                           {/* Mini thumbnails of images in history */}
                                           {other.reference_images && other.reference_images.length > 0 && (
                                             <div className="flex gap-1 pt-1">
                                               {other.reference_images.map((oimg: string, oidx: number) => (
                                                 <a
                                                   key={oidx}
                                                   href={oimg}
                                                   target="_blank"
                                                   rel="noopener noreferrer"
                                                   className="w-8 h-8 rounded border border-zinc-800 bg-zinc-950 overflow-hidden block hover:border-brand-accent transition-colors"
                                                 >
                                                   <img src={oimg} alt="ref mini" className="w-full h-full object-cover" />
                                                 </a>
                                               ))}
                                             </div>
                                           )}
                                         </div>
                                       ))}
                                     </div>
                                   ) : (
                                     <div className="text-[10px] text-zinc-500 italic text-center py-6 font-mono">
                                       No other custom requests submitted by this customer.
                                     </div>
                                   )}
                                 </div>

                               </div>
                             </td>
                           </tr>
                         );
                       })()}
                     </Fragment>
                   ))}
                 </tbody>
              </table>
            </div>
          </div>
          </div>
        )}

        {/* TAB 6: SETTINGS — Card-Based Accordion Layout */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <h2 className="text-3xl font-black uppercase text-white">{t('sidebar.settings')}</h2>

            {/* Visual Editor Mode trigger */}
            <div className="bg-zinc-900 border-2 border-brand-accent p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg font-mono">
              <div>
                <h4 className="text-sm font-black text-brand-accent uppercase flex items-center gap-2">
                  ✨ Homepage Visual Editor
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Toggle visual editor overlay on the homepage to edit texts, sections and products in-place.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('ff_admin_view_mode', 'true');
                  window.location.href = `/${locale}`;
                }}
                className="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white border-2 border-black rounded-xl font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all active:translate-y-0.5 cursor-pointer flex items-center gap-2 shrink-0"
              >
                Launch Admin View
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3">

              {/* ── CARD: Brand Identity ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏷️</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Brand Identity</p>
                      <p className="text-[10px] text-zinc-500">Name, tagline, and logo</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-zinc-800 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.brand_name')}</label>
                      <input type="text" value={settingsForm.brand_name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, brand_name: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.tagline')}</label>
                      <input type="text" value={settingsForm.tagline}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/50">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Web Logo</label>
                      <div className="flex gap-2">
                        <input type="text" value={settingsForm.logo_url}
                          onChange={(e) => setSettingsForm({ ...settingsForm, logo_url: e.target.value })}
                          placeholder="Image URL or upload"
                          className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                        <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center shrink-0">
                          {isUploadingLogo ? '⏳ ...' : '📁 Upload'}
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                      </div>
                      {settingsForm.logo_url && (
                        <div className="mt-2 flex items-center gap-2">
                          <img src={settingsForm.logo_url} alt="Logo preview" className="h-8 object-contain rounded border border-zinc-800 bg-zinc-950" />
                          <span className="text-[8px] text-zinc-500 truncate max-w-[150px]">{settingsForm.logo_url}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Loading Screen Logo</label>
                      <div className="flex gap-2">
                        <input type="text" value={settingsForm.loading_logo_url}
                          onChange={(e) => setSettingsForm({ ...settingsForm, loading_logo_url: e.target.value })}
                          placeholder="Image URL or upload"
                          className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                        <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center shrink-0">
                          {isUploadingLoadingLogo ? '⏳ ...' : '📁 Upload'}
                          <input type="file" accept="image/*" onChange={handleLoadingLogoUpload} className="hidden" />
                        </label>
                      </div>
                      {settingsForm.loading_logo_url && (
                        <div className="mt-2 flex items-center gap-2">
                          <img src={settingsForm.loading_logo_url} alt="Loading logo preview" className="h-8 object-contain rounded border border-zinc-800 bg-zinc-950" />
                          <span className="text-[8px] text-zinc-500 truncate max-w-[150px]">{settingsForm.loading_logo_url}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/50">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      🌟 Hero Polaroid Featured Product
                    </label>
                    <select
                      value={settingsForm.hero_product_id}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hero_product_id: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent cursor-pointer"
                    >
                      <option value="">-- Use Default Illustrated Polaroid Image --</option>
                      {products && products.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name_en} ({prod.price} EGP)
                        </option>
                      ))}
                    </select>
                    <p className="text-[9px] text-zinc-500 mt-1">
                      Choose a product from your catalog to render directly inside the home hero Polaroid frame. Visitors will be able to preview or buy it directly from the hero section!
                    </p>
                  </div>
                </div>
              </details>

              {/* ── CARD: Social Media ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📱</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Social Media</p>
                      <p className="text-[10px] text-zinc-500">Instagram, TikTok, Facebook links</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-zinc-800 space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.instagram_url')}</label>
                    <input type="text" value={settingsForm.instagram_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/fandomfit"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.tiktok_url')}</label>
                      <input type="text" value={settingsForm.tiktok_url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tiktok_url: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.facebook_url')}</label>
                      <input type="text" value={settingsForm.facebook_url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                    </div>
                  </div>
                </div>
              </details>

              {/* ── CARD: SEO ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔍</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">SEO Settings</p>
                      <p className="text-[10px] text-zinc-500">Search engine title and description</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-zinc-800 space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.seo_title')}</label>
                    <input type="text" value={settingsForm.seo_title}
                      onChange={(e) => setSettingsForm({ ...settingsForm, seo_title: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">{t('settings.seo_desc')}</label>
                    <textarea rows={2} value={settingsForm.seo_desc}
                      onChange={(e) => setSettingsForm({ ...settingsForm, seo_desc: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent resize-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Website Tab Icon (Favicon) / أيقونة التبويب</label>
                    <div className="flex gap-2 items-stretch">
                      <input type="text" value={settingsForm.favicon_url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, favicon_url: e.target.value })}
                        placeholder="Paste URL or upload from device →"
                        className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                      <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-black uppercase cursor-pointer transition-colors whitespace-nowrap ${
                        isUploadingFavicon
                          ? 'bg-zinc-700 border-zinc-600 text-zinc-400 pointer-events-none'
                          : 'bg-brand-accent hover:bg-brand-accent/80 border-brand-accent text-white'
                      }`}>
                        {isUploadingFavicon ? '⏳ Uploading…' : '📁 Upload'}
                        <input
                          type="file"
                          accept="image/*,.ico"
                          className="hidden"
                          disabled={isUploadingFavicon}
                          onChange={handleFaviconUpload}
                        />
                      </label>
                    </div>
                    {settingsForm.favicon_url && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={settingsForm.favicon_url} alt="Favicon preview" className="w-6 h-6 object-contain rounded border border-zinc-700 bg-zinc-800" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <span className="text-[9px] text-zinc-500 truncate max-w-[260px]">{settingsForm.favicon_url}</span>
                      </div>
                    )}
                  </div>
                </div>
              </details>

              {/* ── CARD: Announcement Bar ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📢</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Announcement Bar</p>
                      <p className="text-[10px] text-zinc-500">Scrolling banner on homepage</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-zinc-800 space-y-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">EN</span> English Text
                    </label>
                    <input type="text" value={settingsForm.announcement}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                      placeholder="e.g. Free Shipping for orders above 1000 EGP!"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">AR</span> Arabic Text
                    </label>
                    <input type="text" dir="rtl" value={settingsForm.announcement_ar}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcement_ar: e.target.value })}
                      placeholder="مثال: شحن مجاني للطلبات فوق ١٠٠٠ جنيه!"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent text-right font-arabic" />
                  </div>
                </div>
              </details>

              {/* ── CARD: Shipping & Live Chat Support ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🚚</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Shipping & Communication</p>
                      <p className="text-[10px] text-zinc-500">Delivery fees and live chat toggle</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-3 border-t border-zinc-800 space-y-4 font-mono">
                  
                  {/* Delivery Fee Input */}
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">
                      🚚 Standard Delivery Fee (EGP)
                    </label>
                    <input 
                      type="number" 
                      min={0}
                      value={settingsForm.delivery_fee}
                      onChange={(e) => setSettingsForm({ ...settingsForm, delivery_fee: Number(e.target.value) })}
                      className="w-full max-w-[200px] px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" 
                    />
                    <p className="text-[9px] text-zinc-500 mt-1">
                      Sets the default flat-rate delivery charge calculated at checkout for all orders (unless overridden by active free shipping offers).
                    </p>
                  </div>

                  {/* Chat Toggle Switch */}
                  <div className="pt-2 border-t border-zinc-850">
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1.5">
                      💬 Live Chat Floating Widget Visibility
                    </label>
                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, chat_widget_enabled: !settingsForm.chat_widget_enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        settingsForm.chat_widget_enabled ? 'bg-brand-accent' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settingsForm.chat_widget_enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-zinc-300 ml-2 align-middle uppercase select-none">
                      {settingsForm.chat_widget_enabled ? 'Visible / Enabled' : 'Hidden / Disabled'}
                    </span>
                    <p className="text-[9px] text-zinc-500 mt-1">
                      Toggle the floating support chat bubble globally on your storefront homepages.
                    </p>
                  </div>

                  {/* Global Preorder Mode Toggle Switch */}
                  <div className="pt-3 border-t border-zinc-850">
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1.5 font-mono">
                      🛒 Global Pre-Order Shop Mode
                    </label>
                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, global_preorder_mode: !settingsForm.global_preorder_mode })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        settingsForm.global_preorder_mode ? 'bg-blue-600' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settingsForm.global_preorder_mode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-zinc-300 ml-2 align-middle uppercase select-none font-mono">
                      {settingsForm.global_preorder_mode ? 'Pre-Order Only Mode / Enabled' : 'Normal Catalog Mode / Disabled'}
                    </span>
                    <p className="text-[9px] text-zinc-500 mt-1">
                      Enabling this forces all products across the entire store to act as Pre-Order items, ignoring local stock values.
                    </p>
                  </div>

                </div>
              </details>

              {/* ── CARD: Terms & Policies ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📜</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Terms & Policies</p>
                      <p className="text-[10px] text-zinc-500">Edit storefront terms, returns & exchanging policies</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-3 border-t border-zinc-800 space-y-4 font-mono">
                  
                  {/* English Terms Textarea */}
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">
                      📜 English Terms & Policies (Returns & Exchanging)
                    </label>
                    <textarea 
                      rows={8}
                      value={settingsForm.terms_en}
                      onChange={(e) => setSettingsForm({ ...settingsForm, terms_en: e.target.value })}
                      placeholder="Enter the English terms & policies..."
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent resize-y font-mono" 
                    />
                  </div>

                  {/* Arabic Terms Textarea */}
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">
                      📜 الترجمة العربية للشروط والسياسات
                    </label>
                    <textarea 
                      rows={8}
                      value={settingsForm.terms_ar}
                      onChange={(e) => setSettingsForm({ ...settingsForm, terms_ar: e.target.value })}
                      placeholder="أدخل الشروط والسياسات باللغة العربية..."
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent resize-y text-right font-mono" 
                      dir="rtl"
                    />
                  </div>

                </div>
              </details>

              {/* ── CARD: Email Templates ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✉️</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Transactional Email Templates</p>
                      <p className="text-[10px] text-zinc-500">Edit automated checkout and status confirmation emails</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-3 border-t border-zinc-800 space-y-5 font-mono">
                  
                  {/* Dynamic Badge list of placeholders */}
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                    <p className="text-[9px] uppercase font-bold text-brand-accent mb-1.5">💡 Available Template Placeholders</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['{customerName}', '{orderCode}', '{price}', '{location}', '{paymentMethod}', '{rejectionReason}', '{problemCode}', '{websiteUrl}', '{itemsHtml}'].map(ph => (
                        <code key={ph} className="text-[8px] bg-zinc-900 text-zinc-300 border border-zinc-800 px-1.5 py-0.5 rounded font-mono select-all">
                          {ph}
                        </code>
                      ))}
                    </div>
                    <p className="text-[8px] text-zinc-500 mt-2">
                      Placeholders will be automatically replaced with current order details upon delivery. HTML tags are fully supported.
                    </p>
                  </div>

                  {/* Template 1: Checkout Order Confirmation */}
                  <div className="space-y-2 pt-2 border-t border-zinc-850">
                    <p className="text-[10px] font-bold text-zinc-300 uppercase">📦 1. Order Confirmation (Send immediately on Checkout)</p>
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-1">Subject</label>
                      <input 
                        type="text" 
                        value={settingsForm.email_template_confirmation_subject}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email_template_confirmation_subject: e.target.value })}
                        placeholder="Subject..."
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-1">Body HTML Template</label>
                      <textarea 
                        rows={6}
                        value={settingsForm.email_template_confirmation_body}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email_template_confirmation_body: e.target.value })}
                        placeholder="Body HTML content..."
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent font-mono resize-y" 
                      />
                    </div>
                  </div>

                  {/* Template 2: Payment Verified / Approved */}
                  <div className="space-y-2 pt-2 border-t border-zinc-850">
                    <p className="text-[10px] font-bold text-zinc-300 uppercase">🛡️ 2. Payment Verified (Approved by accounting)</p>
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-1">Subject</label>
                      <input 
                        type="text" 
                        value={settingsForm.email_template_approved_subject}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email_template_approved_subject: e.target.value })}
                        placeholder="Subject..."
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-1">Body HTML Template</label>
                      <textarea 
                        rows={6}
                        value={settingsForm.email_template_approved_body}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email_template_approved_body: e.target.value })}
                        placeholder="Body HTML content..."
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent font-mono resize-y" 
                      />
                    </div>
                  </div>

                  {/* Template 3: Payment Verification Failed */}
                  <div className="space-y-2 pt-2 border-t border-zinc-850">
                    <p className="text-[10px] font-bold text-zinc-300 uppercase">⚠️ 3. Action Required (Payment verification rejected)</p>
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-1">Subject</label>
                      <input 
                        type="text" 
                        value={settingsForm.email_template_rejected_subject}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email_template_rejected_subject: e.target.value })}
                        placeholder="Subject..."
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-1">Body HTML Template</label>
                      <textarea 
                        rows={6}
                        value={settingsForm.email_template_rejected_body}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email_template_rejected_body: e.target.value })}
                        placeholder="Body HTML content..."
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent font-mono resize-y" 
                      />
                    </div>
                  </div>

                </div>
              </details>

              {/* ── CARD: Fabric Pricing ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💰</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Fabric Pricing</p>
                      <p className="text-[10px] text-zinc-500">Price premiums added per fabric type</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-zinc-800">
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    {[
                      { label: '🧶 Premium Fabric', key: 'fabric_premium_premium' },
                      { label: '🪨 Heavy Fabric', key: 'fabric_premium_heavy' },
                      { label: '📦 Oversized Fabric', key: 'fabric_premium_oversized' },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">{label} (+EGP)</label>
                        <input type="number" min={0}
                          value={(settingsForm as any)[key]}
                          onChange={(e) => setSettingsForm({ ...settingsForm, [key]: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                      </div>
                    ))}
                  </div>
                </div>
              </details>

              {/* ── CARD: Reward Engine ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎁</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Reward Engine</p>
                      <p className="text-[10px] text-zinc-500">Enable/disable cotton & referral systems</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-4 border-t border-zinc-800 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group/toggle">
                    <div className={`relative w-10 h-5 rounded-full border-2 border-zinc-700 transition-colors ${settingsForm.cotton_reward_system_enabled ? 'bg-brand-accent border-brand-accent' : 'bg-zinc-800'}`}
                      onClick={() => setSettingsForm({ ...settingsForm, cotton_reward_system_enabled: !settingsForm.cotton_reward_system_enabled })}>
                      <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm ${settingsForm.cotton_reward_system_enabled ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">🧶 Cotton Reward System</p>
                      <p className="text-[9px] text-zinc-500">25% off 2nd item when cart has cotton-eligible items</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group/toggle">
                    <div className={`relative w-10 h-5 rounded-full border-2 border-zinc-700 transition-colors ${settingsForm.referral_reward_system_enabled ? 'bg-brand-accent border-brand-accent' : 'bg-zinc-800'}`}
                      onClick={() => setSettingsForm({ ...settingsForm, referral_reward_system_enabled: !settingsForm.referral_reward_system_enabled })}>
                      <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm ${settingsForm.referral_reward_system_enabled ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">🔗 Referral Reward System</p>
                      <p className="text-[9px] text-zinc-500">Referral sharing with 15% OFF coupon</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group/toggle">
                    <div className={`relative w-10 h-5 rounded-full border-2 border-zinc-700 transition-colors ${settingsForm.show_stock_quantities ? 'bg-brand-accent border-brand-accent' : 'bg-zinc-800'}`}
                      onClick={() => setSettingsForm({ ...settingsForm, show_stock_quantities: !settingsForm.show_stock_quantities })}>
                      <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm ${settingsForm.show_stock_quantities ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">📦 Show Stock Quantities</p>
                      <p className="text-[9px] text-zinc-500">Show exact product stock counts to visitors</p>
                    </div>
                  </label>
                </div>
              </details>

              {/* ── CARD: Loyalty Points ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏆</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Loyalty Reward Config</p>
                      <p className="text-[10px] text-zinc-500">Set order count threshold and discount reward</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-zinc-800">
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Orders to Unlock Reward</label>
                      <input type="number" min={1}
                        value={settingsForm.loyalty_orders_threshold || 5}
                        onChange={(e) => setSettingsForm({ ...settingsForm, loyalty_orders_threshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Loyalty Discount %</label>
                      <input type="number" min={1} max={100}
                        value={settingsForm.loyalty_discount_percent || 20}
                        onChange={(e) => setSettingsForm({ ...settingsForm, loyalty_discount_percent: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Referral Link Clicks Goal</label>
                      <input type="number" min={1}
                        value={settingsForm.referral_clicks_threshold || 5}
                        onChange={(e) => setSettingsForm({ ...settingsForm, referral_clicks_threshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-2">
                    ✅ Every {settingsForm.loyalty_orders_threshold || 5} orders → customer gets {settingsForm.loyalty_discount_percent || 20}% off their next order | Referral Link Click Goal: {settingsForm.referral_clicks_threshold || 5} clicks to earn 15% coupon code
                  </p>
                </div>
              </details>

              {/* ── CARD: Stock Status Config ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📦</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Stock Status Config</p>
                      <p className="text-[10px] text-zinc-500">Set thresholds for green / yellow / red product status</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-zinc-800">
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">🟢 Good Stock — units ≥</label>
                      <input type="number" min={1}
                        value={settingsForm.good_stock_threshold || 10}
                        onChange={(e) => setSettingsForm({ ...settingsForm, good_stock_threshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">🔴 Low Stock — units &lt;</label>
                      <input type="number" min={1}
                        value={settingsForm.low_stock_threshold || 3}
                        onChange={(e) => setSettingsForm({ ...settingsForm, low_stock_threshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent" />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-bold uppercase">
                    <span className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 rounded-full">🟢 ≥ {settingsForm.good_stock_threshold || 10} units → Green</span>
                    <span className="px-2.5 py-1 bg-amber-950/40 text-amber-400 border border-amber-900/50 rounded-full">🟡 {settingsForm.low_stock_threshold || 3}–{(settingsForm.good_stock_threshold || 10) - 1} units → Yellow</span>
                    <span className="px-2.5 py-1 bg-rose-950/40 text-rose-400 border border-rose-900/50 rounded-full">🔴 &lt; {settingsForm.low_stock_threshold || 3} units → Red</span>
                    <span className="px-2.5 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full">⬛ 0 units → Gray (Out of Stock)</span>
                  </div>
                </div>
              </details>

              {/* ── CARD: Product Defaults ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚙️</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Product Defaults</p>
                      <p className="text-[10px] text-zinc-500">Global defaults for new products (sizes, fabrics, tags)</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-zinc-800">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Default Sizes</label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-850 rounded-xl min-h-[38px]">
                        {(settingsForm.default_sizes || '').split(',').map(s => s.trim()).filter(Boolean).map((s, idx) => (
                          <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[9px] font-bold uppercase shrink-0">
                            {s}
                            <button
                              type="button"
                              onClick={() => {
                                const list = (settingsForm.default_sizes || '').split(',').map(item => item.trim()).filter(Boolean);
                                list.splice(idx, 1);
                                setSettingsForm({ ...settingsForm, default_sizes: list.join(', ') });
                              }}
                              className="text-zinc-500 hover:text-white cursor-pointer font-black"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder="Type & press Enter..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim().toUpperCase();
                              if (!val) return;
                              const list = (settingsForm.default_sizes || '').split(',').map(item => item.trim()).filter(Boolean);
                              if (!list.includes(val)) {
                                setSettingsForm({ ...settingsForm, default_sizes: [...list, val].join(', ') });
                              }
                              e.currentTarget.value = '';
                            }
                          }}
                          className="bg-transparent border-none outline-none text-white text-xs flex-1 min-w-[70px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Default Fabrics</label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-850 rounded-xl min-h-[38px]">
                        {(settingsForm.default_fabrics || '').split(',').map(f => f.trim()).filter(Boolean).map((f, idx) => (
                          <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[9px] font-bold uppercase shrink-0">
                            {f}
                            <button
                              type="button"
                              onClick={() => {
                                const list = (settingsForm.default_fabrics || '').split(',').map(item => item.trim()).filter(Boolean);
                                list.splice(idx, 1);
                                setSettingsForm({ ...settingsForm, default_fabrics: list.join(', ') });
                              }}
                              className="text-zinc-500 hover:text-white cursor-pointer font-black"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder="Type & press Enter..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (!val) return;
                              const list = (settingsForm.default_fabrics || '').split(',').map(item => item.trim()).filter(Boolean);
                              if (!list.includes(val)) {
                                setSettingsForm({ ...settingsForm, default_fabrics: [...list, val].join(', ') });
                              }
                              e.currentTarget.value = '';
                            }
                          }}
                          className="bg-transparent border-none outline-none text-white text-xs flex-1 min-w-[90px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Default Tags</label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-850 rounded-xl min-h-[38px]">
                        {(settingsForm.default_tags || '').split(',').map(t => t.trim()).filter(Boolean).map((t, idx) => (
                          <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[9px] font-bold uppercase shrink-0">
                            {t}
                            <button
                              type="button"
                              onClick={() => {
                                const list = (settingsForm.default_tags || '').split(',').map(item => item.trim()).filter(Boolean);
                                list.splice(idx, 1);
                                setSettingsForm({ ...settingsForm, default_tags: list.join(', ') });
                              }}
                              className="text-zinc-500 hover:text-white cursor-pointer font-black"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder="Type & press Enter..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (!val) return;
                              const list = (settingsForm.default_tags || '').split(',').map(item => item.trim()).filter(Boolean);
                              if (!list.includes(val)) {
                                setSettingsForm({ ...settingsForm, default_tags: [...list, val].join(', ') });
                              }
                              e.currentTarget.value = '';
                            }
                          }}
                          className="bg-transparent border-none outline-none text-white text-xs flex-1 min-w-[90px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </details>
              {/* ── CARD: Size Charts ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📐</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Size Charts Manager</p>
                      <p className="text-[10px] text-zinc-500">Add and customize multiple named fit size charts</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-4 border-t border-zinc-800 space-y-6 mt-2">
                  
                  {/* Header action */}
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                    <p className="text-[10px] text-zinc-400 uppercase">Manage fit tables (e.g. Oversized, Regular)</p>
                    <button
                      type="button"
                      onClick={() => {
                        const newChart = {
                          id: `fit-${Date.now()}`,
                          name_en: 'New Size Chart',
                          name_ar: 'جدول قياسات جديد',
                          img_en: '',
                          img_ar: '',
                          table: {
                            headers: ['Size', 'Width (Chest - cm)', 'Length (cm)'],
                            rows: [
                              ['S', '50', '68'],
                              ['M', '53', '70'],
                              ['L', '56', '72']
                            ]
                          }
                        };
                        setSizeChartsList([...sizeChartsList, newChart]);
                      }}
                      className="px-2.5 py-1 bg-brand-accent hover:bg-brand-accent/90 text-white rounded text-[10px] font-bold uppercase cursor-pointer transition-colors"
                    >
                      + Add Chart Table
                    </button>
                  </div>

                  <div className="space-y-6">
                    {sizeChartsList.map((chart, idx) => (
                      <div key={chart.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4 relative">
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => setSizeChartsList(sizeChartsList.filter((_, i) => i !== idx))}
                          className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>

                        {/* Chart Names */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Chart Name (English)</label>
                            <input
                              type="text"
                              value={chart.name_en}
                              onChange={(e) => {
                                const next = [...sizeChartsList];
                                next[idx] = { ...next[idx], name_en: e.target.value };
                                setSizeChartsList(next);
                              }}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Chart Name (Arabic)</label>
                            <input
                              type="text"
                              dir="rtl"
                              value={chart.name_ar}
                              onChange={(e) => {
                                const next = [...sizeChartsList];
                                next[idx] = { ...next[idx], name_ar: e.target.value };
                                setSizeChartsList(next);
                              }}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] text-right font-arabic"
                            />
                          </div>
                        </div>

                        {/* Chart Images */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-900 pt-3">
                          {[{ label: 'English Image', key: 'img_en' }, { label: 'Arabic Image', key: 'img_ar' }].map((imgOpt) => (
                            <div key={imgOpt.key}>
                              <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-1">{imgOpt.label}</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={(chart as any)[imgOpt.key] || ''}
                                  onChange={(e) => {
                                    const next = [...sizeChartsList];
                                    (next[idx] as any)[imgOpt.key] = e.target.value;
                                    setSizeChartsList(next);
                                  }}
                                  placeholder="/images/size-chart.jpg"
                                  className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                                />
                                <label className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded text-[9px] font-bold uppercase cursor-pointer flex items-center shrink-0">
                                  ⬆ Upload
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      if (e.target.files?.[0]) {
                                        try {
                                          const b64 = await fileToBase64(e.target.files[0]);
                                          const next = [...sizeChartsList];
                                          (next[idx] as any)[imgOpt.key] = b64;
                                          setSizeChartsList(next);
                                        } catch(err) { console.error(err); }
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Spreadsheet Grid Table Editor */}
                        <div className="border-t border-zinc-900 pt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] uppercase font-bold text-zinc-400">Custom Spreadsheet Grid</label>
                            <div className="flex gap-1">
                              {[
                                {
                                  label: '+Col',
                                  action: () => {
                                    const h = [...chart.table.headers, `Col${chart.table.headers.length + 1}`];
                                    const r = chart.table.rows.map((row: string[]) => [...row, '']);
                                    const next = [...sizeChartsList];
                                    next[idx].table = { headers: h, rows: r };
                                    setSizeChartsList(next);
                                  }
                                },
                                {
                                  label: '-Col',
                                  action: () => {
                                    if (chart.table.headers.length <= 1) return;
                                    const h = chart.table.headers.slice(0, -1);
                                    const r = chart.table.rows.map((row: string[]) => row.slice(0, -1));
                                    const next = [...sizeChartsList];
                                    next[idx].table = { headers: h, rows: r };
                                    setSizeChartsList(next);
                                  }
                                },
                                {
                                  label: '+Row',
                                  action: () => {
                                    const r = [...chart.table.rows, Array(chart.table.headers.length).fill('')];
                                    const next = [...sizeChartsList];
                                    next[idx].table = { ...chart.table, rows: r };
                                    setSizeChartsList(next);
                                  }
                                },
                                {
                                  label: '-Row',
                                  action: () => {
                                    if (chart.table.rows.length <= 1) return;
                                    const r = chart.table.rows.slice(0, -1);
                                    const next = [...sizeChartsList];
                                    next[idx].table = { ...chart.table, rows: r };
                                    setSizeChartsList(next);
                                  }
                                }
                              ].map((btn) => (
                                <button
                                  key={btn.label}
                                  type="button"
                                  onClick={btn.action}
                                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase cursor-pointer border ${
                                    btn.label.startsWith('-')
                                      ? 'border-red-900/60 text-red-400 bg-red-950/30 hover:bg-red-900'
                                      : 'border-zinc-700 text-white bg-zinc-850 hover:bg-zinc-800'
                                  }`}
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="overflow-x-auto border border-zinc-800 rounded-lg bg-zinc-950 p-2">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr>
                                  {chart.table.headers.map((h: string, hi: number) => (
                                    <th key={hi} className="p-1 min-w-[70px]">
                                      <input
                                        type="text"
                                        value={h}
                                        onChange={(e) => {
                                          const nh = [...chart.table.headers];
                                          nh[hi] = e.target.value;
                                          const next = [...sizeChartsList];
                                          next[idx].table.headers = nh;
                                          setSizeChartsList(next);
                                        }}
                                        className="w-full px-1.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[9px] font-bold uppercase"
                                      />
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {chart.table.rows.map((row: string[], ri: number) => (
                                  <tr key={ri}>
                                    {row.map((cell: string, ci: number) => (
                                      <td key={ci} className="p-1">
                                        <input
                                          type="text"
                                          value={cell}
                                          onChange={(e) => {
                                            const nr = chart.table.rows.map((r: string[], rIdx: number) => {
                                              if (rIdx === ri) {
                                                const nc = [...r];
                                                nc[ci] = e.target.value;
                                                return nc;
                                              }
                                              return r;
                                            });
                                            const next = [...sizeChartsList];
                                            next[idx].table.rows = nr;
                                            setSizeChartsList(next);
                                          }}
                                          className="w-full px-1.5 py-1 bg-zinc-950 border border-zinc-850 rounded text-white text-[9px]"
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              </details>

              {/* ── CARD: Navbar Labels ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🗺️</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Navbar Labels</p>
                      <p className="text-[10px] text-zinc-500">Customize navigation bar titles (EN & AR)</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-zinc-800 space-y-4">
                  {[
                    { key: 'home', label: 'Home / الرئيسية', defaultEn: 'Home', defaultAr: 'الرئيسية' },
                    { key: 'collections', label: 'Collections / التشكيلات', defaultEn: 'Collections', defaultAr: 'التشكيلات' },
                    { key: 'custom_design', label: 'Custom Design / تصميم خاص', defaultEn: 'Custom Design', defaultAr: 'تصميم خاص' },
                    { key: 'about', label: 'About / من نحن', defaultEn: 'About', defaultAr: 'من نحن' },
                    { key: 'faq', label: 'FAQ / الأسئلة الشائعة', defaultEn: 'FAQ', defaultAr: 'الأسئلة الشائعة' },
                    { key: 'contact', label: 'Contact / اتصل بنا', defaultEn: 'Contact', defaultAr: 'اتصل بنا' },
                  ].map((navItem) => (
                    <div key={navItem.key} className="grid grid-cols-2 gap-4 pb-2 border-b border-zinc-850/30 last:border-0">
                      <div>
                        <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">{navItem.label} (EN)</label>
                        <input
                          type="text"
                          value={settingsForm.text_overrides?.[`nav_${navItem.key}_en`] ?? navItem.defaultEn}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            text_overrides: {
                              ...settingsForm.text_overrides,
                              [`nav_${navItem.key}_en`]: e.target.value
                            }
                          })}
                          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white text-xs focus:outline-none focus:border-brand-accent"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">{navItem.label} (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={settingsForm.text_overrides?.[`nav_${navItem.key}_ar`] ?? navItem.defaultAr}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            text_overrides: {
                              ...settingsForm.text_overrides,
                              [`nav_${navItem.key}_ar`]: e.target.value
                            }
                          })}
                          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white text-xs text-right focus:outline-none focus:border-brand-accent font-arabic"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </details>

              {/* ── CARD: Checkout & Account Fields ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📋</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Checkout & Account Fields</p>
                      <p className="text-[10px] text-zinc-500">Configure which information is required, optional, or hidden</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-zinc-800 space-y-4">
                  {[
                    { key: 'name', label: 'Full Name / الاسم بالكامل' },
                    { key: 'phone', label: 'Phone Number / رقم الهاتف' },
                    { key: 'email', label: 'Email Address / البريد الإلكتروني' },
                    { key: 'governorate', label: 'Governorate Selector / المحافظة' },
                    { key: 'city', label: 'City or District / المدينة أو المنطقة' },
                    { key: 'address', label: 'Detailed Address / العنوان بالتفصيل' },
                    { key: 'notes', label: 'Order Notes / ملاحظات الطلب' },
                  ].map((field) => {
                    const currentVal = settingsForm.account_fields?.[field.key] || (field.key === 'email' || field.key === 'notes' ? 'optional' : 'required');
                    return (
                      <div key={field.key} className="flex justify-between items-center pb-2 border-b border-zinc-850/30 last:border-0">
                        <span className="text-xs font-bold text-zinc-300">{field.label}</span>
                        <div className="flex gap-2">
                          {['required', 'optional', 'hidden'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setSettingsForm({
                                ...settingsForm,
                                account_fields: {
                                  ...settingsForm.account_fields,
                                  [field.key]: status
                                }
                              })}
                              className={`px-2.5 py-1 text-[9px] font-black uppercase rounded border transition-colors cursor-pointer ${
                                currentVal === status
                                  ? 'bg-brand-accent border-brand-accent text-white'
                                  : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>

              {/* ── CARD: Why Choose Us Section ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⭐</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Why Choose Us Section</p>
                      <p className="text-[10px] text-zinc-500">Edit titles and customize the 8 feature cards</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-4 border-t border-zinc-800 space-y-4">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-850">
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Section Title (EN)</label>
                      <input
                        type="text"
                        value={settingsForm.text_overrides?.why_choose_us_title_en ?? 'Why Fandom Fit?'}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          text_overrides: {
                            ...settingsForm.text_overrides,
                            why_choose_us_title_en: e.target.value
                          }
                        })}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white text-xs focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Section Title (AR)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={settingsForm.text_overrides?.why_choose_us_title_ar ?? 'لماذا تختارنا؟'}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          text_overrides: {
                            ...settingsForm.text_overrides,
                            why_choose_us_title_ar: e.target.value
                          }
                        })}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white text-xs text-right focus:outline-none focus:border-brand-accent font-arabic"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-[10px] uppercase font-bold text-zinc-400">Feature Cards List ({settingsForm.why_choose_us?.length || 0} cards)</h5>
                      <button
                        type="button"
                        onClick={() => {
                          const newCard = {
                            id: `card-${Date.now()}`,
                            icon: '🌟',
                            colorClass: 'bg-[#F2CC8F]',
                            title_en: 'New Feature',
                            title_ar: 'ميزة جديدة',
                            desc_en: 'Feature details here.',
                            desc_ar: 'تفاصيل الميزة هنا.'
                          };
                          setSettingsForm({
                            ...settingsForm,
                            why_choose_us: [...(settingsForm.why_choose_us || []), newCard]
                          });
                        }}
                        className="px-2 py-1 bg-brand-accent hover:bg-brand-accent/90 text-white rounded text-[9px] font-bold uppercase cursor-pointer"
                      >
                        + Add Card
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(settingsForm.why_choose_us || []).map((card, idx) => (
                        <div key={card.id || idx} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...settingsForm.why_choose_us];
                              list.splice(idx, 1);
                              setSettingsForm({ ...settingsForm, why_choose_us: list });
                            }}
                            className="absolute top-2 right-2 text-zinc-600 hover:text-red-400 cursor-pointer font-black"
                          >
                            ×
                          </button>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Icon / Emoji</label>
                              <input
                                type="text"
                                value={card.icon}
                                onChange={(e) => {
                                  const list = [...settingsForm.why_choose_us];
                                  list[idx] = { ...list[idx], icon: e.target.value };
                                  setSettingsForm({ ...settingsForm, why_choose_us: list });
                                }}
                                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Bg Color Class</label>
                              <select
                                value={card.colorClass}
                                onChange={(e) => {
                                  const list = [...settingsForm.why_choose_us];
                                  list[idx] = { ...list[idx], colorClass: e.target.value };
                                  setSettingsForm({ ...settingsForm, why_choose_us: list });
                                }}
                                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] focus:outline-none"
                              >
                                <option value="bg-[#F2CC8F]">Yellow (#F2CC8F)</option>
                                <option value="bg-[#81B29A]">Green (#81B29A)</option>
                                <option value="bg-[#E07A5F]">Coral (#E07A5F)</option>
                                <option value="bg-[#3D405B]">Navy (#3D405B)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Title (EN)</label>
                              <input
                                type="text"
                                value={card.title_en}
                                onChange={(e) => {
                                  const list = [...settingsForm.why_choose_us];
                                  list[idx] = { ...list[idx], title_en: e.target.value };
                                  setSettingsForm({ ...settingsForm, why_choose_us: list });
                                }}
                                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Title (AR)</label>
                              <input
                                type="text"
                                dir="rtl"
                                value={card.title_ar}
                                onChange={(e) => {
                                  const list = [...settingsForm.why_choose_us];
                                  list[idx] = { ...list[idx], title_ar: e.target.value };
                                  setSettingsForm({ ...settingsForm, why_choose_us: list });
                                }}
                                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] text-right font-arabic"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Desc (EN)</label>
                              <textarea
                                rows={2}
                                value={card.desc_en}
                                onChange={(e) => {
                                  const list = [...settingsForm.why_choose_us];
                                  list[idx] = { ...list[idx], desc_en: e.target.value };
                                  setSettingsForm({ ...settingsForm, why_choose_us: list });
                                }}
                                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] resize-none"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Desc (AR)</label>
                              <textarea
                                rows={2}
                                dir="rtl"
                                value={card.desc_ar}
                                onChange={(e) => {
                                  const list = [...settingsForm.why_choose_us];
                                  list[idx] = { ...list[idx], desc_ar: e.target.value };
                                  setSettingsForm({ ...settingsForm, why_choose_us: list });
                                }}
                                className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] text-right resize-none font-arabic"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </details>

              {/* ── CARD: FAQ CRUD Manager ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">❓</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">FAQ Manager</p>
                      <p className="text-[10px] text-zinc-500">Add, edit, or delete items in the FAQ accordion</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-4 border-t border-zinc-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="text-[10px] uppercase font-bold text-zinc-400">FAQ List ({settingsForm.faqs?.length || 0} items)</h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newFaq = {
                          id: `faq-${Date.now()}`,
                          q_en: 'New Question',
                          q_ar: 'سؤال جديد',
                          a_en: 'Answer details here.',
                          a_ar: 'تفاصيل الإجابة هنا.'
                        };
                        setSettingsForm({
                          ...settingsForm,
                          faqs: [...(settingsForm.faqs || []), newFaq]
                        });
                      }}
                      className="px-2 py-1 bg-brand-accent hover:bg-brand-accent/90 text-white rounded text-[9px] font-bold uppercase cursor-pointer"
                    >
                      + Add FAQ Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(settingsForm.faqs || []).map((faq, idx) => (
                      <div key={faq.id || idx} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...settingsForm.faqs];
                            list.splice(idx, 1);
                            setSettingsForm({ ...settingsForm, faqs: list });
                          }}
                          className="absolute top-2 right-2 text-zinc-600 hover:text-red-400 cursor-pointer font-black"
                        >
                          ×
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Question (EN)</label>
                            <input
                              type="text"
                              value={faq.q_en}
                              onChange={(e) => {
                                const list = [...settingsForm.faqs];
                                list[idx] = { ...list[idx], q_en: e.target.value };
                                setSettingsForm({ ...settingsForm, faqs: list });
                              }}
                              className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Question (AR)</label>
                            <input
                              type="text"
                              dir="rtl"
                              value={faq.q_ar}
                              onChange={(e) => {
                                const list = [...settingsForm.faqs];
                                list[idx] = { ...list[idx], q_ar: e.target.value };
                                setSettingsForm({ ...settingsForm, faqs: list });
                              }}
                              className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] text-right font-arabic"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Answer (EN)</label>
                            <textarea
                              rows={2}
                              value={faq.a_en}
                              onChange={(e) => {
                                const list = [...settingsForm.faqs];
                                list[idx] = { ...list[idx], a_en: e.target.value };
                                setSettingsForm({ ...settingsForm, faqs: list });
                              }}
                              className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Answer (AR)</label>
                            <textarea
                              rows={2}
                              dir="rtl"
                              value={faq.a_ar}
                              onChange={(e) => {
                                const list = [...settingsForm.faqs];
                                list[idx] = { ...list[idx], a_ar: e.target.value };
                                setSettingsForm({ ...settingsForm, faqs: list });
                              }}
                              className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] text-right resize-none font-arabic"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </details>

              {/* ── CARD: Footer Editor ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🦶</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Footer Editor</p>
                      <p className="text-[10px] text-zinc-500">Edit footer copyright, tagline, and Made in Egypt stamp</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-zinc-800 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Footer Tagline (EN)</label>
                      <textarea rows={2}
                        value={settingsForm.text_overrides?.footer_tagline ?? ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          text_overrides: {
                            ...settingsForm.text_overrides,
                            footer_tagline: e.target.value
                          }
                        })}
                        placeholder="Tagline under brand logo in English"
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white text-xs focus:outline-none focus:border-brand-accent resize-none" />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Footer Tagline (AR)</label>
                      <textarea rows={2} dir="rtl"
                        value={settingsForm.text_overrides?.footer_tagline_ar ?? ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          text_overrides: {
                            ...settingsForm.text_overrides,
                            footer_tagline_ar: e.target.value
                          }
                        })}
                        placeholder="شعار الفوتر باللغة العربية"
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white text-xs text-right focus:outline-none focus:border-brand-accent resize-none font-arabic" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/50">
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Footer Copyright Text (EN)</label>
                      <input type="text"
                        value={settingsForm.text_overrides?.footer_copyright ?? ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          text_overrides: {
                            ...settingsForm.text_overrides,
                            footer_copyright: e.target.value
                          }
                        })}
                        placeholder="e.g. © 2026 Fandom Fit. All rights reserved."
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white text-xs focus:outline-none focus:border-brand-accent" />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Footer Copyright Text (AR)</label>
                      <input type="text" dir="rtl"
                        value={settingsForm.text_overrides?.footer_copyright_ar ?? ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          text_overrides: {
                            ...settingsForm.text_overrides,
                            footer_copyright_ar: e.target.value
                          }
                        })}
                        placeholder="نص حقوق النشر باللغة العربية"
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white text-xs text-right focus:outline-none focus:border-brand-accent font-arabic" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/50">
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Stamp Header</label>
                      <input type="text"
                        value={settingsForm.text_overrides?.footer_stamp_badge ?? ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          text_overrides: {
                            ...settingsForm.text_overrides,
                            footer_stamp_badge: e.target.value
                          }
                        })}
                        placeholder="AUTHENTIC"
                        className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white text-[10px] focus:outline-none focus:border-brand-accent" />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Stamp Title</label>
                      <input type="text"
                        value={settingsForm.text_overrides?.footer_stamp_title ?? ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          text_overrides: {
                            ...settingsForm.text_overrides,
                            footer_stamp_title: e.target.value
                          }
                        })}
                        placeholder="MADE IN EGYPT"
                        className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white text-[10px] focus:outline-none focus:border-brand-accent" />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5">Stamp Desc</label>
                      <input type="text"
                        value={settingsForm.text_overrides?.footer_stamp_desc ?? ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          text_overrides: {
                            ...settingsForm.text_overrides,
                            footer_stamp_desc: e.target.value
                          }
                        })}
                        placeholder="100% Fine Cotton"
                        className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white text-[10px] focus:outline-none focus:border-brand-accent" />
                    </div>
                  </div>
                </div>
              </details>

              {/* ── CARD: Payment Settings (Paymob + InstaPay) ── */}
              <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💳</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase">Payment Gateway Settings</p>
                      <p className="text-[10px] text-zinc-500">Configure Paymob (visa/mastercard/fawry) and InstaPay</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-bold group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-zinc-800 space-y-5">
                  {!isPaymentSessionValid ? (
                    <div className="py-6 text-center space-y-3 font-mono">
                      <span className="text-2xl block">🔒</span>
                      <h4 className="text-xs font-black uppercase text-white">Security Verification Required</h4>
                      <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">
                        Please enter the administrative password to view or modify sensitive payment configurations.
                      </p>
                      <div className="flex gap-2 justify-center max-w-xs mx-auto pt-2">
                        <input
                          type="password"
                          placeholder="Password"
                          value={paymentPasswordInput}
                          onChange={(e) => setPaymentPasswordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleVerifyPaymentPassword();
                            }
                          }}
                          className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyPaymentPassword}
                          className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg text-xs font-black uppercase cursor-pointer"
                        >
                          Verify
                        </button>
                      </div>
                      {paymentPasswordError && (
                        <p className="text-[10px] font-bold text-red-500 mt-1">⚠️ {paymentPasswordError}</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Session time active indicator */}
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 bg-zinc-950 p-2.5 border border-zinc-800 rounded-xl font-mono">
                        <span className="font-bold text-green-400">🟢 Security Session Active</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPaymentSessionValid(false);
                            setPaymentPasswordInput('');
                          }}
                          className="text-red-400 hover:text-red-300 font-bold uppercase text-[9px] cursor-pointer"
                        >
                          Lock Settings
                        </button>
                      </div>

                      {/* Paymob Section */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase text-brand-accent border-b border-zinc-800 pb-1 flex justify-between items-center select-none">
                          <span>Paymob Settings</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-zinc-400">
                            <input
                              type="checkbox"
                              checked={paymentSettingsForm.paymob_enabled}
                              onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, paymob_enabled: e.target.checked })}
                              className="accent-brand-accent"
                            />
                            Enable Paymob
                          </label>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">API Key</label>
                            <div className="flex gap-1.5">
                              <input
                                type={revealApiKey ? 'text' : 'password'}
                                value={paymentSettingsForm.paymob_api_key}
                                onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, paymob_api_key: e.target.value })}
                                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-brand-accent"
                              />
                              <button
                                type="button"
                                onClick={() => setRevealApiKey(!revealApiKey)}
                                className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                {revealApiKey ? 'Hide' : 'Show'}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Secret Key</label>
                            <div className="flex gap-1.5">
                              <input
                                type={revealSecretKey ? 'text' : 'password'}
                                value={paymentSettingsForm.paymob_secret_key}
                                onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, paymob_secret_key: e.target.value })}
                                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-brand-accent"
                              />
                              <button
                                type="button"
                                onClick={() => setRevealSecretKey(!revealSecretKey)}
                                className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                {revealSecretKey ? 'Hide' : 'Show'}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">HMAC Secret</label>
                            <div className="flex gap-1.5">
                              <input
                                type={revealHmacSecret ? 'text' : 'password'}
                                value={paymentSettingsForm.paymob_hmac_secret}
                                onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, paymob_hmac_secret: e.target.value })}
                                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-brand-accent"
                              />
                              <button
                                type="button"
                                onClick={() => setRevealHmacSecret(!revealHmacSecret)}
                                className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                {revealHmacSecret ? 'Hide' : 'Show'}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Public Key</label>
                            <div className="flex gap-1.5">
                              <input
                                type={revealPublicKey ? 'text' : 'password'}
                                value={paymentSettingsForm.paymob_public_key}
                                onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, paymob_public_key: e.target.value })}
                                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-brand-accent"
                              />
                              <button
                                type="button"
                                onClick={() => setRevealPublicKey(!revealPublicKey)}
                                className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                {revealPublicKey ? 'Hide' : 'Show'}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Card Integration ID</label>
                            <input
                              type="text"
                              value={paymentSettingsForm.paymob_integration_id_card}
                              onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, paymob_integration_id_card: e.target.value })}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-brand-accent"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Fawry Integration ID</label>
                            <input
                              type="text"
                              value={paymentSettingsForm.paymob_integration_id_fawry}
                              onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, paymob_integration_id_fawry: e.target.value })}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-brand-accent"
                            />
                          </div>
                        </div>
                      </div>

                      {/* InstaPay Section */}
                      <div className="space-y-4 pt-2">
                        <h4 className="text-xs font-black uppercase text-brand-accent border-b border-zinc-800 pb-1 flex justify-between items-center select-none">
                          <span>InstaPay Settings</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-zinc-400">
                            <input
                              type="checkbox"
                              checked={paymentSettingsForm.instapay_enabled}
                              onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, instapay_enabled: e.target.checked })}
                              className="accent-brand-accent"
                            />
                            Enable InstaPay
                          </label>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Phone Number</label>
                            <input
                              type="text"
                              value={paymentSettingsForm.instapay_phone}
                              onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, instapay_phone: e.target.value })}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-brand-accent"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Account Holder Name</label>
                            <input
                              type="text"
                              value={paymentSettingsForm.instapay_name}
                              onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, instapay_name: e.target.value })}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">QR Code Image</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={paymentSettingsForm.instapay_qr_code}
                                onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, instapay_qr_code: e.target.value })}
                                placeholder="Image URL or upload"
                                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                              />
                              <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center shrink-0">
                                {isUploadingQrCode ? '⏳ ...' : '📁 Upload'}
                                <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                              </label>
                            </div>
                            {paymentSettingsForm.instapay_qr_code && (
                              <div className="mt-2 flex items-center gap-2">
                                <img src={paymentSettingsForm.instapay_qr_code} alt="QR Code Preview" className="h-8 object-contain rounded border border-zinc-800 bg-zinc-950" />
                                <span className="text-[8px] text-zinc-500 truncate max-w-[150px]">{paymentSettingsForm.instapay_qr_code}</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Payment Link (optional)</label>
                            <input
                              type="text"
                              value={paymentSettingsForm.instapay_link}
                              onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, instapay_link: e.target.value })}
                              placeholder="e.g. instapay://link..."
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                            />
                          </div>
                        </div>
                      </div>

                      {/* COD Settings Section */}
                      <div className="space-y-4 pt-4 border-t border-zinc-800">
                        <h4 className="text-xs font-black uppercase text-brand-accent border-b border-zinc-800 pb-1 flex justify-between items-center select-none">
                          <span>Cash on Delivery (COD) Settings</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-zinc-400">
                            <input
                              type="checkbox"
                              checked={paymentSettingsForm.cod_enabled}
                              onChange={(e) => setPaymentSettingsForm({ ...paymentSettingsForm, cod_enabled: e.target.checked })}
                              className="accent-brand-accent"
                            />
                            Enable Cash on Delivery (COD)
                          </label>
                        </h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                          Allow customers to select Cash on Delivery. Note that for Custom Design checkouts, COD automatically requires a 50% upfront payment via online card or InstaPay screenshot upload.
                        </p>
                      </div>

                      {/* Manual Save Trigger for Payment Settings */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleSavePaymentSettings}
                          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase cursor-pointer border border-zinc-700 transition-colors"
                        >
                          Save Payment Credentials Only
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </details>

              {/* ── Save Button ── */}
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white font-black rounded-xl uppercase text-sm cursor-pointer transition-colors shadow-[0_4px_0_rgba(0,0,0,0.3)]">
                <Save size={16} />
                Save All Settings
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

            <div className="flex gap-2 border-b border-zinc-800 pb-2 flex-wrap">
              {[
                { id: 'all', label: locale === 'ar' ? 'كل الطلبات' : 'All Orders' },
                { id: 'pending_verification', label: locale === 'ar' ? 'بانتظار التأكيد' : 'Pending Verification' },
                { id: 'paid', label: locale === 'ar' ? 'تم الدفع' : 'Paid' },
                { id: 'rejected', label: locale === 'ar' ? 'المرفوضة' : 'Rejected' },
                { id: 'payment_failed', label: locale === 'ar' ? 'فشل الدفع' : 'Payment Failed' },
                { id: 'cancelled', label: locale === 'ar' ? 'الملغية' : 'Cancelled' },
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

            {/* Bulk Actions & Exports Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl font-mono text-left">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const filtered = orders.filter(o => {
                      const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                      if (!matchesStatus) return false;
                      const code = (o.order_code || o.id.split('-')[0]).toLowerCase();
                      const query = orderSearchQuery.toLowerCase();
                      const rejectionMatch = o.rejection_reason && o.rejection_reason.toLowerCase().includes(query);
                      return code.includes(query) || o.customer_name.toLowerCase().includes(query) || o.customer_phone.includes(query) || !!rejectionMatch;
                    });
                    
                    const selectedList = filtered.filter(o => selectedOrderIds[o.id]);
                    const toPrint = selectedList.length > 0 ? selectedList : filtered;
                    handlePrintOrders(toPrint);
                  }}
                  className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs font-black uppercase rounded-xl cursor-pointer flex items-center gap-1.5 transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  🖨️ {locale === 'ar' ? 'طباعة الفواتير / البوالص' : 'Print Shipping Labels'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const filtered = orders.filter(o => {
                      const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                      if (!matchesStatus) return false;
                      const code = (o.order_code || o.id.split('-')[0]).toLowerCase();
                      const query = orderSearchQuery.toLowerCase();
                      const rejectionMatch = o.rejection_reason && o.rejection_reason.toLowerCase().includes(query);
                      return code.includes(query) || o.customer_name.toLowerCase().includes(query) || o.customer_phone.includes(query) || !!rejectionMatch;
                    });
                    
                    const selectedList = filtered.filter(o => selectedOrderIds[o.id]);
                    const toExport = selectedList.length > 0 ? selectedList : filtered;
                    handleExportToExcel(toExport);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs font-black uppercase rounded-xl cursor-pointer flex items-center gap-1.5 transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  📊 {locale === 'ar' ? 'تصدير إكسل (CSV)' : 'Export Excel (CSV)'}
                </button>
              </div>

              {(() => {
                const totalFiltered = orders.filter(o => {
                  const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                  if (!matchesStatus) return false;
                  const code = (o.order_code || o.id.split('-')[0]).toLowerCase();
                  const query = orderSearchQuery.toLowerCase();
                  const rejectionMatch = o.rejection_reason && o.rejection_reason.toLowerCase().includes(query);
                  return code.includes(query) || o.customer_name.toLowerCase().includes(query) || o.customer_phone.includes(query) || !!rejectionMatch;
                });
                const selectedCount = totalFiltered.filter(o => selectedOrderIds[o.id]).length;
                
                return (
                  <span className="text-[10px] uppercase font-bold text-zinc-400">
                    {selectedCount > 0 
                      ? (locale === 'ar' ? `تم تحديد ${selectedCount} من أصل ${totalFiltered.length}` : `${selectedCount} of ${totalFiltered.length} selected for actions`) 
                      : (locale === 'ar' ? 'تطبق الإجراءات على الكل إذا لم يتم تحديد خيار' : 'Actions apply to all filtered orders if none checked')}
                  </span>
                );
              })()}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left font-mono">
                <thead className="bg-zinc-800 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="p-4 w-[50px] text-center">
                      <input
                        type="checkbox"
                        checked={orders && (() => {
                          const filtered = orders.filter(o => {
                            const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                            if (!matchesStatus) return false;
                            const code = (o.order_code || o.id.split('-')[0]).toLowerCase();
                            const query = orderSearchQuery.toLowerCase();
                            const rejectionMatch = o.rejection_reason && o.rejection_reason.toLowerCase().includes(query);
                            return code.includes(query) || o.customer_name.toLowerCase().includes(query) || o.customer_phone.includes(query) || !!rejectionMatch;
                          });
                          return filtered.length > 0 && filtered.every(o => selectedOrderIds[o.id]);
                        })()}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const filtered = orders.filter(o => {
                            const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                            if (!matchesStatus) return false;
                            const code = (o.order_code || o.id.split('-')[0]).toLowerCase();
                            const query = orderSearchQuery.toLowerCase();
                            const rejectionMatch = o.rejection_reason && o.rejection_reason.toLowerCase().includes(query);
                            return code.includes(query) || o.customer_name.toLowerCase().includes(query) || o.customer_phone.includes(query) || !!rejectionMatch;
                          });
                          const nextSelected = { ...selectedOrderIds };
                          filtered.forEach(o => {
                            if (checked) {
                              nextSelected[o.id] = true;
                            } else {
                              delete nextSelected[o.id];
                            }
                          });
                          setSelectedOrderIds(nextSelected);
                        }}
                        className="cursor-pointer rounded border-zinc-700 bg-zinc-950 text-brand-accent focus:ring-brand-accent focus:ring-offset-zinc-900"
                      />
                    </th>
                    <th className="p-4">{locale === 'ar' ? 'الكود' : 'Code'}</th>
                    <th className="p-4">{locale === 'ar' ? 'العميل' : 'Customer'}</th>
                    <th className="p-4">{locale === 'ar' ? 'رقم الهاتف' : 'Phone'}</th>
                    <th className="p-4">{locale === 'ar' ? 'المحافظة / العنوان' : 'Location'}</th>
                    <th className="p-4">{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="p-4">{locale === 'ar' ? 'تفاصيل الطلب والدفع' : 'Order & Payment Details'}</th>
                    <th className="p-4 text-right">{locale === 'ar' ? 'الحالة والإجراءات' : 'Status & Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-xs">
                  {orders && orders.length > 0 ? (
                    (() => {
                      const filtered = [...orders].filter(o => {
                        const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                        if (!matchesStatus) return false;

                        const code = (o.order_code || o.id.split('-')[0]).toLowerCase();
                        const query = orderSearchQuery.toLowerCase();
                        const rejectionMatch = o.rejection_reason && o.rejection_reason.toLowerCase().includes(query);
                        return code.includes(query) || 
                               o.customer_name.toLowerCase().includes(query) || 
                               o.customer_phone.includes(query) ||
                               !!rejectionMatch;
                      });
                      
                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-zinc-500 font-semibold">
                              {locale === 'ar' ? 'لم يتم العثور على نتائج.' : 'No matching orders found.'}
                            </td>
                          </tr>
                        );
                      }

                      return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order) => {
                        const badgeColors: Record<string, string> = {
                          pending_payment: 'bg-orange-950/40 text-orange-400 border border-orange-900',
                          pending_verification: 'bg-blue-950/40 text-blue-400 border border-blue-900',
                          paid: 'bg-green-950/40 text-green-400 border border-green-900',
                          payment_failed: 'bg-red-950/40 text-red-400 border border-red-900',
                          rejected: 'bg-red-950/40 text-red-400 border border-red-900',
                          cancelled: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
                          refunded: 'bg-zinc-800 text-zinc-500 border border-zinc-750',
                          in_progress: 'bg-cyan-950/40 text-cyan-400 border border-cyan-900',
                          shipped: 'bg-purple-950/40 text-purple-400 border border-purple-900',
                          confirmed: 'bg-green-950/40 text-green-400 border border-green-900',
                          completed: 'bg-green-950/50 text-green-400 border border-green-900'
                        };

                        return (
                          <tr key={order.id} className={`text-zinc-300 transition-colors ${order.notes && order.notes.includes('[Order Edited by Customer]') ? 'bg-red-950/25 hover:bg-red-950/40 border-l-2 border-red-500' : 'hover:bg-zinc-800/20'}`}>
                            <td className="p-4 text-center">
                              <input
                                type="checkbox"
                                checked={!!selectedOrderIds[order.id]}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setSelectedOrderIds(prev => {
                                    const copy = { ...prev };
                                    if (checked) {
                                      copy[order.id] = true;
                                    } else {
                                      delete copy[order.id];
                                    }
                                    return copy;
                                  });
                                }}
                                className="cursor-pointer rounded border-zinc-700 bg-zinc-950 text-brand-accent focus:ring-brand-accent focus:ring-offset-zinc-900"
                              />
                            </td>
                            <td className="p-4 font-bold text-brand-accent uppercase">
                              <div>{order.order_code || `#${order.id.split('-')[0]}`}</div>
                              {order.notes && order.notes.includes('[Order Edited by Customer]') && (
                                <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-950/60 border border-red-500 text-red-500 rounded text-[9px] font-black uppercase">
                                  {locale === 'ar' ? 'تم التعديل' : 'Edited'}
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-bold text-white flex items-center gap-1.5">
                              {getCancelledCount(order.customer_phone) > 1 && (
                                <span className="relative flex h-2 w-2 mr-0.5 shrink-0" title={`Warning: Cancelled ${getCancelledCount(order.customer_phone)} past orders!`}>
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                              )}
                              <span>{order.customer_name}</span>
                            </td>
                            <td className="p-4 text-brand-accent font-semibold">{order.customer_phone}</td>
                            <td className="p-4 max-w-xs font-semibold">{order.location}</td>
                            <td className="p-4 whitespace-nowrap">
                              <div className="text-zinc-300 font-bold">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                              <div className="text-zinc-500 text-[9px]">{new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td className="p-4 max-w-sm space-y-2">
                              <div className="text-white font-bold">{order.product_name} ({order.price} EGP)</div>
                              {order.items && Array.isArray(order.items) && (
                                <div className="mt-1.5 space-y-2 bg-zinc-950 p-2.5 border border-zinc-800 rounded">
                                  {order.items.map((item: any, idx: number) => {
                                    const itemDesigns = allDesigns.filter(d => d.product_id === item.product_id);
                                    return (
                                      <div key={idx} className="text-[10px] space-y-1 py-1 border-b border-zinc-900 last:border-b-0">
                                        <div className="flex items-center justify-between text-zinc-300">
                                          <span>
                                            • {item.product_name} ({item.size}) x{item.quantity}
                                          </span>
                                          <span className="text-[9px] text-zinc-500 font-bold">
                                            ({item.fabric})
                                          </span>
                                        </div>
                                        
                                        {itemDesigns.length > 0 && (
                                          <div className="pl-3.5 pt-1 space-y-1 border-l-2 border-brand-accent/30">
                                            <span className="text-[8px] text-zinc-500 block uppercase font-bold">Designs:</span>
                                            {itemDesigns.map((d, dIdx) => (
                                              <div key={d.id || dIdx} className="flex items-center gap-2 text-[9px] text-zinc-300">
                                                <span>🎨 {d.notes || 'Design file'}</span>
                                                <a 
                                                  href={d.design_url} 
                                                  target="_blank" 
                                                  rel="noreferrer" 
                                                  className="text-[8px] font-black text-brand-accent hover:underline bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded"
                                                >
                                                  Open Reference
                                                </a>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Before Edit Specifications Diff */}
                              {(() => {
                                const beforeEditMatch = order.notes && order.notes.match(/\[Before Edit:\s*([^\]]+)\]/);
                                if (!beforeEditMatch) return null;
                                return (
                                  <div className="mt-1.5 p-2 bg-red-950/20 border border-red-900/60 rounded text-[10px] text-red-400">
                                    <div className="font-extrabold uppercase text-[8px] tracking-wider mb-1 text-red-500">
                                      {locale === 'ar' ? '◀ المواصفات السابقة قبل التعديل:' : '◀ PRE-EDIT SPECIFICATIONS:'}
                                    </div>
                                    <div className="font-semibold leading-relaxed font-sans">{beforeEditMatch[1]}</div>
                                  </div>
                                );
                              })()}
                              
                              {/* Payment info detail block */}
                                <div className="text-[10px] text-zinc-400 mt-1.5 font-bold space-y-1 bg-zinc-950 p-2 border border-zinc-850 rounded">
                                  <div className="flex justify-between">
                                    <span>PAYMENT METHOD:</span>
                                    <span className="text-white">
                                      {order.payment_method === 'instapay' ? 'InstaPay Manual' : order.payment_method?.startsWith('paymob') ? 'Pay Online (Paymob)' : 'Cash on Delivery (COD)'}
                                    </span>
                                  </div>
                                  {/* Total / Due breakdown for upfront-paid orders */}
                                  {(() => {
                                    const total = Number(order.price || 0);
                                    const notes = order.notes || '';
                                    // COD: parse balance due from notes
                                    const codBalanceMatch = notes.match(/Balance due on delivery:\s*(\d+(?:\.\d+)?)\s*EGP/);
                                    const codDepositMatch = notes.match(/upfront\.\s*Balance/i);
                                    // Edit price rise: extra due for online
                                    const editDueMatch = notes.match(/Price rose by \+(\d+(?:\.\d+)?)\s*EGP/);

                                    if (codBalanceMatch && codDepositMatch) {
                                      const due = Number(codBalanceMatch[1]);
                                      const paid = total - due;
                                      return (
                                        <>
                                          <div className="flex justify-between text-[9px] border-t border-zinc-800 pt-1 mt-1">
                                            <span className="text-zinc-400">TOTAL:</span>
                                            <span className="text-white font-black">{total} EGP</span>
                                          </div>
                                          <div className="flex justify-between text-[9px]">
                                            <span className="text-green-400">PAID UPFRONT:</span>
                                            <span className="text-green-400 font-black">{paid} EGP</span>
                                          </div>
                                          <div className="flex justify-between text-[9px]">
                                            <span className="text-amber-400">DUE ON DELIVERY:</span>
                                            <span className="text-amber-400 font-black">{due} EGP</span>
                                          </div>
                                           {/* Printable Shipment Amount Box */}
                                           <div className="mt-1.5 p-1 bg-zinc-900 border border-dashed border-zinc-700 text-white rounded text-center select-all print:border-black print:text-black">
                                             <div className="text-[7.5px] uppercase tracking-wider font-extrabold text-zinc-500 print:text-black">
                                               {locale === 'ar' ? 'المبلغ المطلوب تحصيله للشحن:' : 'COLLECT FOR SHIPMENT:'}
                                             </div>
                                             <div className="text-xs font-black text-brand-accent print:text-black underline">
                                               {due} EGP
                                             </div>
                                           </div>
                                        </>
                                      );
                                    } else if (editDueMatch) {
                                      const extraDue = Number(editDueMatch[1]);
                                      return (
                                        <>
                                          <div className="flex justify-between text-[9px] border-t border-zinc-800 pt-1 mt-1">
                                            <span className="text-zinc-400">TOTAL:</span>
                                            <span className="text-white font-black">{total} EGP</span>
                                          </div>
                                          <div className="flex justify-between text-[9px]">
                                            <span className="text-amber-400">EXTRA DUE (EDIT):</span>
                                            <span className="text-amber-400 font-black">+{extraDue} EGP</span>
                                          </div>
                                        </>
                                      );
                                    } else {
                                      return (
                                        <div className="flex justify-between text-[9px] border-t border-zinc-800 pt-1 mt-1">
                                          <span className="text-zinc-400">TOTAL:</span>
                                          <span className="text-white font-black">{total} EGP</span>
                                        </div>
                                      );
                                    }
                                  })()}
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

                                  {/* Receipt Screenshot Preview & Download */}
                                  {order.payment_receipt_url && (
                                    <div className="mt-2 space-y-1.5 border-t border-zinc-800 pt-2 select-none">
                                      <span className="text-[8px] uppercase font-bold text-zinc-500 block">Transaction Screenshot:</span>
                                      <div className="relative w-28 aspect-[3/4] border border-zinc-800 rounded bg-zinc-900 overflow-hidden group">
                                        <img
                                          src={order.payment_receipt_url}
                                          alt="InstaPay Receipt"
                                          className="w-full h-full object-cover"
                                        />
                                        <a
                                          href={order.payment_receipt_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white font-black uppercase transition-opacity"
                                        >
                                          Open Image
                                        </a>
                                      </div>
                                      <a
                                        href={order.payment_receipt_url}
                                        download={`receipt-${order.order_code || order.id}.jpg`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-2 py-0.5 bg-zinc-850 hover:bg-zinc-800 text-[8px] font-bold text-white border border-zinc-700 rounded transition-colors"
                                      >
                                        Download Screenshot
                                      </a>
                                    </div>
                                  )}
                                  {order.rejection_reason && (
                                    <div className="text-red-400 text-[9.5px] border-t border-zinc-800 pt-1 mt-1">
                                      REJECTION NOTE: "{order.rejection_reason}"
                                    </div>
                                  )}
                                </div>

                              <div className="text-[10px] text-zinc-500 mt-1 whitespace-pre-wrap">{order.notes}</div>
                            </td>
                            <td className="p-4 text-right space-y-2.5">
                              {/* Status Badge */}
                              <div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${badgeColors[order.status] || 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                                  {order.status}
                                </span>
                              </div>

                              {/* Manual Status Select Dropdown */}
                              <div>
                                <select
                                  value={order.status}
                                  onChange={async (e) => {
                                    const nextStatus = e.target.value;
                                    if (nextStatus === 'rejected') {
                                      setShowRejectBox(prev => ({ ...prev, [order.id]: true }));
                                    } else {
                                      await useStore.getState().updateOrderStatus(order.id, nextStatus);
                                    }
                                  }}
                                  className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-white text-[10px] font-bold focus:outline-none focus:border-brand-accent cursor-pointer"
                                >
                                  <option value="pending_payment">Pending Payment</option>
                                  <option value="pending_verification">Pending Verification</option>
                                  <option value="paid">Paid</option>
                                  <option value="payment_failed">Payment Failed</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                  <option value="refunded">Refunded</option>
                                </select>
                              </div>

                              {/* Individual Order Print Button */}
                              <div className="pt-1 select-none">
                                <button
                                  type="button"
                                  onClick={() => handlePrintOrders([order])}
                                  className="w-full px-2 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-white rounded text-[9px] font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  🖨️ {locale === 'ar' ? 'البوليصة' : 'Label'}
                                </button>
                              </div>

                              {/* Quick actions for Pending Verification */}
                              {order.payment_method === 'instapay' && order.status === 'pending_verification' && (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={async () => {
                                      await useStore.getState().updateOrderStatus(order.id, 'paid');
                                    }}
                                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] uppercase font-black transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowRejectBox(prev => ({ ...prev, [order.id]: true }));
                                    }}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] uppercase font-black transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}

                              {/* Inline Rejection Reason Box */}
                              {showRejectBox[order.id] && (
                                <div className="mt-2 text-left space-y-2 bg-zinc-950 p-2 border border-zinc-800 rounded max-w-[200px] ml-auto">
                                  <textarea
                                    placeholder="Enter rejection reason..."
                                    value={rejectionReasonInput[order.id] || ''}
                                    onChange={(e) => setRejectionReasonInput({ ...rejectionReasonInput, [order.id]: e.target.value })}
                                    className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-white focus:outline-none"
                                    rows={2}
                                  />
                                  <div className="flex gap-1 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setShowRejectBox(prev => ({ ...prev, [order.id]: false }))}
                                      className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px] uppercase font-bold cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const reason = rejectionReasonInput[order.id] || 'Invalid payment receipt';
                                        await useStore.getState().updateOrderStatus(order.id, 'rejected', reason);
                                        setShowRejectBox(prev => ({ ...prev, [order.id]: false }));
                                      }}
                                      className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] uppercase font-bold cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    })()
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-zinc-500 font-semibold">
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

        {/* TAB 7.5: CANCELLED ORDERS */}
        {activeTab === 'cancelled-orders' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase text-white">
              {locale === 'ar' ? 'الطلبات الملغاة' : 'Cancelled Orders'}
            </h2>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left font-mono">
                  <thead className="bg-zinc-800 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="p-4">{locale === 'ar' ? 'الكود' : 'Code'}</th>
                      <th className="p-4">{locale === 'ar' ? 'العميل' : 'Customer'}</th>
                      <th className="p-4">{locale === 'ar' ? 'المنتجات' : 'Items'}</th>
                      <th className="p-4">{locale === 'ar' ? 'سبب الإلغاء' : 'Cancellation Reason'}</th>
                      <th className="p-4">{locale === 'ar' ? 'إيصال الدفع' : 'Receipt'}</th>
                      <th className="p-4">{locale === 'ar' ? 'حالة الاسترجاع' : 'Refund Status'}</th>
                      <th className="p-4 text-right">{locale === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-xs">
                    {(() => {
                      const cancelled = orders.filter(o => o.status === 'cancelled');
                      if (cancelled.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-zinc-500 font-semibold">
                              {locale === 'ar' ? 'لا توجد طلبات ملغاة.' : 'No cancelled orders found.'}
                            </td>
                          </tr>
                        );
                      }
                      return cancelled.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-800/20 text-zinc-300">
                          <td className="p-4 font-bold text-brand-accent uppercase">
                            <div>{order.order_code || `#${order.id.split('-')[0]}`}</div>
                            {order.notes && order.notes.includes('[Order Edited by Customer]') && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-950/60 border border-red-500 text-red-500 rounded text-[9px] font-black uppercase">
                                {locale === 'ar' ? 'تم التعديل' : 'Edited'}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {getCancelledCount(order.customer_phone) > 1 && (
                                <span className="relative flex h-2 w-2 mr-0.5 shrink-0" title={`Warning: Cancelled ${getCancelledCount(order.customer_phone)} past orders!`}>
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                              )}
                              <span>{order.customer_name}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500">{order.customer_phone}</div>
                          </td>
                          <td className="p-4 max-w-xs space-y-1">
                            <div className="text-white font-bold">{order.product_name} ({order.price} EGP)</div>
                            {order.items && Array.isArray(order.items) && (
                              <div className="text-[10px] text-zinc-400">
                                {order.items.map((it: any, idx: number) => (
                                  <div key={idx}>
                                    • {it.product_name} ({it.size}) x{it.quantity}
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Before Edit Specifications Diff */}
                            {(() => {
                              const beforeEditMatch = order.notes && order.notes.match(/\[Before Edit:\s*([^\]]+)\]/);
                              if (!beforeEditMatch) return null;
                              return (
                                <div className="mt-1.5 p-2 bg-red-950/20 border border-red-900/60 rounded text-[10px] text-red-400">
                                  <div className="font-extrabold uppercase text-[8px] tracking-wider mb-1 text-red-500">
                                    {locale === 'ar' ? '◀ المواصفات السابقة قبل التعديل:' : '◀ PRE-EDIT SPECIFICATIONS:'}
                                  </div>
                                  <div className="font-semibold leading-relaxed font-sans">{beforeEditMatch[1]}</div>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="p-4 max-w-xs text-red-400 font-semibold break-words">
                            {order.cancel_reason || order.rejection_reason || (locale === 'ar' ? 'غير محدد' : 'Not specified')}
                          </td>
                          <td className="p-4">
                            {order.payment_receipt_url ? (
                              <a
                                href={order.payment_receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-brand-accent rounded text-[10px] uppercase font-bold border border-zinc-750 inline-block"
                              >
                                View Receipt
                              </a>
                            ) : (
                              <span className="text-zinc-650 italic">No receipt</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              order.is_refunded
                                ? 'bg-green-950/40 text-green-400 border border-green-900'
                                : 'bg-red-950/40 text-red-400 border border-red-900 animate-pulse'
                            }`}>
                              {order.is_refunded 
                                ? (locale === 'ar' ? 'تم الاسترجاع' : 'Refunded') 
                                : (locale === 'ar' ? 'معلق الاسترجاع' : 'Pending Refund')}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {!order.is_refunded ? (
                              <button
                                type="button"
                                disabled={isMarkingRefunded === order.id}
                                onClick={() => handleMarkRefunded(order.id)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] uppercase font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all active:translate-y-0.5 cursor-pointer"
                              >
                                {isMarkingRefunded === order.id ? 'Saving...' : (locale === 'ar' ? 'تأكيد الاسترجاع' : 'Mark Refunded')}
                              </button>
                            ) : (
                              <span className="text-green-500 font-bold">✓ Complete</span>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: DESIGNS EXPLORER */}
        {activeTab === 'designs-explorer' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase text-white">
                {locale === 'ar' ? 'مستكشف التصاميم' : 'Designs Explorer'}
              </h2>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded font-mono uppercase">
                🔒 {locale === 'ar' ? 'مشاهدة المدير فقط' : 'Admin Eye Only'}
              </span>
            </div>

            {explorerProductId === null ? (
              /* ================= MAIN PRODUCTS LIST VIEW ================= */
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 font-mono">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-850 pb-4">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">
                      {locale === 'ar' 
                        ? 'استعرض المنتجات وملفات التصميم الخاصة بكل منتج.'
                        : 'Select a product to view, edit, upload, or download print-ready files and production mockups.'}
                    </p>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">
                      Total Products: {products.length} | Attached Designs: {allDesigns.length}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={explorerDesignUrlInput} // Reuse explorerDesignUrlInput state for products search
                    onChange={(e) => setExplorerDesignUrlInput(e.target.value)}
                    placeholder={locale === 'ar' ? 'ابحث بالمنتج...' : 'Search products...'}
                    className="w-full sm:max-w-xs px-3.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
                  />
                </div>

                {(() => {
                  const filteredProds = products.filter(p => {
                    const term = explorerDesignUrlInput.toLowerCase().trim();
                    if (!term) return true;
                    return p.name_en.toLowerCase().includes(term) || p.name_ar.includes(term);
                  });

                  if (filteredProds.length === 0) {
                    return (
                      <div className="text-center py-12 bg-zinc-950 rounded-xl border border-zinc-850">
                        <p className="text-sm text-zinc-500 font-semibold italic">No products found matching your search.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProds.map((prod) => {
                        const productDesignsList = allDesigns.filter(d => d.product_id === prod.id);
                        const count = productDesignsList.length;
                        const mainImage = prod.images?.[0] || '/placeholders/arcade_front.jpg';

                        return (
                          <div key={prod.id} className="bg-zinc-950 border border-zinc-800 hover:border-zinc-750 rounded-xl p-4 flex flex-col justify-between gap-4 transition-all">
                            <div className="flex gap-3">
                              {/* Visual Thumbnail */}
                              <div className="relative w-14 h-14 bg-zinc-900 border border-zinc-800 rounded overflow-hidden shrink-0">
                                <Image src={mainImage} alt={prod.name_en} fill className="object-cover" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[9px] font-black uppercase text-brand-accent tracking-wider block">
                                  {categories.find(c => c.id === prod.category_id)?.name_en || 'Collection'}
                                </span>
                                <h4 className="text-xs font-bold text-white mt-0.5 leading-tight truncate">
                                  {locale === 'ar' ? prod.name_ar : prod.name_en}
                                </h4>
                                <span className={`text-[9px] font-mono block mt-1.5 ${count > 0 ? 'text-green-500 font-bold' : 'text-zinc-500 font-semibold italic'}`}>
                                  ● {count > 0 ? `${count} designs uploaded` : 'No designs uploaded'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-zinc-900 pt-3 gap-2">
                              <button
                                onClick={() => {
                                  setExplorerProductId(prod.id);
                                  setExplorerDesignNotesInput('');
                                  setExplorerDesignUrlInput('');
                                }}
                                className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded text-[10px] uppercase cursor-pointer transition-colors text-center font-mono"
                              >
                                {locale === 'ar' ? 'إدارة التصاميم' : 'Manage Designs'}
                              </button>
                              {count > 0 && (
                                <button
                                  onClick={() => downloadAllProductDesigns(productDesignsList, prod.name_en)}
                                  className="px-2.5 py-1.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded text-[10px] uppercase cursor-pointer transition-colors text-center font-mono"
                                  title="Download all design files of this product"
                                >
                                  ⬇ All ({count})
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* ================= DETAILED PRODUCT DESIGN PANEL VIEW ================= */
              (() => {
                const prod = products.find(p => p.id === explorerProductId);
                if (!prod) {
                  setExplorerProductId(null);
                  return null;
                }
                const productDesignsList = allDesigns.filter(d => d.product_id === prod.id);
                const mainImage = prod.images?.[0] || '/placeholders/arcade_front.jpg';

                return (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 font-mono">
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-850 pb-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            setExplorerProductId(null);
                            setExplorerDesignNotesInput('');
                            setExplorerDesignUrlInput('');
                          }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-755 text-white font-bold rounded-lg text-[10px] uppercase cursor-pointer transition-colors"
                        >
                          ← {locale === 'ar' ? 'رجوع' : 'Back'}
                        </button>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 border border-zinc-800 rounded overflow-hidden bg-zinc-950 shrink-0">
                            <Image src={mainImage} alt={prod.name_en} fill className="object-cover" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white leading-tight">
                              {locale === 'ar' ? prod.name_ar : prod.name_en}
                            </h3>
                            <span className="text-[9px] uppercase text-zinc-500 font-black">
                              Category: {categories.find(c => c.id === prod.category_id)?.name_en || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {productDesignsList.length > 0 && (
                        <button
                          onClick={() => downloadAllProductDesigns(productDesignsList, prod.name_en)}
                          className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg text-xs uppercase cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
                        >
                          ⬇ {locale === 'ar' ? 'تحميل الكل' : 'Download All Designs'} ({productDesignsList.length})
                        </button>
                      )}
                    </div>

                    {/* Designs Gallery / List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-brand-accent tracking-wider">
                        Attached Print Files & Mockups ({productDesignsList.length})
                      </h4>

                      {productDesignsList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {productDesignsList.map((design, idx) => {
                            const isEditingThis = (design.id === editingDesignId);
                            const mainImage = design.design_url.startsWith('data:image') || design.design_url.includes('.jpg') || design.design_url.includes('.png') || design.design_url.includes('.webp') || design.design_url.startsWith('blob:');

                            return (
                              <div key={design.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  {/* Visual Thumbnail */}
                                  <div className="relative w-12 h-12 bg-zinc-900 border border-zinc-800 rounded overflow-hidden shrink-0 flex items-center justify-center">
                                    {mainImage ? (
                                      <Image src={design.design_url} alt="design-preview" fill className="object-cover" />
                                    ) : (
                                      <span className="text-[10px] text-zinc-500 font-black">FILE</span>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    {isEditingThis ? (
                                      <div className="flex gap-1.5 items-center">
                                        <input
                                          type="text"
                                          value={editingDesignNotes}
                                          onChange={(e) => setEditingDesignNotes(e.target.value)}
                                          className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-white text-xs focus:outline-none flex-1 font-bold font-mono"
                                          autoFocus
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleSaveDesignNotes(design, idx)}
                                          className="p-1 text-green-500 hover:bg-zinc-800 rounded cursor-pointer"
                                          title="Save changes"
                                        >
                                          <Check size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingDesignId(null);
                                            setEditingDesignIdx(null);
                                          }}
                                          className="p-1 text-zinc-400 hover:bg-zinc-800 rounded cursor-pointer"
                                          title="Cancel"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="text-xs font-bold text-white block truncate">{design.notes}</span>
                                        <span className="text-[8px] text-zinc-600 block mt-0.5">
                                          Added: {new Date(design.created_at).toLocaleDateString()}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {!isEditingThis && (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => downloadSingleDesign(design.design_url, `${prod.name_en.replace(/\s+/g, '_')}_${design.notes.replace(/\s+/g, '_')}`)}
                                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded cursor-pointer"
                                      title="Download design"
                                    >
                                      ⬇
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditDesign(design, idx)}
                                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-brand-accent rounded cursor-pointer"
                                      title="Edit label"
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleExplorerDeleteDesign(design.id)}
                                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-red-400 rounded cursor-pointer"
                                      title="Delete design"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-zinc-950 rounded-xl p-8 border border-zinc-850 text-center space-y-4">
                          <p className="text-xs text-zinc-500 font-semibold italic">
                            No mockups or print files uploaded for this product yet.
                          </p>
                          <label className="inline-block px-5 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg text-xs font-bold uppercase cursor-pointer transition-all shadow-md active:translate-y-0.5">
                            {isUploadingExplorerDesign ? 'Uploading files...' : 'Upload Design File(s)'}
                            <input
                              type="file"
                              multiple
                              disabled={isUploadingExplorerDesign}
                              onChange={handleExplorerDesignUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Design files management tools */}
                    <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl space-y-4 pt-4 mt-6">
                      <h5 className="text-[10px] font-black uppercase text-brand-accent tracking-wider">
                        Add More Designs
                      </h5>

                      <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-850/70 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Design Label / Notes</label>
                            <input
                              type="text"
                              placeholder="e.g. Front Chest Print PSD, Back Mockup"
                              value={explorerDesignNotesInput}
                              onChange={(e) => setExplorerDesignNotesInput(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Add Design File Link (Optional)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Paste design URL or Google Drive link..."
                                value={explorerDesignUrlInput}
                                onChange={(e) => setExplorerDesignUrlInput(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
                              />
                              <button
                                type="button"
                                onClick={handleExplorerAddDesignLink}
                                className="px-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded text-[10px] uppercase cursor-pointer transition-colors font-mono shrink-0"
                              >
                                Add Link
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* File uploader */}
                        {productDesignsList.length > 0 && (
                          <div className="pt-3 border-t border-zinc-850 flex justify-between items-center gap-3">
                            <span className="text-[9px] text-zinc-500 font-semibold">Or upload print files / mockups directly:</span>
                            <label className="px-3 py-1.5 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white rounded text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors shrink-0 shadow">
                              {isUploadingExplorerDesign ? 'Uploading...' : '⬆ Upload Design File(s)'}
                              <input 
                                type="file" 
                                multiple
                                disabled={isUploadingExplorerDesign}
                                onChange={handleExplorerDesignUpload} 
                                className="hidden" 
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* TAB: LIVE CHATS */}
        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-white font-mono">
            {/* Sidebar Chat List (4 cols) */}
            <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col h-[650px]">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-4">
                <h3 className="text-sm font-black uppercase text-brand-accent flex items-center gap-1.5">
                  <MessageSquare size={16} />
                  {locale === 'ar' ? 'المحادثات' : 'Conversations'}
                </h3>
                <button
                  onClick={() => setIsStartChatOpen(true)}
                  className="px-2.5 py-1 bg-brand-accent hover:bg-brand-accent/95 text-white text-[9px] font-black uppercase border border-black rounded-lg shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  {locale === 'ar' ? '+ محادثة جديدة' : '+ New Chat'}
                </button>
              </div>

              {/* Chat Filters */}
              <div className="flex gap-1 bg-zinc-950 p-1 border border-zinc-855 rounded-xl mb-4 text-[9px] font-bold">
                {['all', 'open', 'closed', 'blocked'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setChatListFilter(f as any)}
                    className={`flex-1 py-1.5 rounded-lg uppercase transition-colors ${chatListFilter === f ? 'bg-zinc-800 text-brand-accent' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Chats List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {(() => {
                  const filtered = adminChats.filter((c: any) => {
                    if (chatListFilter === 'all') return true;
                    if (chatListFilter === 'open') return c.status === 'open' && !c.is_blocked;
                    if (chatListFilter === 'closed') return c.status === 'closed' && !c.is_blocked;
                    if (chatListFilter === 'blocked') return c.is_blocked;
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <p className="text-[10px] text-zinc-500 text-center py-8">
                        No conversations found.
                      </p>
                    );
                  }

                  return filtered.map((c: any) => {
                    const isSelected = selectedChatId === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={async () => {
                          setSelectedChatId(c.id);
                          useStore.getState().fetchUserChat(c.customer_phone || undefined);
                        }}
                        className={`p-3 border rounded-xl text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-zinc-800 border-brand-accent text-brand-accent shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                            : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900 text-zinc-300'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-black truncate">{c.customer_name || 'Guest User'}</span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 border border-zinc-800 rounded uppercase ${
                            c.is_blocked ? 'bg-red-950/40 text-red-400' : c.status === 'open' ? 'bg-green-950/40 text-green-400' : 'bg-zinc-900 text-zinc-500'
                          }`}>
                            {c.is_blocked ? 'blocked' : c.status}
                          </span>
                        </div>
                        <p className="text-[9px] text-zinc-400 truncate mt-1">{c.customer_phone || 'Logged In Account'}</p>
                        <span className="text-[8px] text-zinc-600 block mt-1 font-mono">{new Date(c.updated_at).toLocaleString()}</span>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Start Chat Modal inside sidebar */}
              {isStartChatOpen && (
                <div className="mt-4 p-3 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                    <span className="text-[10px] font-black uppercase text-brand-accent">Start Guest Chat</span>
                    <button onClick={() => setIsStartChatOpen(false)} className="text-zinc-500 hover:text-white"><X size={12} /></button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="tel"
                      placeholder="Guest Phone Number"
                      value={startChatPhone}
                      onChange={(e) => setStartChatPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Guest Display Name"
                      value={startChatName}
                      onChange={(e) => setStartChatName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!/^01[0-25]\d{8}$/.test(startChatPhone.trim())) {
                          alert('Invalid phone number.');
                          return;
                        }
                        const chat = await useStore.getState().adminStartChat(startChatPhone.trim(), startChatName.trim() || 'Guest');
                        if (chat) {
                          setSelectedChatId(chat.id);
                          useStore.getState().fetchUserChat(chat.customer_phone);
                          setIsStartChatOpen(false);
                          setStartChatPhone('');
                          setStartChatName('');
                        }
                      }}
                      className="w-full py-1.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded text-[10px] font-black uppercase cursor-pointer"
                    >
                      Initialize Chat
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Transcript Area (5 cols) */}
            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col h-[650px]">
              {activeChat ? (
                <>
                  <div className="flex items-center justify-between border-b border-zinc-855 pb-3 mb-4">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        {activeChat.customer_name}
                      </h4>
                      <span className="text-[8px] text-zinc-500 font-mono">{activeChat.customer_phone || 'Auth User Account'}</span>
                    </div>

                    <div className="flex gap-1.5">
                      {activeChat.status === 'open' ? (
                        <button
                          onClick={() => useStore.getState().adminCloseChat(activeChat.id)}
                          className="px-2 py-1 bg-zinc-850 hover:bg-zinc-800 text-[8px] font-black uppercase rounded border border-zinc-750 cursor-pointer text-white"
                        >
                          Close Chat
                        </button>
                      ) : (
                        <button
                          onClick={() => useStore.getState().adminReopenChat(activeChat.id)}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[8px] font-black uppercase rounded border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer"
                        >
                          Reopen
                        </button>
                      )}

                      {activeChat.is_blocked ? (
                        <button
                          onClick={() => useStore.getState().adminUnblockUser(activeChat.id)}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-755 text-green-400 text-[8px] font-black uppercase rounded border border-zinc-750 cursor-pointer"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => useStore.getState().adminBlockUser(activeChat.id)}
                          className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-400 text-[8px] font-black uppercase rounded border border-red-900 cursor-pointer"
                        >
                          Block User
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-zinc-950 border border-zinc-850 rounded-2xl mb-4 flex flex-col">
                    {activeChatMessages.map((m: any) => {
                      const isUser = m.sender === 'user';
                      const isSystem = m.sender === 'system';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col max-w-[85%] ${isUser ? 'self-start items-start' : 'self-end items-end'}`}
                        >
                          <div
                            className={`p-2.5 rounded-xl border text-xs font-semibold leading-relaxed ${
                              isUser
                                ? 'bg-zinc-900 border-zinc-850 text-zinc-300 rounded-tl-none'
                                : isSystem
                                ? 'bg-zinc-900/50 border-dashed border-zinc-800 text-zinc-500 rounded-tr-none'
                                : 'bg-brand-accent border-black text-white rounded-tr-none shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                            }`}
                          >
                            {m.message}
                          </div>
                          <span className="text-[7px] text-zinc-600 block mt-0.5 uppercase font-mono">
                            {isSystem ? 'Auto response' : m.sender} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Send Form */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!adminChatInput.trim()) return;
                      const msg = adminChatInput.trim();
                      setAdminChatInput('');
                      await useStore.getState().adminSendChatMessage(activeChat.id, msg);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Type admin response..."
                      value={adminChatInput}
                      onChange={(e) => setAdminChatInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-855 rounded-xl text-xs focus:outline-none focus:border-brand-accent text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-accent text-white font-black uppercase text-xs rounded-xl cursor-pointer border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 py-12">
                  <span className="text-3xl">💬</span>
                  <p className="text-xs font-black uppercase mt-2">Select a conversation to start chatting</p>
                </div>
              )}
            </div>

            {/* Selected User details & Auto Responses Settings (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* User details card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
                <h4 className="text-xs font-black uppercase text-brand-accent border-b border-zinc-850 pb-2 mb-3">
                  👤 Customer Profile
                </h4>

                {(() => {
                  if (!activeChat) return <p className="text-[10px] text-zinc-500">No active chat selected.</p>;
                  
                  const phone = activeChat.customer_phone;
                  const userId = activeChat.user_id;

                  const userOrdersList = orders.filter((o: any) => {
                    if (phone) return o.customer_phone === phone;
                    if (userId) return o.user_id === userId;
                    return false;
                  });

                  const totalMoneySpent = userOrdersList
                    .filter((o: any) => o.status === 'completed')
                    .reduce((sum: number, o: any) => sum + Number(o.price || 0), 0);

                  const activeOrder = userOrdersList.find((o: any) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped');

                  return (
                    <div className="space-y-4 text-[10px] font-bold">
                      <div className="bg-zinc-950 p-2.5 border border-zinc-850 rounded-xl space-y-1.5 text-zinc-400">
                        <div>
                          <span className="text-[8px] font-black uppercase text-zinc-500 block">Name</span>
                          <span className="text-white text-xs">{activeChat.customer_name || 'Guest User'}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black uppercase text-zinc-500 block">Phone</span>
                          <span className="text-white font-mono">{phone || 'N/A (Logged In)'}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black uppercase text-zinc-500 block">Total Spent</span>
                          <span className="text-brand-accent font-black text-sm">{totalMoneySpent} EGP</span>
                        </div>
                      </div>

                      {/* Active Order Details */}
                      <div>
                        <span className="text-[9px] uppercase font-black text-zinc-400 block mb-1">Active Order</span>
                        {activeOrder ? (
                          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase">
                              <span className="text-brand-accent">ID: {activeOrder.id.substring(0,8)}</span>
                              <span className="bg-amber-950/40 text-amber-400 px-1.5 rounded">{activeOrder.status}</span>
                            </div>
                            <p className="text-white truncate mt-1">{activeOrder.items?.map((i: any) => i.product_name || i.product?.name_en).join(', ')}</p>
                            <span className="text-zinc-500 mt-1 block font-mono">{activeOrder.price} EGP</span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 italic block">No current active orders.</span>
                        )}
                      </div>

                      {/* Orders history list */}
                      <div>
                        <span className="text-[9px] uppercase font-black text-zinc-400 block mb-1">Past Orders ({userOrdersList.length})</span>
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                          {userOrdersList.map((o: any) => (
                            <div key={o.id} className="p-2 bg-zinc-950 border border-zinc-855 rounded-lg flex justify-between items-center">
                              <div>
                                <span className="text-[8px] font-black text-zinc-400 uppercase font-mono block">ID: {o.id.substring(0,8)}</span>
                                <span className="text-zinc-600 text-[8px]">{new Date(o.created_at).toLocaleDateString()}</span>
                              </div>
                              <span className="text-white font-black">{o.price} EGP</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Auto Response config Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
                <h4 className="text-xs font-black uppercase text-brand-accent border-b border-zinc-850 pb-2">
                  🤖 Auto-responses Trigger
                </h4>

                {/* Add Trigger words Form */}
                <div className="space-y-3 bg-zinc-950 p-3 border border-zinc-850 rounded-2xl">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Trigger Keywords (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. shipping, delivery, شحن"
                      value={autoResponseTrigger}
                      onChange={(e) => setAutoResponseTrigger(e.target.value)}
                      className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Response Message</label>
                    <textarea
                      placeholder="Type automated reply..."
                      value={autoResponseText}
                      onChange={(e) => setAutoResponseText(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const triggers = autoResponseTrigger.split(',').map(s => s.trim()).filter(Boolean);
                      const text = autoResponseText.trim();
                      if (triggers.length === 0 || !text) return;
                      await useStore.getState().saveAutoResponse({ trigger_words: triggers, response_text: text });
                      setAutoResponseTrigger('');
                      setAutoResponseText('');
                    }}
                    className="w-full py-1.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded text-[10px] font-black uppercase cursor-pointer"
                  >
                    Add Trigger Word
                  </button>
                </div>

                {/* List Auto Responses triggers */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {autoResponses.map((r: any) => (
                    <div key={r.id} className="p-2 bg-zinc-950 border border-zinc-850 rounded-lg flex justify-between items-start gap-2 text-[9px]">
                      <div className="min-w-0 flex-1">
                        <span className="text-zinc-500 block uppercase font-black truncate">Triggers: {r.trigger_words.join(', ')}</span>
                        <p className="text-white mt-0.5 truncate">{r.response_text}</p>
                      </div>
                      <button
                        onClick={() => useStore.getState().deleteAutoResponse(r.id)}
                        className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: EMAIL SENDER FORM */}
        {activeTab === 'email-sender' && (
          <div className="space-y-6 text-white font-mono max-w-xl mx-auto bg-zinc-900 border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-8 select-text">
            <div className="border-b border-zinc-850 pb-4 mb-6">
              <h2 className="text-2xl font-black uppercase text-brand-accent flex items-center gap-2">
                ✉️ {locale === 'ar' ? 'مرسل البريد الإلكتروني' : 'Email Sender'}
              </h2>
              <p className="text-[10px] text-zinc-500 uppercase mt-1 tracking-wider leading-relaxed">
                {locale === 'ar' 
                  ? 'أرسل رسالة بريد إلكتروني مخصصة مباشرة إلى أي مستخدم عبر خدمة SendGrid' 
                  : 'Dispatch a custom email notification directly to any customer via SendGrid service'}
              </p>
            </div>

            <div className="space-y-5 text-left">
              <div>
                <label className="text-[10px] uppercase font-black text-zinc-400 block mb-1">
                  {locale === 'ar' ? 'البريد الإلكتروني للمستلم *' : 'Recipient Email Address *'}
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={emailModalRecipient}
                  onChange={(e) => setEmailModalRecipient(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border-2 border-zinc-850 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-brand-accent select-text"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-zinc-400 block mb-1">
                  {locale === 'ar' ? 'عنوان الرسالة / الموضوع *' : 'Email Subject / Title *'}
                </label>
                <input
                  type="text"
                  placeholder={locale === 'ar' ? 'مثال: تحديث بخصوص طلبك من Fandom Fit' : 'e.g. Update regarding your Fandom Fit order'}
                  value={emailModalSubject}
                  onChange={(e) => setEmailModalSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border-2 border-zinc-850 rounded-xl text-white text-xs font-sans focus:outline-none focus:border-brand-accent select-text"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-zinc-400 block mb-1">
                  {locale === 'ar' ? 'نص الرسالة *' : 'Message Body *'}
                </label>
                <textarea
                  rows={8}
                  placeholder={locale === 'ar' ? 'اكتب نص البريد الإلكتروني هنا بالتفصيل...' : 'Type the message details to deliver here...'}
                  value={emailModalBody}
                  onChange={(e) => setEmailModalBody(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-850 rounded-xl text-white text-xs font-sans focus:outline-none focus:border-brand-accent whitespace-pre-wrap select-text"
                />
                
                <div className="bg-[#E07A5F]/10 border border-[#E07A5F]/30 rounded-xl p-3 text-[10px] font-bold text-brand-accent leading-relaxed mt-2.5 flex items-start gap-2">
                  <span>💡</span>
                  <p>
                    {locale === 'ar'
                      ? 'ملاحظة: سيتم إضافة تنبيه تلقائي في نهاية البريد الإلكتروني لإرشاد المستخدمين للتحقق من مجلق البريد العشوائي (Spam).'
                      : 'Note: A fallback instructions banner will be automatically appended to advise customers to check their Spam or Junk folder.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  disabled={isEmailSending}
                  onClick={async () => {
                    if (!emailModalRecipient.trim() || !emailModalSubject.trim() || !emailModalBody.trim()) {
                      alert(locale === 'ar' ? 'الرجاء ملء جميع حقول البريد الإلكتروني.' : 'Please fill in all email fields (recipient, subject, and message).');
                      return;
                    }
                    setIsEmailSending(true);
                    try {
                      const res = await fetch('/api/admin/send-custom-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: emailModalRecipient.trim(),
                          subject: emailModalSubject.trim(),
                          message: emailModalBody.trim()
                        })
                      });

                      const data = await res.json();
                      if (!res.ok || !data.success) {
                        throw new Error(data.error || 'Failed to dispatch email');
                      }

                      alert((locale === 'ar' ? 'تم إرسال البريد الإلكتروني بنجاح إلى ' : 'Email sent successfully to ') + emailModalRecipient);
                      setEmailModalRecipient('');
                      setEmailModalSubject('');
                      setEmailModalBody('');
                    } catch (e: any) {
                      console.error(e);
                      alert((locale === 'ar' ? 'خطأ أثناء الإرسال: ' : 'Error sending email: ') + e.message);
                    } finally {
                      setIsEmailSending(false);
                    }
                  }}
                  className="w-full py-3 bg-brand-accent hover:bg-brand-accent/95 text-white text-xs font-black rounded-xl uppercase border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer disabled:opacity-50 font-mono"
                >
                  {isEmailSending 
                    ? (locale === 'ar' ? 'جاري الإرسال...' : 'Sending...') 
                    : (locale === 'ar' ? 'إرسال البريد الإلكتروني ➔' : 'Send Email Message ➔')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: USERS ACCOUNTS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6 text-white font-mono">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase text-white">
                {locale === 'ar' ? 'إدارة حسابات المستخدمين' : 'Users Accounts'}
              </h2>
              <input
                type="text"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder={locale === 'ar' ? 'بحث بالاسم، الإيميل، أو الهاتف...' : 'Search by name, email, phone...'}
                className="w-full max-w-xs px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs select-text">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] font-black uppercase text-zinc-500 bg-zinc-950/40">
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Phone Number</th>
                      <th className="p-4">Loyalty Points</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = usersList.filter((u: any) => {
                        const nameMatch = (u.full_name || '').toLowerCase().includes(searchUserQuery.toLowerCase());
                        const emailMatch = (u.email || '').toLowerCase().includes(searchUserQuery.toLowerCase());
                        const phoneMatch = (u.phone || '').toLowerCase().includes(searchUserQuery.toLowerCase());
                        return nameMatch || emailMatch || phoneMatch;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-zinc-500 font-bold uppercase">
                              No customer profiles found.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((u: any) => (
                        <tr key={u.id} className="border-b border-zinc-800 hover:bg-zinc-800/20">
                          <td className="p-4 font-black">{u.full_name || 'N/A'}</td>
                          <td className="p-4 font-mono">{u.email || 'N/A'}</td>
                          <td className="p-4 font-mono">{u.phone || 'N/A'}</td>
                          <td className="p-4 text-brand-accent font-black">{u.loyalty_points || 0} pts</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedUserForEdit(u);
                                const ad = u.address_data || {};
                                setEditUserForm({
                                  full_name: u.full_name || '',
                                  email: u.email || '',
                                  phone: u.phone || '',
                                  loyalty_points: u.loyalty_points || 0,
                                  password: u.password || '********',
                                  address_governorate: ad.governorate || '',
                                  address_city: ad.city || '',
                                  address_street: ad.street || ''
                                });
                              }}
                              className="px-2.5 py-1 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded text-[10px] uppercase border border-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] cursor-pointer mr-2"
                            >
                              Edit Profile
                            </button>
                            {u.email && (
                              <button
                                onClick={() => {
                                  setEmailModalRecipient(u.email);
                                  setEmailModalSubject('');
                                  setEmailModalBody('');
                                  setActiveTab('email-sender');
                                }}
                                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded text-[10px] uppercase border border-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] cursor-pointer"
                              >
                                Email
                              </button>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Profile editing drawer/overlay */}
            {selectedUserForEdit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 font-mono select-none">
                <div className="bg-zinc-900 border-4 border-black p-6 rounded-3xl max-w-lg w-full text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-3 mb-4">
                    <h3 className="text-sm font-black uppercase text-brand-accent flex items-center gap-1.5">
                      <Users size={16} />
                      Edit Customer Profile
                    </h3>
                    <button onClick={() => setSelectedUserForEdit(null)} className="text-zinc-400 hover:text-white"><X size={16} /></button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const address_data = {
                        governorate: editUserForm.address_governorate,
                        city: editUserForm.address_city,
                        street: editUserForm.address_street
                      };
                      await useStore.getState().adminUpdateUserProfile(selectedUserForEdit.id, {
                        full_name: editUserForm.full_name,
                        email: editUserForm.email,
                        phone: editUserForm.phone,
                        loyalty_points: Number(editUserForm.loyalty_points),
                        password: editUserForm.password,
                        address_data
                      });
                      setSelectedUserForEdit(null);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={editUserForm.full_name}
                          onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={editUserForm.email}
                          onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={editUserForm.phone}
                          onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Password</label>
                        <input
                          type="text"
                          required
                          value={editUserForm.password}
                          onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-855 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Loyalty Points Balance</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={editUserForm.loyalty_points}
                        onChange={(e) => setEditUserForm({ ...editUserForm, loyalty_points: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
                      />
                    </div>

                    {/* Address settings */}
                    <div className="border-t border-zinc-800 pt-3">
                      <span className="text-[10px] font-black uppercase text-zinc-500 block mb-2">Default Shipping Address</span>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Governorate</label>
                          <input
                            type="text"
                            value={editUserForm.address_governorate}
                            onChange={(e) => setEditUserForm({ ...editUserForm, address_governorate: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">City / Area</label>
                          <input
                            type="text"
                            value={editUserForm.address_city}
                            onChange={(e) => setEditUserForm({ ...editUserForm, address_city: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Street Details</label>
                        <input
                          type="text"
                          value={editUserForm.address_street}
                          onChange={(e) => setEditUserForm({ ...editUserForm, address_street: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-white text-xs focus:outline-none focus:border-brand-accent"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setSelectedUserForEdit(null)}
                        className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-lg uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-brand-accent hover:bg-brand-accent/95 text-white text-xs font-black rounded-lg uppercase border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
                      >
                        Save Profile Updates
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB: WEB & ITEMS ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 text-white font-mono">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black uppercase text-white">
                  {locale === 'ar' ? 'التحليلات والمبيعات' : 'Web & Items Analytics'}
                </h2>
                <p className="text-[10px] text-zinc-500 uppercase mt-0.5 tracking-wider">
                  Real-time events tracking metrics & user interaction statistics
                </p>
              </div>

              {/* Scale timeframe selection */}
              <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-[10px] font-black uppercase">
                {(['total', 'year', 'month', 'week', 'day'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAnalyticsFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      analyticsFilter === filter ? 'bg-brand-accent text-white' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations and analysis based on timeframe */}
            {(() => {
              const filterByTimeframe = (evtDate: Date) => {
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - evtDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (analyticsFilter === 'day') return diffDays <= 1;
                if (analyticsFilter === 'week') return diffDays <= 7;
                if (analyticsFilter === 'month') return diffDays <= 30;
                if (analyticsFilter === 'year') return diffDays <= 365;
                return true; // total
              };

              const filteredEvents = analyticsEvents.filter((e: any) => filterByTimeframe(new Date(e.created_at)));
              const filteredOrders = orders.filter((o: any) => filterByTimeframe(new Date(o.created_at)));

              // 1. Web metrics
              const visitorsCount = new Set(filteredEvents.filter((e: any) => e.event_type === 'visit').map((e: any) => e.session_id)).size;
              const signupsCount = filteredEvents.filter((e: any) => e.event_type === 'account_created').length;
              const cartAddsCount = new Set(filteredEvents.filter((e: any) => e.event_type === 'cart_add').map((e: any) => e.session_id)).size;
              
              const orderCompletedCount = filteredOrders.length;
              
              const orderedSessions = new Set(filteredEvents.filter((e: any) => e.event_type === 'order_completed').map((e: any) => e.session_id));
              const abandonedCartsCount = Math.max(0, cartAddsCount - orderedSessions.size);

              const conversionRate = visitorsCount > 0 ? ((orderCompletedCount / visitorsCount) * 100).toFixed(1) : '0.0';

              // 2. Items Metrics Rankings
              const soldCounts: Record<string, number> = {};
              filteredOrders.forEach((o: any) => {
                if (o.items) {
                  o.items.forEach((item: any) => {
                    const name = item.product_name || item.product?.name_en || 'Unknown Item';
                    soldCounts[name] = (soldCounts[name] || 0) + Number(item.quantity || 1);
                  });
                }
              });
              const mostSold = Object.entries(soldCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

              const viewCounts: Record<string, number> = {};
              filteredEvents.filter((e: any) => e.event_type === 'item_view').forEach((e: any) => {
                if (e.product_name) {
                  viewCounts[e.product_name] = (viewCounts[e.product_name] || 0) + 1;
                }
              });
              const mostViewed = Object.entries(viewCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

              const addCounts: Record<string, number> = {};
              filteredEvents.filter((e: any) => e.event_type === 'cart_add').forEach((e: any) => {
                if (e.product_name) {
                  addCounts[e.product_name] = (addCounts[e.product_name] || 0) + 1;
                }
              });
              const mostAdded = Object.entries(addCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

              return (
                <>
                  {/* Grid Web Analytics cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { label: 'Unique Visitors', value: visitorsCount, icon: '👁️', color: 'text-blue-400' },
                      { label: 'Signups Created', value: signupsCount, icon: '📝', color: 'text-purple-400' },
                      { label: 'Carts Filled', value: cartAddsCount, icon: '🛒', color: 'text-amber-400' },
                      { label: 'Abandoned Carts', value: abandonedCartsCount, icon: '🗑️', color: 'text-red-400' },
                      { label: 'Completed Orders', value: orderCompletedCount, icon: '📦', color: 'text-green-400' },
                      { label: 'Conversion Rate', value: `${conversionRate}%`, icon: '📈', color: 'text-brand-accent' },
                    ].map((card, i) => (
                      <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between shadow">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-tight leading-tight">{card.label}</span>
                          <span className="text-sm">{card.icon}</span>
                        </div>
                        <span className={`text-xl font-black mt-3 block ${card.color}`}>{card.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Items Analytics Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                    {/* MOST VIEWED */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
                      <h4 className="text-xs font-black uppercase text-brand-accent tracking-wider border-b border-zinc-850 pb-2 flex items-center gap-1.5">
                        👁️ Most Viewed Items
                      </h4>
                      <div className="space-y-2">
                        {mostViewed.length === 0 ? (
                          <p className="text-[10px] text-zinc-500 italic py-4">No view metrics logged.</p>
                        ) : (
                          mostViewed.map(([name, count], idx) => (
                            <div key={idx} className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl flex justify-between items-center text-[10px]">
                              <span className="font-bold truncate pr-2 text-white">{idx+1}. {name}</span>
                              <span className="text-zinc-500 shrink-0 font-mono">{count} views</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* MOST ADDED TO CART */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
                      <h4 className="text-xs font-black uppercase text-brand-accent tracking-wider border-b border-zinc-850 pb-2 flex items-center gap-1.5">
                        🛒 Most Added to Cart
                      </h4>
                      <div className="space-y-2">
                        {mostAdded.length === 0 ? (
                          <p className="text-[10px] text-zinc-500 italic py-4">No cart additions logged.</p>
                        ) : (
                          mostAdded.map(([name, count], idx) => (
                            <div key={idx} className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl flex justify-between items-center text-[10px]">
                              <span className="font-bold truncate pr-2 text-white">{idx+1}. {name}</span>
                              <span className="text-zinc-500 shrink-0 font-mono">{count} times</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* MOST SOLD */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
                      <h4 className="text-xs font-black uppercase text-brand-accent tracking-wider border-b border-zinc-850 pb-2 flex items-center gap-1.5">
                        📦 Most Sold Items
                      </h4>
                      <div className="space-y-2">
                        {mostSold.length === 0 ? (
                          <p className="text-[10px] text-zinc-500 italic py-4">No sales records logged.</p>
                        ) : (
                          mostSold.map(([name, count], idx) => (
                            <div key={idx} className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl flex justify-between items-center text-[10px]">
                              <span className="font-bold truncate pr-2 text-white">{idx+1}. {name}</span>
                              <span className="text-brand-accent font-black shrink-0 font-mono">{count} sold</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
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
      {/* VISUAL TAG POSITIONER MODAL */}
      {isTagPositionerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 font-mono select-none">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-2xl w-full flex flex-col gap-4 text-white">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
              <h4 className="text-sm font-black uppercase text-brand-accent">📐 Interactive Tag Positioner</h4>
              <button 
                onClick={() => setIsTagPositionerOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            
            <p className="text-[10px] text-zinc-400 uppercase leading-relaxed">
              Instructions: Select a tag, choose its badge colors, and click/tap anywhere on the product photo on the right to position it. Placed coordinates will be saved.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                {/* Select Tag Dropdown */}
                <div>
                  <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Select Tag to Place</label>
                  <select
                    value={selectedTagToPosition}
                    onChange={(e) => setSelectedTagToPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-white text-xs focus:outline-none"
                  >
                    <option value="">-- Choose Tag --</option>
                    {splitTagsText(tagsText)
                      .map(t => {
                        let displayName = t;
                        try {
                          if (t.startsWith('{')) {
                            displayName = JSON.parse(t).name;
                          }
                        } catch (err) {}
                        return (
                          <option key={t} value={displayName}>
                            {displayName}
                          </option>
                        );
                      })}
                  </select>
                </div>

                {/* Inline Quick Add Tag Controller (Request 8) */}
                <div className="flex gap-2 items-end bg-zinc-950 p-2.5 border border-zinc-850 rounded-xl">
                  <div className="flex-1">
                    <label className="text-[8px] uppercase font-bold text-zinc-500 block mb-1">Quick Create New Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Hot, Sale, Limited"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white text-[10px] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newTagInput.trim();
                      if (!trimmed) return;
                      const existing = splitTagsText(tagsText);
                      const names = existing.map(t => {
                        try {
                          if (t.startsWith('{')) return JSON.parse(t).name;
                        } catch(err) {}
                        return t;
                      });
                      if (names.includes(trimmed)) {
                        alert('Tag already exists!');
                        return;
                      }
                      const updated = [...existing, trimmed];
                      setTagsText(updated.join(', '));
                      setSelectedTagToPosition(trimmed);
                      setNewTagInput('');
                    }}
                    className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] uppercase font-bold cursor-pointer transition-colors border border-zinc-700"
                  >
                    Add Tag
                  </button>
                </div>

                {/* Badge Color Customization */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Background Color</label>
                    <input
                      type="color"
                      value={tagBgColor}
                      onChange={(e) => setTagBgColor(e.target.value)}
                      className="w-full h-8 bg-zinc-950 border border-zinc-800 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Text Color</label>
                    <input
                      type="color"
                      value={tagTextColor}
                      onChange={(e) => setTagTextColor(e.target.value)}
                      className="w-full h-8 bg-zinc-950 border border-zinc-800 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Badge Rotation & Font Size Customization */}
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-850 pt-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Rotation ({tagRotation}°)</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={tagRotation}
                      onChange={(e) => setTagRotation(Number(e.target.value))}
                      className="w-full accent-brand-accent cursor-pointer bg-zinc-950 border border-zinc-800 rounded h-8 px-2"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Font Size ({tagFontSize}px)</label>
                    <input
                      type="range"
                      min="8"
                      max="24"
                      value={tagFontSize}
                      onChange={(e) => setTagFontSize(Number(e.target.value))}
                      className="w-full accent-brand-accent cursor-pointer bg-zinc-950 border border-zinc-800 rounded h-8 px-2"
                    />
                  </div>
                </div>

                {/* Placed Tags Check List */}
                <div className="border-t border-zinc-850 pt-3 space-y-2">
                  <label className="text-[9px] uppercase font-bold text-zinc-500 block">Placed Badges</label>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1.5">
                    {splitTagsText(tagsText)
                      .map((t, idx) => {
                        let parsed: any = null;
                        try {
                          if (t.startsWith('{')) parsed = JSON.parse(t);
                        } catch(e) {}
                        
                        if (parsed && parsed.posX !== null) {
                          return (
                            <div key={idx} className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-850 rounded-lg text-[10px]">
                              <div>
                                <span className="font-bold text-white uppercase">{parsed.name}</span>
                                <span className="text-zinc-500 ml-2">({parsed.posX}%, {parsed.posY}%)</span>
                                <span className="text-zinc-500 ml-1">Rot: {parsed.rotation || 0}°, Sz: {parsed.fontSize || 10}px</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const existing = splitTagsText(tagsText);
                                  const updated = existing.map((val) => {
                                    if (val === t) return parsed.name; // Strip JSON wrapper
                                    return val;
                                  });
                                  setTagsText(updated.join(', '));
                                }}
                                className="px-2 py-0.5 bg-red-950/40 border border-red-900/60 hover:bg-red-900 text-red-400 text-[8px] font-bold uppercase rounded cursor-pointer transition-colors"
                              >
                                Revert
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })}
                  </div>
                </div>
              </div>

              {/* Visual Canvas Panel */}
              <div className="flex flex-col items-center">
                <label className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Click on Image to Position tag</label>
                <div 
                  onClick={(e) => {
                    if (!selectedTagToPosition) {
                      alert('Please select a tag first!');
                      return;
                    }
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

                    const newTagObj = {
                      name: selectedTagToPosition,
                      color: tagBgColor,
                      textColor: tagTextColor,
                      posX: x,
                      posY: y,
                      rotation: tagRotation,
                      fontSize: tagFontSize
                    };

                    const existing = splitTagsText(tagsText);
                    const filtered = existing.filter(t => {
                      try {
                        if (t.startsWith('{')) {
                          return JSON.parse(t).name.toLowerCase() !== selectedTagToPosition.toLowerCase();
                        }
                      } catch (err) {}
                      return t.toLowerCase() !== selectedTagToPosition.toLowerCase();
                    });

                    const updated = [...filtered, JSON.stringify(newTagObj)];
                    setTagsText(updated.join(', '));
                  }}
                  className="relative aspect-square w-full max-w-[280px] bg-zinc-950 border-2 border-zinc-800 rounded-lg overflow-hidden cursor-crosshair flex items-center justify-center"
                >
                  <Image
                    src={prodForm.images?.[0] || '/placeholders/arcade_front.jpg'}
                    alt="Visual Canvas"
                    fill
                    className="object-contain p-2"
                  />

                  {/* Render Placed Badges Overlay */}
                  {splitTagsText(tagsText)
                    .map((t, i) => {
                      try {
                        if (t.startsWith('{')) {
                          const parsed = JSON.parse(t);
                          if (parsed.posX !== null && parsed.posY !== null) {
                            return (
                              <span
                                key={i}
                                className="absolute z-10 px-1.5 py-0.5 rounded font-black uppercase tracking-wider border border-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] pointer-events-none"
                                style={{
                                  left: `${parsed.posX}%`,
                                  top: `${parsed.posY}%`,
                                  backgroundColor: parsed.color || '#F2CC8F',
                                  color: parsed.textColor || '#000000',
                                  transform: `translate(-50%, -50%) rotate(${parsed.rotation || 0}deg)`,
                                  fontSize: `${parsed.fontSize || 8}px`
                                }}
                              >
                                {parsed.name}
                              </span>
                            );
                          }
                        }
                      } catch (err) {}
                      return null;
                    })}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-850 mt-2">
              <button
                type="button"
                onClick={() => setIsTagPositionerOpen(false)}
                className="px-5 py-2 bg-brand-accent text-white hover:bg-brand-accent/90 text-xs font-bold uppercase rounded-lg cursor-pointer"
              >
                Close & Save Placements
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
