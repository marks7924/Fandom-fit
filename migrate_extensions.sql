-- =========================================================================
-- FANDOM FIT - MIGRATION EXTENSION: Add Pre-Order & Cancel/Edit Support
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- =========================================================================

-- 1. Extend products table with is_soon and is_preorder toggles
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_soon BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT FALSE;

-- 2. Extend orders table with cancel_token for cancellation & editing links
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_token VARCHAR(255) DEFAULT NULL;

-- 3. Extend settings table with global_preorder_mode if missing
-- Note: settings table is a key-value store. Let's make sure it is updated.
-- If key 'global_preorder_mode' is not in settings, insert it.
INSERT INTO settings (key, value)
VALUES ('global_preorder_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- 4. Extend orders table with cancellation reason and refund status
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_refunded BOOLEAN DEFAULT FALSE;
