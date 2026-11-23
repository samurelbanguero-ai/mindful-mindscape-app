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

## 🚀 Despliegue y desarrollo

Requiere Docker. Antes de nada, crea `backend/.env` a partir de `backend/.env.example`
(con `NODE_ENV=production`, secretos JWT de 32+ caracteres y `ADMIN_PASSWORD` de 12+).

### Producción

```bash
docker compose up -d --build
```

- La app queda en `http://<host>:3031`. El frontend es un servidor Node compilado que
  reenvía `/api` al backend; el backend no publica ningún puerto.
- Los contenedores corren sin root y tienen health checks; la base de datos y los logs
  viven en `data/`.
- Tras cambiar código o `backend/.env`, vuelve a ejecutar el mismo comando.

### Desarrollo (recarga en caliente)

```bash
docker compose -f docker-compose.dev.yml up
```

Usa Vite y nodemon con el código montado. El frontend queda en `http://localhost:3031`
y el backend solo en `http://127.0.0.1:2122`.

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
