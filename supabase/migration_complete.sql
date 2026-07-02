-- ============================================================
-- AgriNex AI — Complete Supabase Database Migration
-- Version 2.0 — Run in Supabase SQL Editor
-- This is idempotent — safe to run multiple times
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES (skip if already exist)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('farmer', 'consumer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'accepted', 'quality_verified', 'dispatched', 'delivered', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TABLE 1: PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role                user_role NOT NULL DEFAULT 'consumer',
    full_name           VARCHAR(150) NOT NULL DEFAULT 'Unknown',
    phone_number        VARCHAR(15) DEFAULT '0000000000',
    location_lat        DECIMAL(9,6),
    location_lng        DECIMAL(9,6),
    address             TEXT,
    language_preference VARCHAR(10) DEFAULT 'en',
    trust_score         DECIMAL(3,2) DEFAULT 5.00 CHECK (trust_score BETWEEN 0.00 AND 5.00),
    is_verified         BOOLEAN DEFAULT FALSE,
    avatar_url          TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE 2: PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title               VARCHAR(150) NOT NULL,
    description         TEXT,
    category            VARCHAR(50) NOT NULL,
    price_per_unit      DECIMAL(10,2) NOT NULL,
    unit_type           VARCHAR(20) NOT NULL,
    quantity_available  DECIMAL(10,2) NOT NULL CHECK (quantity_available >= 0),
    image_url           TEXT,
    quality_grade       VARCHAR(5) DEFAULT 'N/A',
    quality_report      JSONB DEFAULT '{}',
    recommended_price   DECIMAL(10,2),
    traceability_code   VARCHAR(50) UNIQUE,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE 3: ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id      UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    farmer_id        UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    total_amount     DECIMAL(10,2) NOT NULL,
    status           order_status NOT NULL DEFAULT 'pending',
    payment_status   payment_status NOT NULL DEFAULT 'pending',
    payment_id       VARCHAR(100),
    delivery_address TEXT NOT NULL DEFAULT 'Not specified',
    delivery_lat     DECIMAL(9,6),
    delivery_lng     DECIMAL(9,6),
    tracking_history JSONB NOT NULL DEFAULT '[]',
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE 4: ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id          UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id        UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    quantity          DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10,2) NOT NULL
);

-- ============================================================
-- TABLE 5: REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating      INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment     TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE 6: NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title      VARCHAR(150) NOT NULL,
    message    TEXT NOT NULL,
    is_read    BOOLEAN DEFAULT FALSE,
    type       VARCHAR(50) NOT NULL DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON public.products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_consumer_id ON public.orders(consumer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON public.orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '0000000000'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'consumer'::public.user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- TRIGGER: Update farmer trust_score on review
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET trust_score = (
    SELECT ROUND(AVG(rating)::NUMERIC, 2)
    FROM public.reviews
    WHERE reviewee_id = NEW.reviewee_id
  )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_trust_score();

-- ============================================================
-- FUNCTION: Decrement product quantity (used by orders backend)
-- ============================================================
CREATE OR REPLACE FUNCTION public.decrement_product_quantity(p_id UUID, p_qty DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET quantity_available = GREATEST(0, quantity_available - p_qty)
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES
DO $$ BEGIN
  CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- PRODUCTS
DO $$ BEGIN
  CREATE POLICY "Products viewable by all" ON public.products FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Farmers insert products" ON public.products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Farmers manage own products" ON public.products FOR ALL USING (farmer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ORDERS
DO $$ BEGIN
  CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (
    consumer_id = auth.uid() OR farmer_id = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Consumers place orders" ON public.orders FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'consumer')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Parties update orders" ON public.orders FOR UPDATE USING (
    consumer_id = auth.uid() OR farmer_id = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ORDER ITEMS
DO $$ BEGIN
  CREATE POLICY "Order items visible to order parties" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
      AND (o.consumer_id = auth.uid() OR o.farmer_id = auth.uid()))
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Consumers insert order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'consumer')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- REVIEWS
DO $$ BEGIN
  CREATE POLICY "Reviews viewable by all" ON public.reviews FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Consumers insert reviews" ON public.reviews FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'consumer')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- NOTIFICATIONS
DO $$ BEGIN
  CREATE POLICY "Notifications visible to owner" ON public.notifications FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Mark own notifications read" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Backend can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('crop-images', 'crop-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('land-docs', 'land-docs', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$ BEGIN
  CREATE POLICY "crop-images: Public read" ON storage.objects FOR SELECT USING (bucket_id = 'crop-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "crop-images: Auth upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'crop-images' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "crop-images: Owner delete" ON storage.objects FOR DELETE USING (bucket_id = 'crop-images' AND auth.uid() = owner);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "land-docs: Owner read" ON storage.objects FOR SELECT USING (bucket_id = 'land-docs' AND auth.uid() = owner);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "land-docs: Auth upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'land-docs' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "avatars: Public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "avatars: Auth upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- DONE — Run this entire file in the Supabase SQL Editor
-- ============================================================
