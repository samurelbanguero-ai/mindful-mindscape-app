## SERENA — Construcción completa (Frontend)

Voy a construir TODA la plataforma con datos simulados en localStorage. Cuando lleguemos al **Diario IA real** y al **Spotify real**, activamos Lovable Cloud. Mientras tanto, la IA y Spotify funcionarán con respuestas pregrabadas inteligentes (sin parecer falsas).

---

### Fase 1 — Landing completa (5 secciones del documento)

Reemplazo el landing actual por las secciones exactas:
1. **Inicio** — hero con mensaje *"Entender tus emociones es el primer paso para sentirte mejor."*
2. **¿Cómo Funciona?** — registro diario, diario IA, comunidad, psicólogos, recomendaciones.
3. **Beneficios** — 4 tarjetas (autoconocimiento, seguimiento, apoyo, actividades).
4. **Recursos Gratuitos** — líneas, centros, info salud mental.
5. **Contacto** — formulario + redes + FAQ (acordeón).

### Fase 2 — Auth + Onboarding

- Registro con email, usuario, contraseña, **rol** (usuario / psicólogo), modo de visibilidad (público / alias / anónimo).
- **Onboarding de usuario** tras registro: gustos (música, pelis, series, lectura, videojuegos, deportes, arte, naturaleza, tecnología, cocina), géneros musicales, pelis/series favoritas, actividades para relajarse, objetivos personales.

### Fase 3 — Dashboard del Usuario (rediseño)

- **Registro emocional diario**: emoción + intensidad 1-10 + situaciones (chips) + comentarios.
- **Dashboard emocional**: gráficas semanales, mensuales, tendencias, emoción predominante, evolución.
- **Recomendaciones inteligentes**: según emoción + gustos del onboarding (peli, música, actividad).
- **Árbol de crecimiento** virtual (SVG que crece con acciones).
- **Rachas** (3 / 7 / 30 días) con badges.
- **Retos personalizados** según gustos.
- **Notificaciones** in-app con mensajes naturales.

### Fase 4 — Diario Emocional con IA (simulado)

Chat conversacional con respuestas reflexivas pregrabadas inteligentes (banco de preguntas según emoción detectada por keywords). Lista para conectar a Lovable AI Gateway después.

### Fase 5 — Comunidad de Apoyo (estilo Reddit)

- Feed de publicaciones con autor (usuario / alias / anónimo).
- Crear post + comentar.
- **Reacciones positivas**: ❤️ Te entiendo · 🤝 No estás solo · 🌱 Gracias por compartir · 💙 Te acompaño · ✨ Esto me ayudó.
- **Filtro automático** de palabras ofensivas (lista local) + botón de reportar.

### Fase 6 — Spotify (simulado)

Botón "Conectar Spotify" → muestra artistas/géneros/playlists de ejemplo y recomienda playlists según emoción. Etiquetado claramente como demo hasta activar OAuth real.

### Fase 7 — Panel de Psicólogo

- Vista de tendencias globales (gráficas agregadas).
- Lista de usuarios que pidieron apoyo (solo alias + estado emocional).
- Enviar mensaje de apoyo anónimo.
- Chat 1:1 con usuarios (datos simulados).

### Fase 8 — Tema dinámico por emoción (mantener lo actual)

Se conserva el sistema `data-mood` ya construido para que la paleta cambie según cómo se siente el usuario.

---

### Detalles técnicos

- **Rutas nuevas**: `/onboarding`, `/diario` (chat IA), `/comunidad`, `/comunidad/$postId`, `/recomendaciones`, `/perfil`, `/psicologo` (dashboard pro), `/psicologo/usuarios/$alias`, `/contacto`, `/recursos`.
- **Estado**: extender `MoodProvider` con `profile` (gustos), `posts`, `chatMessages`, `streak`, `treeLevel`, `role`.
- **Persistencia**: todo en `localStorage` con claves namespaced (`serena_*`).
- **Stack**: TanStack Start + Tailwind + shadcn + Recharts (ya instalado). Sin nuevos paquetes pesados.
- **Cloud**: activación pospuesta hasta Fase 4 real. Toda la arquitectura ya queda preparada para sustituir `localStorage` por Supabase con cambios mínimos.

### Lo que NO incluye esta entrega

- IA empática real (será simulada hasta activar Cloud).
- OAuth real de Spotify.
- Notificaciones push del navegador (solo in-app por ahora).
- Autenticación real de psicólogos verificados (solo rol simulado).

---

¿Le doy luz verde y empiezo por la Fase 1?
