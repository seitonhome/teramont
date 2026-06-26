# Teramont Private Rides

Aplicación web premium para reservar viajes privados en Volkswagen Teramont 2024 entre Cartagena, Barú y Barranquilla.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL, Auth, RLS)
- **Wompi Colombia** (pagos)
- **Vercel** (despliegue)

---

## Instalación local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores reales.

### 3. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta los archivos en orden:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
3. En **Authentication → Users**, crea el usuario administrador
4. Copia las claves de **Project Settings → API** al `.env.local`

### 4. Configurar Wompi

1. Crea una cuenta en [comercios.wompi.co](https://comercios.wompi.co)
2. Obtén las claves sandbox en la sección **Desarrolladores**
3. Configura el webhook: `https://tudominio.com/api/webhooks/wompi`
4. Copia las claves al `.env.local`

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Disponible en `http://localhost:3000`

---

## Despliegue en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. En **Settings → Environment Variables**, agrega todas las variables del `.env.example`
3. Cambia `WOMPI_ENVIRONMENT=production` para producción
4. Actualiza `NEXT_PUBLIC_BASE_URL` con tu dominio
5. Configura el webhook de Wompi con la URL de producción

---

## Estructura del proyecto

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── bookings/     # Disponibilidad y creación de reserva
│   │   ├── payments/     # Crear pago Wompi
│   │   ├── webhooks/     # Webhook Wompi
│   │   └── admin/        # API admin protegida
│   ├── admin/            # Panel de administración
│   ├── reservar/         # Formulario de reserva
│   ├── reserva/          # Confirmación y error de pago
│   ├── rutas/            # Página de rutas
│   ├── faq/              # Preguntas frecuentes
│   └── politicas/        # Políticas
├── components/
│   ├── ui/               # Componentes base
│   ├── landing/          # Secciones de la landing page
│   ├── booking/          # Formulario de reserva
│   └── admin/            # Componentes del panel admin
├── lib/
│   ├── availability.ts   # Lógica crítica de disponibilidad del vehículo
│   ├── wompi.ts          # Integración Wompi Colombia
│   ├── supabase/         # Clientes Supabase (browser + server)
│   └── utils.ts          # Utilidades y formateo
└── types/                # TypeScript types compartidos

supabase/migrations/      # SQL schema y seed data
```

---

## Panel de administración

URL: `/admin/login`

Funcionalidades:
- **Dashboard**: KPIs del día, estado del vehículo, últimas reservas
- **Calendario**: línea de tiempo visual del vehículo por día
- **Reservas**: gestión completa (completar, cancelar, marcar saldo pagado)
- **Rutas**: editar precio, duración y buffer por ruta
- **Bloqueos**: crear bloqueos manuales y reposicionamientos
- **Configuración**: anticipo, cancelación, modo de ubicación del vehículo

---

## Lógica de disponibilidad

El sistema controla en tiempo real la ubicación y estado del vehículo:

1. Slots de 30 minutos, de 6am a 8pm (hora Bogotá / America/Bogota)
2. Buffer de 45 minutos después de cada servicio
3. El origen del siguiente servicio debe coincidir con la ubicación real del carro
4. Si el carro está en Barranquilla, no puede salir de Cartagena el mismo día

**Modos de inicio del día:**
- **Modo A (persistente, recomendado)**: el carro queda donde terminó el último servicio
- **Modo B (reset diario)**: vuelve a la ubicación por defecto a las 5am cada día

---

## Flujo de pago

1. Cliente elige ruta, fecha y hora disponible
2. Completa sus datos de contacto y dirección
3. Elige pagar anticipo (50%) o total (100%)
4. Sistema crea reserva en estado `PENDING_PAYMENT`
5. Cliente es redirigido a Wompi para pagar
6. Wompi envía webhook al confirmar el pago
7. Sistema cambia reserva a `CONFIRMED` o `PAID_FULL`
8. Cliente ve página de confirmación con su código de reserva

---

## Pruebas mínimas

```
1. Reservar Cartagena → Barranquilla a las 8:00am
   → Carro disponible en Barranquilla desde las 11:15am (10:30 + 45min buffer)

2. Intentar reservar Cartagena → Barú antes de las 11:15am
   → Rechazado: vehículo no está en Cartagena ✓

3. Reservar Barranquilla → Cartagena a las 11:15am o después
   → Aceptado ✓

4. Crear bloqueo manual de 2pm a 4pm
   → Horarios 2pm-3:30pm desaparecen del calendario ✓

5. Cambiar precio de una ruta desde admin
   → Nueva reserva refleja el precio actualizado ✓

6. Pago aprobado en sandbox Wompi
   → Reserva cambia a CONFIRMED, página de confirmación visible ✓

7. Pago rechazado en sandbox Wompi
   → Reserva queda en PAYMENT_FAILED, horario liberado ✓
```

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role (solo backend) |
| `WOMPI_PUBLIC_KEY` | Llave pública Wompi |
| `WOMPI_PRIVATE_KEY` | Llave privada Wompi (solo backend) |
| `WOMPI_INTEGRITY_KEY` | Llave de integridad Wompi |
| `WOMPI_EVENTS_SECRET` | Secreto de eventos Wompi |
| `WOMPI_ENVIRONMENT` | `sandbox` o `production` |
| `NEXT_PUBLIC_BASE_URL` | URL base de la app |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número WhatsApp con código país |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email de contacto público |
