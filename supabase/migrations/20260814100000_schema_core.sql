CREATE TYPE product_status AS ENUM ('draft', 'available', 'reserved', 'sold', 'archived');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'won', 'lost');

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_vi text NOT NULL,
  name_en text NOT NULL,
  line text,
  material text,
  year int,
  condition text,
  desc_vi text,
  desc_en text,
  price numeric,
  status product_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at);

CREATE TABLE product_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  kind text NOT NULL DEFAULT 'gallery' CHECK (kind IN ('cover', 'gallery', 'video')),
  sort_order int NOT NULL DEFAULT 0
);
CREATE INDEX idx_product_media_product ON product_media(product_id);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_vi text NOT NULL,
  name_en text NOT NULL,
  desc_vi text,
  desc_en text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_vi text NOT NULL,
  name_en text NOT NULL,
  content_vi text NOT NULL,
  content_en text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_vi text NOT NULL,
  title_en text NOT NULL,
  body_vi text,
  body_en text,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE faq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_vi text NOT NULL,
  question_en text NOT NULL,
  answer_vi text NOT NULL,
  answer_en text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'buy' CHECK (type IN ('buy', 'maintenance')),
  name text,
  phone text,
  budget text,
  need text,
  line_interest text,
  channel text,
  status lead_status NOT NULL DEFAULT 'new',
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_status ON leads(status);

CREATE TABLE lead_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  storage_bucket text NOT NULL DEFAULT 'lead-attachments',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_attachments_lead ON lead_attachments(lead_id);

CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
