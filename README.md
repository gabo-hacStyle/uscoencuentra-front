# Documentación de contrato de endpoints

## Resumen

El artículo define el contrato HTTP para USCO Encuentra, una aplicación de objetos
perdidos y encontrados. Especifica autenticación con Google, perfil, catálogo,
creación y seguimiento de reportes, contacto privado y administración. También
establece formatos, validaciones, estados, errores, filtros, paginación y
métricas que el frontend espera del backend.

## Convenciones generales

- Los endpoints protegidos usan `Authorization: Bearer <accessToken>` y
  `Accept: application/json`; los errores normalmente contienen `message` en
  español.
- `eventDate` usa `YYYY-MM-DD`; `publishedAt` usa ISO 8601 con zona horaria.
  Las fechas y periodos administrativos usan `America/Bogota`.
- `/items/mine` y `/items/categories` deben resolverse antes que `/items/:id`.
- Las categorías son: Tecnología, Documentos, Accesorios, Llaves, Ropa y Otros.
- Las imágenes son URLs públicas `https://...`, nunca base64 o data URI. El
  dominio debe declararse en `next.config.ts`.

## Estructura Item

Un `Item` contiene `id`, `type` (`lost` o `found`), `title`, `description`,
`category`, `location`, `locationDetail`, `imageUrl`, `eventDate`,
`publishedAt`, `status` e `isOwner`.

- `location` debe ser exactamente una de las 12 zonas definidas: Cafetería,
  Café y Letras, Bloque Central, Artes, Economía, Ingeniería, Ileusco,
  Laboratorios, Ágoras, Bienestar, Restaurante o Biblioteca.
- `locationDetail` e `imageUrl` pueden ser `null`.
- `isOwner` lo calcula el backend a partir del token.

## Estados de una publicación

- `active`: publicación visible y en búsqueda.
- `in_verification`: otro usuario inició una reclamación o devolución.
- Los reportes cerrados no usan un valor adicional de `status`; aparecen en
  `history` de `/items/mine`.
- El ciclo es `active` → `in_verification` → `active` si el dueño responde
  “No”, o al historial si responde “Sí”. Sin respuesta durante
  `VERIFICATION_DAYS` (actualmente 7), vuelve a `active`.

# Módulo de autenticación

## Endpoint 1: Autenticación mediante OAuth Google (NextAuth.js V5)

`POST /auth/google` solo lo llama el servidor de Next.js y recibe
`{ "idToken": "<id-token JWT de Google>" }`. No requiere `Authorization`.
Devuelve `200` con `accessToken`, `refreshToken` y `user` (`name`, `email`,
`role`).

- El backend debe validar firma, audiencia, emisor, expiración, correo
  verificado y dominio `@usco.edu.co`.
- `ADMIN`/`ROLE_ADMIN` se normaliza a `ADMIN`; `USER`/`ROLE_USER`, a `USER`.
- `401` y `403` muestran un mensaje de cuenta no autorizada; otros errores o
  timeout de 10 segundos muestran un error de comunicación.
- La sesión cifrada de Auth.js dura 30 días. No hay renovación automática:
  ante `401`, se solicita iniciar sesión otra vez.
- Cerrar sesión solo elimina la cookie del frontend; no revoca los tokens.
- El frontend redirige ambos roles a `/home` y protege `/admin`, pero el
  backend debe validar el rol.

# Módulo de perfil

## Endpoint 1: Consulta del perfil del usuario autenticado

`GET /profile` devuelve `numero` (E.164 o `null`) y
`shareWhatsAppNumber` (booleano). El usuario se identifica únicamente por el
token. `401` indica sesión vencida; otros fallos impiden cargar el número.

## Endpoint 2: Actualización del perfil

`PATCH /profile` acepta uno o ambos campos:

- `numero`: celular colombiano E.164 (`+57` seguido de 10 dígitos que empiezan
  por 3).
- `shareWhatsAppNumber`: booleano JSON estricto.

La actualización es parcial. `{}`, JSON inválido, tipos inválidos y
`numero: null` responden `400` o `422`. La respuesta `200` contiene el perfil
completo actualizado. El backend guarda la preferencia por usuario y no
incluye estos datos en respuestas públicas.

# Módulo de catálogo de objetos

## Endpoint 1: Listado de objetos

`GET /items` acepta `type`, `category`, `q` y `sort` (`recent` u `oldest`).
`q` busca sin distinguir mayúsculas ni tildes en título, categoría, lugar y
detalle. Devuelve `200` con un arreglo de `Item`, únicamente de reportes
abiertos.

## Endpoint 2: Contadores por categoría

`GET /items/categories` no recibe parámetros y devuelve las seis categorías,
incluidas las que tengan `count: 0`. Cuenta reportes `lost` y `found` abiertos
y debe coincidir con el listado.

## Endpoint 3: Detalle del objeto

`GET /items/:id` devuelve un `Item`. Un usuario puede consultar sus propios
reportes cerrados desde “Mis reportes”; para los demás, un reporte inexistente
o cerrado responde `404`. `locationDetail` solo se muestra si no es `null`.

## Endpoint 4: Contacto privado del publicador

`GET /items/:id/contact` se ejecuta bajo demanda y devuelve el nombre
enmascarado (`publishedBy`), el correo institucional y `whatsapp` cuando el
publicador autorizó compartirlo. No cambia el estado; los enlaces de WhatsApp
y correo los construye el frontend.

# Módulo de reporte de objetos (perdidos y encontrados)

## Endpoint 5: Crear un reporte

`POST /items` usa `multipart/form-data`. Requiere `type`, `title` (3–60),
`category`, `description` (10–300), `location` y `eventDate` no futura.
`locationDetail` es opcional (máximo 80) e `image` acepta JPG, PNG o WebP de
hasta 5 MB.

- Devuelve `201`, `Location: /items/{id}` y el `Item` creado.
- El autor proviene del token y todo reporte inicia en `active`.
- `400` puede incluir `fieldErrors`; `401`, `413`, `415` y `500` tienen
  mensajes definidos.
- El backend debe repetir las validaciones del frontend, verificar el contenido
  real de la imagen y devolver una URL pública o `null`.

# Módulo de gestión de mis reportes

## Endpoint 6: Mis reportes

`GET /items/mine` devuelve `{ active, history }`, con `Item` completos,
ordenados por `publishedAt` descendente. `active` contiene estados
`active`/`in_verification`; `history` contiene reportes cerrados y siempre
lleva `isOwner: true`.

## Endpoint 7: Resolver un reporte

`PATCH /items/:id/resolution` recibe `{ "resolved": true|false }` y exige que
el usuario sea dueño. `true` mueve el reporte al historial; `false` lo deja
visible y, si estaba en verificación, lo devuelve a `active`. Devuelve `204`.
Los errores previstos incluyen `401`, `403`, `404`, `409`, `422` y `500`.

## Endpoint 8: Iniciar verificación

`POST /items/:id/verification` no recibe body. Un usuario que no sea dueño
puede cambiar `active` a `in_verification`; repetir la llamada es idempotente.
Devuelve `204`. Si no hay respuesta en 7 días, el backend devuelve el reporte a
`active`. El frontend no bloquea la apertura de correo o WhatsApp si la
llamada falla.

# Módulo de administración

## Convenciones del módulo

- Las rutas administrativas usan `API_URL`, requieren rol administrador
  validado por el backend, tienen timeout de 10 segundos y no usan caché.
- Este módulo cambia el formato de error a
  `{ "error": { "code": "...", "message": "..." } }`.
- Los códigos contemplados son `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`,
  `NOT_FOUND`, `CONFLICT`, `SERVER_ERROR` y `SERVICE_UNAVAILABLE`.
- El frontend genera `NETWORK_ERROR` e `INVALID_RESPONSE` y nunca muestra
  datos parciales.

## Filtros comunes (period, location, category)

Los filtros se combinan con AND. `period` filtra `publishedAt`, no
`eventDate`, y usa `America/Bogota`: `all`, `today`, `last_7_days`,
`this_week`, `last_week`, `last_30_days`, `this_month`, `last_month`,
`last_6_months` y `this_year`. `location` y `category` deben coincidir
exactamente con `/admin/filters`. Una consulta válida sin datos devuelve `200`
con conteos en cero.

## Endpoint 1: Estado del sistema

`GET /health` devuelve `status` (`operational`, `degraded` o `unavailable`),
`checkedAt` y, opcionalmente, el estado de cada servicio. Se consulta al
cargar el panel y cada 60 segundos. Un error se muestra como “Estado no
disponible”.

## Endpoint 2: Filtros disponibles

`GET /admin/filters` devuelve listas `locations` y `categories`, cada una con
`value` y `label`. Los valores deben ser exactamente los aceptados por la
creación de reportes.

## Endpoint 3: Métricas globales

`GET /admin/dashboard/global-metrics` devuelve una vez al cargar el resumen:
`totalReports`, `lostReports`, `foundReports` y `successfulReunions`.
Debe cumplirse `lostReports + foundReports = totalReports`.

## Endpoint 4: Analíticas filtradas

`GET /admin/dashboard/analytics` acepta los filtros comunes y devuelve
`scope` (`totalReports`, `lostReports`, `successfulReunions`),
`topCategories` y `topLossLocations`, con hasta tres elementos y orden
descendente por cantidad (desempate alfabético). El frontend calcula la tasa
de reencuentro.

## Endpoint 5: Reportes moderables

`GET /admin/reports` devuelve reportes abiertos y no eliminados, paginados.
Acepta filtros comunes, `search` (solo título y correo), `page` y `pageSize`
(el frontend usa 20). La respuesta contiene `items`, `page`, `pageSize`,
`totalItems` y `totalPages`. Cada elemento incluye `publisherEmail`, pero no
`isOwner` ni otros datos de contacto.

## Endpoint 6: Eliminar un reporte

`DELETE /admin/reports/:id` acepta `200` con `{ id, deleted: true }` o `204`.
El reporte deja de aparecer en administración y catálogo. El frontend conserva
el diálogo si falla y actualiza la lista, filtros y paginación si tiene éxito.
La eliminación puede ser lógica o física; la trazabilidad la decide el
backend.

## Métricas: significado y fórmulas

`successfulReunions` es una métrica independiente de entregas confirmadas
explícitamente: no equivale a cerrar un reporte, y un reencuentro entre un
reporte perdido y uno encontrado cuenta una vez.

- Porcentajes de las tarjetas: `lostReports / totalReports`,
  `foundReports / totalReports` y `successfulReunions / totalReports`.
- Rankings: `count / scope.totalReports` o `count / scope.lostReports`.
- Tasa de reencuentro: `scope.successfulReunions / scope.lostReports`.
- Si el denominador es cero se muestra estado vacío, no `0,0 %`; los valores
  se presentan con un decimal y coma.

## Inconsistencias, contradicciones y vacíos

- La convención general exige `message`, mientras que administración usa
  `error.code`.
- El ejemplo de `history` contiene `status: "active"` aunque los reportes del
  historial están cerrados; debe revisarse en la lógica del front sí se maneja de esa manera (no debería)
- El ejemplo de contacto muestra `whatsapp` como string, pero el contrato
  permite `null`; falta declarar el tipo formal de la respuesta cómo string | null.
- No está decidido si `/items` tendrá paginación; hoy el frontend espera la
  lista completa.
- No están fijados la duración del `accessToken`, la renovación mediante
  `refreshToken` ni la revocación al cerrar sesión.
- El límite de abuso de `/verification` y el valor definitivo de
  `VERIFICATION_DAYS` siguen pendientes.
- El alcance de las métricas globales respecto de reportes eliminados no está
  definido, aunque los reportes moderables solo incluyen abiertos.
- El evento que confirma un reencuentro y su fecha, lugar y categoría de
  anclaje son propuestas, no decisiones cerradas. También falta decidir si
  cuentan reencuentros sin reporte perdido.


**Fuente:** [Documentación de contrato de endpoints](https://gabo2023brazil.atlassian.net/wiki/spaces/~712020612e7e898b4b4d77b2f5f82db9459c97/pages/425985/Documentaci+n+de+contrato+de+endpoints)
