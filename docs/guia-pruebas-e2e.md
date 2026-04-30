# Guía de Pruebas E2E — Raiky Pizza

Verifica el flujo completo antes de abrir al público.

---

## Prerequisitos

- [ ] Firebase project creado en console.firebase.google.com
- [ ] `Paginaweb/data/firebase-config.js` lleno con tus credenciales reales
- [ ] Admin user creado: Firebase Console → Authentication → Add user
- [ ] Seed ejecutado (ver instrucciones abajo)
- [ ] Sitio publicado en GitHub Pages (o abierto localmente con un servidor HTTP)

> **Importante:** Abre los archivos con un servidor HTTP local (ej. `npx serve Paginaweb`), no con `file://`. Firebase ES Modules no funcionan desde `file://`.

---

## 1. Seed — Poblar la base de datos

1. Abre `menu.html` en el navegador
2. Abre DevTools → Console (F12)
3. Pega este snippet y presiona Enter:

```js
const { seedAll } = await import('./data/seed.js');
await seedAll();
```

4. Verifica que la consola muestre "✅ Seed completo" y 16 productos

> Ejecuta solo **una vez**. Si repites, duplicará los productos.

---

## 2. Flujo del cliente (menú → pedido → rastreo)

### 2a. Menú visible
- [ ] Abre `menu.html`
- [ ] Los 16 productos aparecen (sin "Cargando menú...")
- [ ] Los filtros de categoría funcionan (Pizzas, Tacos, Bebidas, Otros)
- [ ] Las fotos de placeholder aparecen para productos sin imagen

### 2b. Carrito
- [ ] Clic en "+ Agregar" → badge del carrito se incrementa
- [ ] Clic en el ícono 🛒 → drawer se abre desde abajo
- [ ] Los botones − y + cambian la cantidad
- [ ] Reducir a 0 elimina el producto
- [ ] Total incluye costo de envío ($30)
- [ ] El formulario aparece cuando hay artículos en el carrito

### 2c. Validación del formulario
- [ ] Enviar sin nombre → "Requerido" en rojo
- [ ] Teléfono de 9 dígitos → "Teléfono inválido (mín. 10 dígitos)"
- [ ] Dirección de 3 chars → "Ingresa una dirección válida"
- [ ] Formulario válido → botón se deshabilita durante envío

### 2d. Pedido exitoso
- [ ] Llenar nombre, teléfono (10+ dígitos), dirección (5+ chars)
- [ ] Clic "Confirmar pedido por WhatsApp"
- [ ] Se abre WhatsApp con el resumen del pedido
- [ ] El navegador redirige a `rastreo.html?id=XXXX`
- [ ] El carrito queda vacío después del pedido

---

## 3. Rastreo en tiempo real

- [ ] `rastreo.html` muestra el pedido recién creado
- [ ] Estado inicial: **Nuevo** (primer paso resaltado)
- [ ] Dejar la pestaña abierta — avanzarás el estado desde el admin

---

## 4. Panel Admin

### 4a. Login
- [ ] Abre `admin/login.html`
- [ ] Credenciales incorrectas → mensaje de error visible
- [ ] Credenciales correctas → redirige a `admin/index.html`
- [ ] Si ya estás logueado, ir a `admin/login.html` redirige automáticamente

### 4b. Dashboard
- [ ] Stats muestran: pedidos de hoy, ingresos del día, pedidos activos
- [ ] El pedido de prueba aparece en la sección "Pedidos"
- [ ] El card muestra nombre, dirección, artículos y total

### 4c. Avanzar estado del pedido
- [ ] Clic "Preparando" en el card del pedido → estado cambia a "preparando"
- [ ] Verifica en `rastreo.html` (otra pestaña) → el tracker avanza en tiempo real sin recargar
- [ ] Clic "En camino" → tracker avanza
- [ ] Clic "Entregado" → tracker muestra todos los pasos completos

### 4d. Cancelar pedido
- [ ] Crea un segundo pedido de prueba
- [ ] En el admin, clic "Cancelar" → aparece diálogo de confirmación
- [ ] Confirmar → el card desaparece de pedidos activos
- [ ] En `rastreo.html` del pedido cancelado → muestra estado "Cancelado"

---

## 5. Gestión del menú (Admin)

- [ ] Tab "Menú" → lista todos los productos
- [ ] Toggle "Disponible" de un producto → recarga `menu.html` y el producto no aparece
- [ ] Toggle "Popular" → el producto muestra badge "⭐ Popular"
- [ ] Clic en el precio → prompt para editar → guardar → precio actualizado

---

## 6. Configuración (Admin)

- [ ] Tab "Configuración" → formulario con todos los campos
- [ ] Toggle "Cerrado" → aparece banner rojo en `menu.html`
- [ ] Con tienda cerrada: al intentar confirmar pedido → toast "Estamos cerrados"
- [ ] Cambiar número de WhatsApp → confirmar que el siguiente pedido lo usa
- [ ] Cambiar costo de envío → verificar en el carrito que se refleja

---

## 7. Cierre de sesión

- [ ] Clic "Salir" en el admin → redirige a `admin/login.html`
- [ ] Intentar acceder a `admin/index.html` directamente → redirige a `admin/login.html`

---

## Resultado esperado

Todos los checkboxes marcados = sistema listo para producción. 🚀

Si algún paso falla, revisa la consola del navegador (F12) para el mensaje de error.
