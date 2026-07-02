-- ============================================================
-- AgriNex AI — Supabase PostgreSQL Schema
-- Execute this entire file in the Supabase SQL Editor.
-- Project: AgriNex AI
-- Version: 1.0
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CUSTOM ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('farmer', 'consumer', 'admin');

CREATE TYPE order_status AS ENUM (
  'pending',
  'accepted',
  'quality_verified',
  'dispatched',
  'delivered',
  'cancelled'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

-- ============================================================
-- TABLE 1: PROFILES
-- Every auth.users row gets a matching profiles row via trigger.
-- ============================================================

CREATE TABLE public.profiles (
    id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role                user_role NOT NULL DEFAULT 'consumer',
    full_name           VARCHAR(150) NOT NULL,
    phone_number        VARCHAR(15) UNIQUE NOT NULL,
    location_lat        DECIMAL(9,6),
    location_lng        DECIMAL(9,6),
    address             TEXT,
    language_preference VARCHAR(10) DEFAULT 'en',
    trust_score         DECIMAL(3,2) DEFAULT 5.00 CHECK (trust_score BETWEEN 0.00 AND 5.00),
    is_verified         BOOLEAN DEFAULT FALSE,
    avatar_url          TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Trigger: auto-create a profile row when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '0000000000'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'consumer'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- TABLE 2: PRODUCTS
-- Crop listings created by farmers.
-- ============================================================

CREATE TABLE public.products (
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
-- Purchase records with tracking history.
-- ============================================================

CREATE TABLE public.orders (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id      UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    farmer_id        UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    total_amount     DECIMAL(10,2) NOT NULL,
    status           order_status NOT NULL DEFAULT 'pending',
    payment_status   payment_status NOT NULL DEFAULT 'pending',
    payment_id       VARCHAR(100),
    delivery_address TEXT NOT NULL,
    delivery_lat     DECIMAL(9,6),
    delivery_lng     DECIMAL(9,6),
    tracking_history JSONB NOT NULL DEFAULT '[]',
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE 4: ORDER ITEMS
-- Line items per order.
-- ============================================================

CREATE TABLE public.order_items (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id          UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id        UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    quantity          DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10,2) NOT NULL
);

-- ============================================================
-- TABLE 5: REVIEWS
-- Consumer ratings that update farmer trust score.
-- ============================================================

CREATE TABLE public.reviews (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating      INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment     TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Trigger: update farmer trust_score when a new review is submitted
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

CREATE OR REPLACE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_trust_score();

-- ============================================================
-- TABLE 6: NOTIFICATIONS
-- In-app alerts for order updates, KYC decisions, price alerts.
-- ============================================================

CREATE TABLE public.notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title      VARCHAR(150) NOT NULL,
    message    TEXT NOT NULL,
    is_read    BOOLEAN DEFAULT FALSE,
    type       VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Profiles viewable by all"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- PRODUCTS policies
CREATE POLICY "Products viewable by all"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Farmers insert products"
  ON public.products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer')
  );

CREATE POLICY "Farmers manage own products"
  ON public.products FOR ALL USING (farmer_id = auth.uid());

-- ORDERS policies
CREATE POLICY "Users view own orders"
  ON public.orders FOR SELECT USING (
    consumer_id = auth.uid() OR farmer_id = auth.uid()
  );

CREATE POLICY "Consumers place orders"
  ON public.orders FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'consumer')
  );

CREATE POLICY "Parties update orders"
  ON public.orders FOR UPDATE USING (
    consumer_id = auth.uid() OR farmer_id = auth.uid()
  );

-- ORDER ITEMS policies
CREATE POLICY "Order items visible to order parties"
  ON public.order_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.consumer_id = auth.uid() OR o.farmer_id = auth.uid())
    )
  );

CREATE POLICY "Consumers insert order items"
  ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'consumer')
  );

-- REVIEWS policies
CREATE POLICY "Reviews viewable by all"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Consumers insert reviews"
  ON public.reviews FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'consumer')
  );

-- NOTIFICATIONS policies
CREATE POLICY "Notifications visible to owner"
  ON public.notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Mark own notifications read"
  ON public.notifications FOR UPDATE USING (user_id = auth.uid());
