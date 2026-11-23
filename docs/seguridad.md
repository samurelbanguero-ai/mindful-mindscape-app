# Seguridad de EmoWave

## Manejo de secretos

- Los secretos (API keys, secretos JWT, contraseña SMTP, credenciales de Spotify, contraseña del administrador) viven solo en `backend/.env`, que está en `.gitignore` y nunca se versiona.
- `backend/.env.example` se versiona **sin valores**: solo documenta qué variables existen.
- Antes de cada commit, revisar que ningún valor real haya quedado en archivos versionados. Una forma rápida:

  ```bash
  git grep -n 'sk-ant-'          # API keys de Anthropic
  git diff --cached | grep -iE '(secret|password|api_key)=.+'
  ```

## Registro de incidentes

### 2026-11-23 — Auditoría de seguridad y despliegue

Hallazgos corregidos:

| Problema | Riesgo | Corrección |
|---|---|---|
| Cambiar usuario o contraseña no pedía la contraseña actual y aceptaba contraseñas de 6 caracteres | Un token de acceso robado bastaba para quedarse con la cuenta | Se exige la contraseña actual, las mismas reglas que el registro, límite de intentos por usuario y se cierran las demás sesiones |
| El servidor corría con `NODE_ENV=development` | CORS aceptaba cualquier origen con cookies y cada consulta SQL (con notas del diario) se imprimía en los logs | Producción por defecto en Docker; el log de SQL solo con `SQL_DEBUG=true`; CORS siempre con lista blanca |
| Secretos JWT ausentes o débiles se reemplazaban en silencio por uno aleatorio | Todas las sesiones se cerraban en cada reinicio | En producción el arranque falla con un mensaje claro |
| Puerto del backend (2122) publicado en toda la red | Cualquiera en la red podía falsear `X-Forwarded-For` y saltarse los límites de intentos | El backend ya no publica puerto; el proxy del frontend fija la IP real del cliente |
| Frontend servido con el servidor de desarrollo de Vite (`allowedHosts: true`) | Expone código fuente y herramientas de desarrollo | Imagen de producción compilada, sin código fuente |
| El sembrado del administrador buscaba también por usuario/correo | Una cuenta registrada con ese nombre podía convertirse en administradora | Solo actualiza una cuenta que ya sea admin; si hay conflicto no siembra |
| Mapas de límite de peticiones sin limpieza | Crecimiento de memoria sin límite | Barrido periódico de ventanas vencidas |
| `/auth/refresh-token` sin límite | Fuerza bruta sin freno | Límite de 60 cada 15 minutos por IP |
| Respuestas y reacciones permitidas en publicaciones pendientes o rechazadas | Interacción con contenido moderado | Solo en publicaciones aprobadas |
| Avatar pasado por `sanitizeText` y cuerpo limitado a 50 KB | La foto de perfil nunca se guardaba | Validación estricta (emoji, `https://` o PNG/JPEG/WebP pequeño) y la foto se reduce en el navegador |


### 2026-07 — API key de Anthropic expuesta en el repositorio público

| Campo | Detalle |
|---|---|
| Qué se expuso | Una API key de Anthropic (`sk-ant-api03-…`) |
| Dónde | `backend/.env.example` |
| Commit que la introdujo | `3dae61e` — 2026-07-13 18:14 (UTC-5) |
| Commit que la retiró del archivo | `0fd113b` — 2026-07-14 11:39 (UTC-5) |
| Exposición | El repositorio `samurelbanguero-ai/mindful-mindscape-app` es público, así que la key quedó visible en el historial de git aunque ya no esté en el archivo actual |
| Detección | Revisión de seguridad del 2026-10-07 |
| Contención | La key fue **revocada** en la consola de Anthropic y reemplazada por una nueva que solo está en `backend/.env` (confirmado por el responsable del proyecto el 2026-10-26) |
| Verificación | Ningún archivo versionado contiene la key nueva ni otros valores de `backend/.env` (comprobado por valor el 2026-10-26) |

**Decisión sobre el historial:** no se reescribió. Como la key ya está revocada, no da acceso a nada, y al ser un repositorio público es probable que ya la hayan copiado escáneres automáticos, así que borrarla del historial no deshace la exposición. Reescribir habría cambiado todos los hashes de commits y obligado a hacer `push --force` a `main`.

Si en el futuro se decide limpiarlo, el procedimiento recomendado es:

1. Respaldo: `git clone --mirror <url> respaldo.git`.
2. Crear `reemplazos.txt` con la línea `<key-vieja>==>***REMOVED***`.
3. `git filter-repo --replace-text reemplazos.txt` (opcionalmente `--path backend/node_modules --invert-paths` para reducir el tamaño del repositorio).
4. `git push --force --all` y pedir a GitHub Support que purgue las vistas en caché de los commits antiguos.
5. Avisar a cualquier persona con una copia local para que vuelva a clonar.

**Prevención:** `.env.example` debe tener las variables vacías; nunca copiar `.env` sobre `.env.example`.
