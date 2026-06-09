# 🌿 Body & Soul – App del Club de Bienestar

App web para gestionar clases, alumnas, reservas y encuestas del club Body & Soul en Roche.

---

## 🚀 Puesta en marcha (paso a paso)

### PASO 1 – Supabase (base de datos)

1. Ve a [supabase.com](https://supabase.com) → **Start for free**
2. Crea un proyecto: `body-and-soul` (elige región **EU West**)
3. Ve a **SQL Editor** → pega el contenido de `supabase-tablas.sql` → **Run**
4. Ve a **Settings → API** y copia:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public key** → `eyJxxx...`

### PASO 2 – Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto (copia `.env.example`):

```
REACT_APP_SUPABASE_URL=https://TUURL.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tuAnonKey
```

### PASO 3 – Crear cuenta admin

Después de registrar la primera alumna, ve a Supabase → **Table Editor → profiles** → edita tu fila y pon `es_admin = true`.

### PASO 4 – GitHub

1. Ve a [github.com](https://github.com) → **New repository** → `body-and-soul`
2. Sube todos estos archivos (arrastra la carpeta o usa GitHub Desktop)
3. **Importante:** NO subas `.env.local` (ya está en `.gitignore`)

### PASO 5 – Vercel

1. Ve a [vercel.com](https://vercel.com) → **New Project**
2. Conecta tu repositorio de GitHub `body-and-soul`
3. En **Environment Variables** añade:
   - `REACT_APP_SUPABASE_URL` = tu URL de Supabase
   - `REACT_APP_SUPABASE_ANON_KEY` = tu clave anon
4. Click **Deploy** → en 2 minutos tienes la URL pública 🎉

---

## 📋 Funcionalidades incluidas

| Función | Estado |
|---|---|
| Registro e inicio de sesión | ✅ |
| Ficha de salud inicial | ✅ |
| Ver clases disponibles con plazas | ✅ |
| Apuntarse a clases | ✅ |
| Límite 2 clases/mes por alumna | ✅ |
| Cancelar plaza | ✅ |
| Lista de espera automática | ✅ |
| Promoción automática de lista espera | ✅ (trigger SQL) |
| Historial de clases | ✅ |
| Encuesta post-clase | ✅ |
| Editar ficha de salud | ✅ |
| Panel de admin | ✅ |
| Crear clases desde admin | ✅ |
| Ver alumnas con condiciones de salud | ✅ |
| Recordatorios por email | 🔜 Conectar Resend |
| Sync Google Calendar | 🔜 Conectar Google API |

---

## 🗂 Estructura de archivos

```
body-and-soul/
├── public/
│   └── index.html
├── src/
│   ├── lib/
│   │   └── supabase.js          ← Conexión a Supabase
│   ├── components/
│   │   ├── LoginScreen.jsx      ← Pantalla de login/registro
│   │   ├── HealthForm.jsx       ← Ficha de salud (nuevo usuario)
│   │   ├── MainApp.jsx          ← Layout principal + navegación
│   │   ├── ClasesTab.jsx        ← Listado de clases + reservas
│   │   ├── MisClasesTab.jsx     ← Mis clases + lista de espera
│   │   ├── EncuestaTab.jsx      ← Encuesta post-clase
│   │   ├── AdminTab.jsx         ← Panel de administración
│   │   ├── PerfilTab.jsx        ← Perfil + ficha editable
│   │   └── Toast.jsx            ← Notificaciones
│   ├── App.jsx                  ← Routing principal
│   ├── index.js                 ← Entry point
│   └── index.css                ← Estilos globales
├── supabase-tablas.sql          ← Script SQL para crear las tablas
├── .env.example                 ← Plantilla de variables de entorno
├── .gitignore
└── package.json
```

---

## 🔜 Próximos pasos opcionales

- **Emails automáticos**: Conectar [Resend](https://resend.com) para recordatorios 24h antes y avisos de lista de espera
- **Google Calendar**: Sincronizar clases con Google Calendar API
- **PWA**: Hacer la app instalable en el móvil (como una app nativa)
