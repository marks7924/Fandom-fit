-- Supabase Database Seeding script for Fandom Fit
-- RUN THIS IN THE SUPABASE SQL EDITOR

-- 1. Seed Categories (using fixed UUIDs so they map to products consistently)
INSERT INTO categories (id, slug, name_en, name_ar, display_order, is_hidden) VALUES
('11111111-1111-1111-1111-111111111111', 'games', 'Games', 'ألعاب', 1, false),
('22222222-2222-2222-2222-222222222222', 'movies', 'Movies', 'أفلام', 2, false),
('33333333-3333-3333-3333-333333333333', 'tv-shows', 'TV Shows', 'مسلسلات', 3, false),
('44444444-4444-4444-4444-444444444444', 'anime', 'Anime', 'أنمي', 4, false),
('55555555-5555-5555-5555-555555555555', 'football', 'Football', 'كرة قدم', 5, false),
('66666666-6666-6666-6666-666666666666', 'music', 'Music', 'موسيقى', 6, false),
('77777777-7777-7777-7777-777777777777', 'random', 'Random', 'عشوائي', 7, false)
ON CONFLICT (id) DO UPDATE SET 
  name_en = EXCLUDED.name_en, 
  name_ar = EXCLUDED.name_ar, 
  display_order = EXCLUDED.display_order;

-- 2. Seed Products (Placeholders and Ready Items)
INSERT INTO products (id, slug, name_en, name_ar, description_en, description_ar, category_id, price, sale_price, is_in_stock, display_order, is_featured, is_trending, is_new_arrival, is_best_seller, is_limited_edition, available_sizes, material_options, images, is_pinned) VALUES
-- Category Placeholders (using files copied from D:\mark private\WEBS\SHOP\Fandom-fit\Images\placeholders)
('a0000000-0000-0000-0000-000000000001', 'games-collection', 'Games Collection', 'مجموعة الألعاب', 'Custom games prints.', 'تصاميم ألعاب مخصصة.', '11111111-1111-1111-1111-111111111111', 450, null, true, 100, false, false, false, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/placeholders/Games.jpg"}', false),
('a0000000-0000-0000-0000-000000000002', 'movies-collection', 'Movies Collection', 'مجموعة الأفلام', 'Custom movie prints.', 'تصاميم أفلام مخصصة.', '22222222-2222-2222-2222-222222222222', 450, null, true, 100, false, false, false, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/placeholders/Movies.jpg"}', false),
('a0000000-0000-0000-0000-000000000003', 'shows-collection', 'TV Shows Collection', 'مجموعة المسلسلات', 'Custom TV show prints.', 'تصاميم مسلسلات مخصصة.', '33333333-3333-3333-3333-333333333333', 450, null, true, 100, false, false, false, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/placeholders/Shows.jpg"}', false),
('a0000000-0000-0000-0000-000000000004', 'anime-collection', 'Anime Collection', 'مجموعة الأنمي', 'Custom anime prints.', 'تصاميم أنمي مخصصة.', '44444444-4444-4444-4444-444444444444', 450, null, true, 100, false, false, false, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/placeholders/Singers.jpg"}', false),
('a0000000-0000-0000-0000-000000000005', 'football-collection', 'Football Collection', 'مجموعة كرة القدم', 'Custom football club prints.', 'تصاميم أندية كرة قدم مخصصة.', '55555555-5555-5555-5555-555555555555', 450, null, true, 100, false, false, false, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/placeholders/Football.jpg"}', false),
('a0000000-0000-0000-0000-000000000006', 'random-collection', 'Random Collection', 'مجموعة عشوائية', 'Custom prints.', 'تصاميم عشوائية مخصصة.', '77777777-7777-7777-7777-777777777777', 450, null, true, 100, false, false, false, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/placeholders/Random.jpg"}', false),

-- Ready Listed Items (using files copied from D:\mark private\WEBS\SHOP\Fandom-fit\Images\Items)
('b0000000-0000-0000-0000-000000000001', 'fight-club-shirt', 'Fight Club Vintage Tee', 'تيشيرت نادي القتال', 'Premium Fight Club oversized tee.', 'تيشيرت نادي القتال واسع ومميز.', '22222222-2222-2222-2222-222222222222', 490, 420, true, 1, true, true, true, false, false, '{S,M,L,XL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/Movies (FESE3).jpg"}', true),
('b0000000-0000-0000-0000-000000000002', 'got-targaryen-shirt', 'GOT Targaryen Crest Tee', 'تيشيرت صراع العروش', 'Premium Game of Thrones House Targaryen tee.', 'تيشيرت صراع العروش شعار عائلة تارغاريان.', '33333333-3333-3333-3333-333333333333', 520, null, true, 2, true, false, false, true, false, '{M,L,XL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/Shows (GOT).jpg"}', true),
('b0000000-0000-0000-0000-000000000003', 'stranger-things-shirt', 'Stranger Things Vintage Tee', 'تيشيرت أشياء غريبة', 'Retro Stranger Things Hawkins high tee.', 'تيشيرت أشياء غريبة الكلاسيكي.', '33333333-3333-3333-3333-333333333333', 480, null, true, 3, false, true, true, false, false, '{S,M,L,XL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/Shows (ST).jpg"}', false),
('b0000000-0000-0000-0000-000000000004', 'taylor-swift-twlete-shirt', 'Song (Twlete) Special Edition', 'تيشيرت أغنية توليت', 'Vintage tour style song print tee.', 'تيشيرت أغنية توليت نمط جولة كلاسيكي.', '66666666-6666-6666-6666-666666666666', 550, 480, true, 4, false, false, false, false, true, '{S,M,L,XL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/Song (Twlete).jpg"}', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Offers (Coupons)
INSERT INTO offers (id, title_en, title_ar, description_en, description_ar, discount_text_en, discount_text_ar, code, is_active) VALUES
('c0000000-0000-0000-0000-000000000001', '25% OFF Premium Cotton', 'خصم 25% على القطن الفاخر', 'Upgrade to heavy fabric and save 25%', 'رقي قماشك لثقيل ووفر 25%', '25% OFF', 'خصم 25%', 'PREMIUM25', true),
('c0000000-0000-0000-0000-000000000002', 'Refer a Friend 15%', 'شارك الكود مع صديق 15%', 'Refer a friend and get 15% off', 'رشح صديقاً واحصل على 15% خصم', '15% OFF', 'خصم 15%', 'FRIENDS15', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Create trigger to automatically promote Supabase Auth Signups to Admin Permission table
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.admins (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid errors on rerun
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();
