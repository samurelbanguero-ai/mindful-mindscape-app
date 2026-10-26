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
