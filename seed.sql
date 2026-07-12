-- Supabase Database Seeding script for Fandom Fit
-- RUN THIS IN THE SUPABASE SQL EDITOR

-- 0. Ensure the products table has the images array column to match frontend expectations
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

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

-- Ready Listed Items (using files copied from D:\mark private\WEBS\SHOP\Fandom-fit\Images\Items2)
('b0000000-0000-0000-0000-000000000001', 'amr-diab-tee', 'Amr Diab Vintage Tee', 'تيشيرت عمرو دياب الكلاسيكي', 'Vintage Amr Diab graphic tee celebrating the legendary music of the Arab world. Streetwear boxy fit.', 'تيشيرت عمرو دياب الكلاسيكي يحتفل بموسيقى الهضبة الأسطورية. قصة واسعة لملابس الشارع.', '66666666-6666-6666-6666-666666666666', 500, null, true, 1, true, true, true, true, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/AMR DIAB - SONGS.jpg"}', true),
('b0000000-0000-0000-0000-000000000002', 'argok-mtkons-sada-tee', 'Argok Mtkons Sada Typography Tee', 'تيشيرت أرجوك متكونش ساده', 'Bold streetwear typography print "Argok Mtkons Sada" for a unique daily style statement. Comfortable heavy cotton.', 'تيشيرت كلاسيكي مطبوع بعبارة "أرجوك متكونش ساده" بتصميم جريء ومميز. خامة قطن ثقيل ومريح.', '77777777-7777-7777-7777-777777777777', 480, null, true, 2, false, false, true, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/ARGOK MTKON4 SADA - RANDOM.jpg"}', false),
('b0000000-0000-0000-0000-000000000003', 'ariana-grande-tee', 'Ariana Grande Portrait Tee', 'تيشيرت أريانا غراندي الكلاسيكي', 'Vintage Ariana Grande aesthetic print featuring iconic pop portrait art. Relaxed boxy streetwear design.', 'تيشيرت أريانا غراندي بتصميم كلاسيكي مميز مع رسم بورتريه أيقوني. قصة واسعة مريحة.', '66666666-6666-6666-6666-666666666666', 520, 450, true, 3, true, true, false, true, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/ARIANA GRANDE - SONGS.jpg"}', false),
('b0000000-0000-0000-0000-000000000004', 'haaland-erling-tee', 'Haaland Erling Football Tee', 'تيشيرت إيرلينج هالاند الرياضي', 'Graphic tribute shirt to the ultimate striker Erling Haaland. Perfect relaxed fit for stadium and streetwear styles.', 'تيشيرت إيرلينج هالاند الرياضي بتصميم جرافيك مميز. قصة مريحة مناسبة لملابس الشارع والملاعب.', '55555555-5555-5555-5555-555555555555', 490, null, true, 4, false, false, true, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/HALLAND - FOOTBALL.jpg"}', false),
('b0000000-0000-0000-0000-000000000005', 'ma-tygy-a3dy-3lek-tee', 'Ma Tygy A3dy 3lek Graphic Tee', 'تيشيرت ما تيجي أعدي عليك', 'Fun typography print inspired by popular music hits. Premium comfort cotton build with a stylish streetwear look.', 'تيشيرت "ما تيجي أعدي عليك" بطبعة مميزة ومرحة مستوحاة من الأغاني الشهيرة. قطن فاخر ومريح.', '66666666-6666-6666-6666-666666666666', 480, null, true, 5, false, false, true, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/MA TYGY A3DY 3LEK - SONGS.jpg"}', false),
('b0000000-0000-0000-0000-000000000006', 'mo-salah-egyptian-king-tee', 'Mo Salah Egyptian King Tee', 'تيشيرت فخر العرب محمد صلاح', 'Celebrate the Egyptian King Mohamed Salah with this graphic streetwear piece. High quality fade-resistant print.', 'تيشيرت فخر العرب محمد صلاح بتصميم جرافيك رائع. طبعة عالية الجودة مقاومة للبهتان.', '55555555-5555-5555-5555-555555555555', 490, null, true, 6, true, true, false, true, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/MO SALAH - FOOTBALL.jpg"}', true),
('b0000000-0000-0000-0000-000000000007', 'no-fair-football-tee', 'No Fair Football Tee', 'تيشيرت نو فير لكرة القدم', 'Minimalist athletic concept print design for football lovers. Relaxed comfy streetwear cut.', 'تيشيرت بتصميم رياضي بسيط وعصري لعشاق كرة القدم. قصة مريحة ومميزة لملابس الشارع.', '55555555-5555-5555-5555-555555555555', 480, null, true, 7, false, false, true, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/NO FAIR - FOOTBALL.jpg"}', false),
('b0000000-0000-0000-0000-000000000008', 'pretty-little-liars-tee', 'Pretty Little Liars Retro Tee', 'تيشيرت بريتي ليتل لايرز الكلاسيكي', 'Mystery-themed nostalgic graphics inspired by Rosewood High. Heavyweight premium cotton blend.', 'تيشيرت الغموض والإثارة مستوحى من مسلسل "Pretty Little Liars". خامة قطن ثقيل فاخر.', '33333333-3333-3333-3333-333333333333', 500, null, true, 8, false, false, true, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/PRETTY LITTLE LIARS - TV SHOW.jpg"}', false),
('b0000000-0000-0000-0000-000000000009', 'simmer-gaming-tee', 'Simmer Gaming Graphic Tee', 'تيشيرت جيمر مطبوع بالكامل', 'Plumbob-inspired creative typography graphic tee for gamers. Soft, durable premium weave.', 'تيشيرت بتصميم جرافيك رائع مستوحى من عالم الألعاب ومجتمع اللاعبين. خامة ناعمة ومتينة.', '11111111-1111-1111-1111-111111111111', 490, null, true, 9, false, false, true, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/SIMMER - GAMES.jpg"}', false),
('b0000000-0000-0000-0000-000000000010', 'taylor-swift-eras-tee', 'Taylor Swift Eras Retro Tee', 'تيشيرت تايلور سويفت ريترو', 'Retro style vintage collage print dedicated to the Eras of Taylor Swift. Comfort boxy street cut.', 'تيشيرت تايلور سويفت بتصميم ريترو كلاسيكي رائع. قصة مربعة واسعة ومريحة للغاية.', '66666666-6666-6666-6666-666666666666', 520, 460, true, 10, true, false, false, true, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/TAYLER SWIFT - SONGS.jpg"}', false),
('b0000000-0000-0000-0000-000000000011', 'tb-ya-sydy-4okran-tee', 'Tb Ya Sydy 4okran Nostalgic Tee', 'تيشيرت طب يا سيدي شكراً الكلاسيكي', 'Nostalgic cinematic quote print from classic comedy movies. Streetwear premium heavyweight cotton.', 'تيشيرت "طب يا سيدي شكراً" بطبعة مميزة ومضحكة مستوحاة من قفشات السينما الكلاسيكية. قطن ثقيل.', '22222222-2222-2222-2222-222222222222', 480, null, true, 11, false, false, true, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/TB YA SYDY 4OKRAN - MOVIES.jpg"}', false),
('b0000000-0000-0000-0000-000000000012', 'team-damon-salvatore-tee', 'Team Damon Salvatore Streetwear Tee', 'تيشيرت فريق ديمون سالفاتور', 'Represent the elder Salvatore brother Damon in style with this graphic streetwear piece. Heavyweight drop shoulder.', 'تيشيرت "فريق ديمون سالفاتور" لعشاق يوميات مصاص دماء. قصة واسعة وأكتاف منسدلة.', '33333333-3333-3333-3333-333333333333', 510, null, true, 12, true, true, false, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/TEAM DAMON TvD - TV SHOW.jpg"}', false),
('b0000000-0000-0000-0000-000000000013', 'team-stefan-salvatore-tee', 'Team Stefan Salvatore Vintage Tee', 'تيشيرت فريق ستيفان سالفاتور', 'Show your support for Stefan Salvatore with this vintage faded print. Heavyweight comfy cotton build.', 'تيشيرت "فريق ستيفان سالفاتور" بطبعة كلاسيكية باهتة ومميزة. قطن ثقيل فاخر ومريح.', '33333333-3333-3333-3333-333333333333', 510, null, true, 13, false, false, true, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/TEAM STEFAN TvD - TV SHOW.jpg"}', false),
('b0000000-0000-0000-0000-000000000014', 'the-sims-4-plumbob-tee', 'The Sims 4 Plumbob Status Tee', 'تيشيرت ذا سيمز ٤ بلومبوب', 'Plumbob status indicator design for gaming enthusiasts. Relaxed premium streetwear fit.', 'تيشيرت اللعبة الشهيرة ذا سيمز ٤ لشخصيات الجيمينج. قصة مريحة لملابس الشارع العصرية.', '11111111-1111-1111-1111-111111111111', 490, null, true, 14, false, true, false, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/THE SIMS 4 - GAMES.jpg"}', false),
('b0000000-0000-0000-0000-000000000015', 'the-vampire-diaries-tee', 'The Vampire Diaries Mystic Falls Tee', 'تيشيرت يوميات مصاص دماء ميتسيك فولز', 'Mystic Falls class of 2009 nostalgic graphic streetwear design. Heavyweight cotton build.', 'تيشيرت ميستيك فولز كلاس من مسلسل "The Vampire Diaries". خامة قطنية ثقيلة ومميزة.', '33333333-3333-3333-3333-333333333333', 510, null, true, 15, false, false, true, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/TvD - TV SHOW.jpg"}', false),
('b0000000-0000-0000-0000-000000000016', 'got-winter-is-coming-sigil-tee', 'GOT Winter is Coming Sigil Tee', 'تيشيرت صراع العروش الشتاء قادم الكلاسيكي', 'Winter is Coming Stark crest graphic with streetwear distressed lettering. Comfort boxy street fit.', 'تيشيرت شعار عائلة ستارك "الشتاء قادم" بطبعة عتيقة ومميزة. قصة مربعة واسعة لملابس الشارع.', '33333333-3333-3333-3333-333333333333', 490, null, true, 16, true, true, false, false, false, '{S,M,L,XL,XXL}', '{"Standard Cotton", "Premium Cotton"}', '{"/items/Winter is coming GOT - TV SHOW.jpg"}', true)
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
