-- Supabase Database Schema Setup for Fandom Fit

-- 1. Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    is_in_stock BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_limited_edition BOOLEAN DEFAULT FALSE,
    available_sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    material_options TEXT[] DEFAULT ARRAY['Standard Cotton', 'Premium Cotton'],
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Product Images table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Offers table
CREATE TABLE IF NOT EXISTS offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_en VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    discount_text_en VARCHAR(255),
    discount_text_ar VARCHAR(255),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INT DEFAULT 10,
    max_uses INT,
    max_uses_per_user INT,
    is_active BOOLEAN DEFAULT TRUE,
    show_on_homepage BOOLEAN DEFAULT FALSE,
    discount_type VARCHAR(50) DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) DEFAULT 0.00,
    coupon_type VARCHAR(50) DEFAULT 'manual',
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    current_uses INT DEFAULT 0,
    is_one_time BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    referred_phone VARCHAR(50),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Custom Requests table
CREATE TABLE IF NOT EXISTS custom_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    instagram_username VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reference_images TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewed', 'in_progress', 'completed'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Settings table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Homepage Customization table
CREATE TABLE IF NOT EXISTS homepage_sections (
    section_id VARCHAR(255) PRIMARY KEY,
    content JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create Admins table referencing Supabase Auth users
CREATE TABLE IF NOT EXISTS admins (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed'
    items JSONB,
    customer_email VARCHAR(255),
    governorate VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    coupon_code VARCHAR(100),
    referral_code VARCHAR(100),
    reward_coupon_code VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) and set up policies

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (Anyone can read, write is admin only)
CREATE POLICY "Allow public read on categories" ON categories 
    FOR SELECT USING (is_hidden = FALSE OR EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Allow public read on products" ON products 
    FOR SELECT USING (TRUE);

CREATE POLICY "Allow public read on product_images" ON product_images 
    FOR SELECT USING (TRUE);

CREATE POLICY "Allow public read on offers" ON offers 
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Allow public read on settings" ON settings 
    FOR SELECT USING (TRUE);

CREATE POLICY "Allow public read on homepage_sections" ON homepage_sections 
    FOR SELECT USING (TRUE);

-- CUSTOM REQUESTS WRITE POLICY (Anyone can insert, but only admins can read/update)
CREATE POLICY "Allow public insert on custom_requests" ON custom_requests 
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow admin operations on custom_requests" ON custom_requests 
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ORDERS WRITE POLICY (Anyone can insert, but only admins can read/update)
CREATE POLICY "Allow public insert on orders" ON orders 
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow admin operations on orders" ON orders 
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- ADMIN POLICIES (Only authenticated admins can modify)
CREATE POLICY "Allow admin all on categories" ON categories 
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Allow admin all on products" ON products 
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Allow admin all on product_images" ON product_images 
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Allow admin all on offers" ON offers 
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Allow admin all on settings" ON settings 
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Allow admin all on homepage_sections" ON homepage_sections 
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Allow admin read own record" ON admins 
    FOR SELECT USING (auth.uid() = id);

-- Seed basic settings and sections
INSERT INTO settings (key, value) VALUES
('socials', '{"instagram": "https://www.instagram.com/fandom.__.fit?igsh=cG9udzFxcjg5MGZv", "tiktok": "https://www.tiktok.com/@fandom._.fit?_r=1&_t=SZ-97n8CR3c4or", "facebook": "https://www.facebook.com/share/1GmUSwSQRE/"}'),
('brand', '{"name": "Fandom Fit", "tagline": "Wear What You Love."}'),
('announcement', '"🔥 FREE SHIPPING on orders containing 3 or more shirts! Direct Web checkout active now! 🔥"')
ON CONFLICT (key) DO NOTHING;

-- 11. Storage Setup for Products (Reference Images & Product Images)
-- Creates the public 'products' bucket and sets up permissive security policies so uploads work without auth errors
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the 'products' bucket
CREATE POLICY "Allow public select on products bucket" ON storage.objects 
    FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Allow public insert on products bucket" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow public update on products bucket" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'products') WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow public delete on products bucket" ON storage.objects 
    FOR DELETE USING (bucket_id = 'products');
 
-- 12. Create Discount Campaigns table
CREATE TABLE IF NOT EXISTS discount_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    discount_percent INT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE, -- NULL means all items
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE discount_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on discount_campaigns" ON discount_campaigns 
    FOR SELECT USING (TRUE);

CREATE POLICY "Allow admin all on discount_campaigns" ON discount_campaigns 
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));


