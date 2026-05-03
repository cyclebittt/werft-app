-- ============================================================
-- Bistro Zur Werft – Supabase Schema
-- In Supabase SQL Editor ausführen: https://supabase.com/dashboard
-- ============================================================

-- Benutzer-Profile (erweitert Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  points      INTEGER DEFAULT 0,
  level       TEXT DEFAULT 'bronze', -- bronze | silver | gold
  role        TEXT DEFAULT 'user',   -- user | admin
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Punkte-Transaktionen
CREATE TABLE IF NOT EXISTS point_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  reason      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Billardtische (initial 6 Tische)
CREATE TABLE IF NOT EXISTS billiard_tables (
  id                  INTEGER PRIMARY KEY,
  status              TEXT DEFAULT 'free',  -- free | occupied | reserved | blocked
  current_booking_id  UUID
);

-- Initial-Daten: 6 Tische anlegen
INSERT INTO billiard_tables (id) VALUES (1),(2),(3),(4),(5),(6)
ON CONFLICT DO NOTHING;

-- Billard-Buchungen
CREATE TABLE IF NOT EXISTS billiard_bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id         INTEGER REFERENCES billiard_tables(id),
  user_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name       TEXT,
  guest_phone      TEXT,
  start_time       TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  end_time         TIMESTAMPTZ,
  status           TEXT DEFAULT 'active', -- pending | active | completed | cancelled
  points_earned    INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- FK von billiard_tables.current_booking_id → billiard_bookings.id
ALTER TABLE billiard_tables
  ADD CONSTRAINT fk_current_booking
  FOREIGN KEY (current_booking_id) REFERENCES billiard_bookings(id) ON DELETE SET NULL;

-- Tischreservierungen (Restaurant)
CREATE TABLE IF NOT EXISTS table_reservations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name  TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  party_size  INTEGER NOT NULL,
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  notes       TEXT,
  status      TEXT DEFAULT 'pending', -- pending | confirmed | cancelled
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Menü-Kategorien
CREATE TABLE IF NOT EXISTS menu_categories (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL,
  sort  INTEGER DEFAULT 0
);

-- Menü-Gerichte
CREATE TABLE IF NOT EXISTS menu_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  price        DECIMAL(6,2) NOT NULL,
  allergens    TEXT[] DEFAULT '{}',
  available    BOOLEAN DEFAULT true,
  sort         INTEGER DEFAULT 0
);

-- News/Ankündigungen
CREATE TABLE IF NOT EXISTS news_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  image_url    TEXT,
  type         TEXT DEFAULT 'general', -- general | event | special | sport
  pinned       BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT now()
);

-- Prämien
CREATE TABLE IF NOT EXISTS rewards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  points_required INTEGER NOT NULL,
  type            TEXT,        -- drink | food | billiard | other
  available       BOOLEAN DEFAULT true
);

-- Eingelöste Prämien
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id   UUID REFERENCES rewards(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  confirmed   BOOLEAN DEFAULT false
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billiard_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE billiard_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Profiles: jeder kann sein eigenes Profil lesen/schreiben
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Admin-Zugriff auf Profile
CREATE POLICY "profiles_admin_read" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Point Transactions: eigene lesen
CREATE POLICY "pt_own_read" ON point_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "pt_own_insert" ON point_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Billiard Tables: alle können lesen (Realtime)
CREATE POLICY "bt_public_read" ON billiard_tables
  FOR SELECT USING (true);

CREATE POLICY "bt_auth_update" ON billiard_tables
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Billiard Bookings: eigene lesen
CREATE POLICY "bb_own_read" ON billiard_bookings
  FOR SELECT USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "bb_auth_insert" ON billiard_bookings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "bb_own_update" ON billiard_bookings
  FOR UPDATE USING (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Table Reservations: eigene lesen, eingeloggte anlegen
CREATE POLICY "tr_own_read" ON table_reservations
  FOR SELECT USING (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "tr_auth_insert" ON table_reservations
  FOR INSERT WITH CHECK (true); -- auch Gäste können reservieren

-- Menu: alle lesen, Admin schreiben
CREATE POLICY "mc_public_read" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "mi_public_read" ON menu_items FOR SELECT USING (true);
CREATE POLICY "mc_admin_write" ON menu_categories
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "mi_admin_write" ON menu_items
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- News: alle lesen, Admin schreiben
CREATE POLICY "news_public_read" ON news_posts FOR SELECT USING (true);
CREATE POLICY "news_admin_write" ON news_posts
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Rewards: alle lesen, Admin schreiben
CREATE POLICY "rewards_public_read" ON rewards FOR SELECT USING (true);
CREATE POLICY "rewards_admin_write" ON rewards
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Redemptions: eigene lesen/anlegen, Admin bestätigen
CREATE POLICY "rr_own_read" ON reward_redemptions
  FOR SELECT USING (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "rr_own_insert" ON reward_redemptions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "rr_admin_update" ON reward_redemptions
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- Trigger: Profil automatisch nach Registrierung anlegen
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Realtime für Billardtische aktivieren
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE billiard_tables;

-- ============================================================
-- Beispiel-Daten (optional)
-- ============================================================

-- Menükategorien
INSERT INTO menu_categories (name, sort) VALUES
  ('Frühstück', 1),
  ('Mittagstisch', 2),
  ('Snacks & Beilagen', 3),
  ('Softdrinks', 4),
  ('Bier & Wein', 5),
  ('Cocktails', 6)
ON CONFLICT DO NOTHING;

-- Beispiel-Prämien
INSERT INTO rewards (name, description, points_required, type) VALUES
  ('1 Kaffee gratis', 'Ein Kaffee deiner Wahl', 50, 'drink'),
  ('1 Softdrink gratis', 'Ein Softdrink deiner Wahl', 30, 'drink'),
  ('1 Stunde Billard gratis', 'Eine Stunde auf einem freien Tisch', 150, 'billiard'),
  ('Dessert gratis', 'Ein Dessert deiner Wahl', 100, 'food')
ON CONFLICT DO NOTHING;
