
# Guía de Integración API Backend

## Resumen
Este documento describe los endpoints esperados por el frontend para una integración completa del backend real.

## Configuración de Cambio Mock → Real

### Paso 1: Variables de Entorno
```bash
# .env (crear en root del proyecto)
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=https://tu-backend-real.com/api
VITE_MOCK_DELAY=0
```

### Paso 2: Verificar Configuración
- El archivo `src/config/api.ts` controlará automáticamente el modo
- Los servicios en `src/services/` cambiarán automáticamente a APIs reales

## APIs Esperadas

### 1. Autenticación
```
POST /auth/login
POST /auth/register
POST /auth/refresh
GET  /auth/user
POST /auth/logout
```

### 2. Usuarios (Admin)
```
GET    /admin/users              - Todos los usuarios
GET    /admin/users/:id          - Usuario específico
GET    /admin/users?type=:type   - Usuarios por tipo
GET    /admin/users/pending      - Usuarios pendientes
POST   /admin/users/:id/approve  - Aprobar usuario
POST   /admin/users/:id/reject   - Rechazar usuario
PUT    /admin/users/:id          - Actualizar usuario
```

### 3. Drovers
```
GET    /admin/drovers                     - Todos los drovers
GET    /admin/drovers/:id                 - Drover específico
GET    /admin/drovers?status=active       - Drovers activos
GET    /admin/drovers?availability=available - Drovers disponibles
GET    /admin/drovers?city=:city          - Drovers por ciudad
POST   /admin/drovers/:id/approve         - Aprobar drover
POST   /admin/drovers/:id/reject          - Rechazar drover
PUT    /admin/drovers/:id                 - Actualizar drover
```

### 4. Transfers
```
GET    /admin/transfers                    - Todos los transfers
GET    /admin/transfers/:id                - Transfer específico
GET    /admin/transfers?status=:status     - Transfers por estado
GET    /admin/transfers?clientId=:id       - Transfers por cliente
GET    /admin/transfers?active=true        - Transfers activos
POST   /admin/transfers/assign             - Asignar conductor
PUT    /admin/transfers/:id/status         - Actualizar estado
POST   /admin/transfers/:id/cancel         - Cancelar transfer
```

### 5. Reviews
```
GET    /admin/reviews                      - Todas las reviews
GET    /admin/reviews/:id                  - Review específica
GET    /admin/reviews?transferId=:id       - Reviews por transfer
GET    /admin/reviews?driverId=:id         - Reviews por drover
GET    /admin/reviews?status=new           - Reviews nuevas
POST   /admin/reviews/:id/respond          - Responder review
POST   /admin/reviews/:id/mark-viewed      - Marcar como vista
```

### 6. Support
```
GET    /admin/support/tickets              - Todos los tickets
GET    /admin/support/tickets/:id          - Ticket específico
GET    /admin/support/tickets?status=:status - Tickets por estado
POST   /admin/support/tickets/:id/assign   - Asignar ticket
PUT    /admin/support/tickets/:id/status   - Actualizar estado
POST   /admin/support/tickets/:id/messages - Añadir mensaje
```

## Tipos de Datos TypeScript

Los tipos están definidos en:
- `src/services/api/types/auth.ts` - Tipos de usuario y auth
- `src/data/mocks/drovers.ts` - Tipo Drover
- `src/data/mocks/transfers.ts` - Tipo Transfer
- `src/data/mocks/reviews.ts` - Tipo Review
- `src/data/mocks/support-tickets.ts` - Tipo SupportTicket

## Headers Requeridos

```javascript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer <token>' // Solo para endpoints protegidos
}
```

## Respuestas Esperadas

### Formato Éxito
```json
{
  "data": { ... },
  "message": "Success"
}
```

### Formato Error
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

## Testing

1. **Modo Mock**: `VITE_USE_MOCK_DATA=true` - Funciona con datos simulados
2. **Modo Real**: `VITE_USE_MOCK_DATA=false` - Requiere backend real

El frontend está completamente preparado para ambos modos.
