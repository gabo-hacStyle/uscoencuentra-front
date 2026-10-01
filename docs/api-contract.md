# Contrato de API — USCO Encuentra

## Modelo `Item`

| Campo                 | Tipo                  | Obligatorio               | Notas                                                                                  |
| --------------------- | --------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| `id`                  | string                | Sí (lo genera el backend) |                                                                                        |
| `type`                | `"LOST"` \| `"FOUND"` | Sí                        | `LOST`: publicado por quien perdió el objeto. `FOUND`: publicado por quien lo encontró |
| `title`               | string                | Sí                        |                                                                                        |
| `description`         | string                | Sí                        |                                                                                        |
| `category`            | string                | Sí                        | Debe pertenecer al catálogo de `GET /api/categories`                                   |
| `location`            | string                | Sí                        | Dónde se perdió o se encontró                                                          |
| `imageBase64`         | string \| null        | **No**                    | Si no hay imagen, el backend devuelve `null`                                           |
| `publisherMaskedName` | string                | Sí                        | Ej. "J*** P***". Lo enmascara el backend                                               |
| `contactWhatsapp`     | string                | Sí                        | Formato internacional sin `+`, ej. `57300XXXXXXX`                                      |
| `contactEmail`        | string                | Sí                        | Correo institucional                                                                   |
| `createdAt`           | string (ISO 8601)     | Sí (lo genera el backend) |                                                                                        |

## Endpoints

### `GET /api/items`

Lista de objetos con filtros y paginación.

- Query params (todos opcionales): `type`, `category`, `page`, `limit`
- Respuesta `200`:

```json
{
  "data": [
    /* Item[] */
  ],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

### `GET /api/items/:id`

- Respuesta `200`: `Item`
- Respuesta `404`: `{ "message": "Item not found" }`

### `POST /api/items`

Crea una publicación de objeto perdido o encontrado.

- Body:

```json
{
  "type": "LOST",
  "title": "string",
  "description": "string",
  "category": "string",
  "location": "string",
  "imageBase64": "string | null (opcional)",
  "contactWhatsapp": "string",
  "contactEmail": "string"
}
```

- Respuesta `201`: `Item` creado
- Respuesta `400`: `{ "message": "string", "errors": [ { "field": "string", "message": "string" } ] }`

### `GET /api/categories`

- Respuesta `200`: `string[]`
