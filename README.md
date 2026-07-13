# Emowave — Plataforma de Bienestar Emocional 🧘‍♀️

Una aplicación fullstack para gestionar tu bienestar emocional con diario inteligente, comunidad anónima y seguimiento del humor.

## 📁 Estructura del Proyecto

```
mindful-mindscape-app/
├── frontend/          # React + TanStack Start (Vite)
│   ├── src/
│   │   ├── routes/   # Páginas (diario, perfil, comunidad, etc)
│   │   ├── components/ # Componentes React (UI)
│   │   ├── lib/      # Utilidades y API client
│   │   └── hooks/    # Custom React hooks
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/          # Node.js + Express
│   ├── index.js      # Servidor principal
│   ├── package.json
│   └── README.md
│
└── package.json     # Scripts raíz
```

## 🚀 Quick Start

### Opción 1: Ejecutar en dos terminales (recomendado)

**Terminal 1 - Frontend:**
```bash
npm run dev:frontend
```

**Terminal 2 - Backend:**
```bash
npm run dev:backend
```

Luego accede a:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api/health

### Opción 2: Setup manual

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend (nueva terminal):**
```bash
cd frontend
npm install
npm run dev
```

## 📚 API Endpoints

El backend proporciona los siguientes endpoints:

### 🔐 Autenticación
- `POST /api/auth/register` — Registrar usuario
- `POST /api/auth/login` — Iniciar sesión
- `GET /api/auth/me` — Obtener usuario actual (requiere token)

### 📔 Diario
- `POST /api/diary/entries` — Crear entrada de diario
- `GET /api/diary/entries` — Obtener todas las entradas
- `GET /api/diary/entries/:id` — Obtener entrada específica
- `PUT /api/diary/entries/:id` — Actualizar entrada

### 👤 Perfil
- `GET /api/profile/:userId` — Obtener perfil de usuario
- `PUT /api/profile` — Actualizar perfil actual (requiere token)

### 🌍 Comunidad
- `GET /api/community/posts` — Obtener posts (límite por defecto: 20)
- `POST /api/community/posts` — Crear post anónimo
- `POST /api/community/posts/:postId/replies` — Añadir respuesta a post

### 🏥 Salud
- `GET /api/health` — Verificar estado del backend

## 🔑 Autenticación

Todas las peticiones a endpoints protegidos requieren el header:
```
Authorization: Bearer {token}
```

El token se obtiene en `POST /api/auth/login` y se guarda automáticamente en `localStorage` en el frontend.

## 🛠️ Desarrollo

### Frontend Scripts
```bash
npm run dev:frontend    # Inicia servidor de desarrollo (puerto 5173)
npm run build:frontend  # Compila para producción
npm run lint:frontend   # Ejecuta ESLint
```

### Backend Scripts
```bash
npm run dev:backend    # Inicia servidor (puerto 3000)
```

## 📦 Dependencias principales

**Frontend:**
- React 19
- TanStack Router (routing)
- TanStack Start (framework)
- Tailwind CSS + Shadcn UI
- React Hook Form + Zod
- Recharts (gráficos)
- Sonner (notificaciones)

**Backend:**
- Express 4
- CORS (cross-origin)
- UUID (identificadores únicos)

## 🌐 Configuración CORS

El backend permite peticiones desde `http://localhost:5173` por defecto.

Para cambiar durante desarrollo:
```bash
FRONTEND_URL=https://tudominio.com npm run dev:backend
```

## 📝 Flujo de Datos y Persistencia

```
Frontend (React) ──[src/lib/api.ts]──> Backend (Express) ──> SQLite (better-sqlite3)
```

El backend utiliza una base de datos SQLite física persistente en `./backend/emowave.db`, lo que garantiza la persistencia de usuarios, diarios, publicaciones, tokens de Spotify y mensajes de soporte.

## 🛡️ Nuevas Funcionalidades de Producción

1. **Integración con Spotify OAuth 2.0**:
   - Conexión oficial y segura (mitigación CSRF mediante estado firmado con JWT).
   - Renovación automática y transparente de tokens expirados.
   - Recomendaciones de playlists reales basadas en la emoción padre.
2. **Sistema de Soporte Psicológico Confidencial**:
   - Solicitudes con consentimiento de privacidad y opción para compartir diario emocional de forma segura.
   - Asignación automática de profesionales, chat bidireccional y control de mensajes leídos.
   - Cierre y resolución de casos de soporte.
3. **Panel de Moderación y Auditoría**:
   - Moderación de publicaciones reportadas (aprobar, rechazar, editar).
   - Registro inmutable de acciones administrativas en logs de auditoría para seguridad OWASP.
4. **Resiliencia ante Caídas (Crashes)**:
   - Resuelto crash en recomendaciones y Spotify mediante resolución recursiva a la emoción padre (`getParentMood()`).

---

**Made with ❤️ for mental wellbeing**
