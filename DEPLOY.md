# Deployment-Anleitung

## 1. GitHub-Repo anlegen

1. Gehe zu https://github.com/new
2. Repository-Name: `werft-app`
3. Visibility: Public oder Private
4. **KEIN** README/gitignore/license hinzufügen (bereits vorhanden)
5. Repo erstellen → du bekommst die Remote-URL

## 2. Code auf GitHub pushen

```bash
cd /Users/leonseitz/Documents/werft-app

# Remote hinzufügen (deine GitHub-URL einsetzen)
git remote add origin https://github.com/DEIN-USERNAME/werft-app.git

# Pushen
git push -u origin main
```

## 3. Supabase-Projekt anlegen

1. https://supabase.com/dashboard → "New Project"
2. Name: `werft-app` (oder ähnlich)
3. Region: Frankfurt (eu-central-1) empfohlen
4. Passwort notieren
5. Nach Erstellung: **Settings → API** → URLs und Keys kopieren

## 4. Datenbankschema ausführen

1. Im Supabase Dashboard: **SQL Editor**
2. Inhalt von `supabase-schema.sql` einfügen
3. "Run" klicken

## 5. Vercel-Deployment

1. https://vercel.com → "Add New → Project"
2. GitHub-Repo importieren
3. Framework: **Next.js** (automatisch erkannt)
4. Environment Variables hinzufügen:
   - `NEXT_PUBLIC_SUPABASE_URL` = deine Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = dein Anon Key
5. Deploy klicken

## 6. Supabase Auth konfigurieren

Im Supabase Dashboard → **Authentication → URL Configuration**:
- Site URL: `https://deine-vercel-domain.vercel.app`
- Redirect URLs: `https://deine-vercel-domain.vercel.app/**`

## 7. Admin-Nutzer anlegen

Nach Registrierung in der App: Im Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'deine-user-id';
```

## Lokale Entwicklung

```bash
# .env.local anlegen
cp .env.local.example .env.local
# Werte aus Supabase eintragen

# Development Server starten
npm run dev
```

Öffne http://localhost:3000
