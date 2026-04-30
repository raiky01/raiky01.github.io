/**
 * seed.js — Raiky Pizza · Poblar Firestore con menú inicial y config
 *
 * USO (una sola vez):
 *   1. Abre menu.html en el navegador (con Firebase ya configurado)
 *   2. Abre DevTools → Console
 *   3. Pega el contenido de este archivo y presiona Enter
 *   4. Escribe: await seedAll()
 *   5. Verifica en la consola de Firebase que los datos aparecieron
 *
 * ⚠️  No ejecutes más de una vez — duplicará los productos.
 */

import { FirebaseService } from './firebase-service.js';

const PRODUCTOS = [
  // ── Pizzas ──────────────────────────────────────────────────────
  {
    name: 'Pizza Hawaiana',
    description: 'Jamón, piña, mozzarella y salsa de tomate',
    price: 135,
    category: 'pizza',
    available: true,
    featured: true,
    image: '',
  },
  {
    name: 'Pizza Mixta',
    description: 'Pepperoni, champiñones, pimiento, cebolla y mozzarella',
    price: 145,
    category: 'pizza',
    available: true,
    featured: false,
    image: '',
  },
  {
    name: 'Pizza Napolitana',
    description: 'Jitomate fresco, albahaca, ajo y mozzarella de búfala',
    price: 130,
    category: 'pizza',
    available: true,
    featured: false,
    image: '',
  },
  {
    name: 'Pizza de Pollo',
    description: 'Pechuga a la plancha, pimiento rojo, cebolla y mozzarella',
    price: 140,
    category: 'pizza',
    available: true,
    featured: true,
    image: '',
  },
  {
    name: 'Pizza de Jamón',
    description: 'Jamón ahumado, aceitunas negras y mozzarella',
    price: 130,
    category: 'pizza',
    available: true,
    featured: false,
    image: '',
  },

  // ── Tacos ────────────────────────────────────────────────────────
  {
    name: 'Tacos al Pastor',
    description: 'Orden de 3 tacos con piña, cilantro y cebolla',
    price: 75,
    category: 'taco',
    available: true,
    featured: true,
    image: '',
  },
  {
    name: 'Tacos de Bistec',
    description: 'Orden de 3 tacos de res con salsa roja y guacamole',
    price: 80,
    category: 'taco',
    available: true,
    featured: false,
    image: '',
  },
  {
    name: 'Tacos de Pollo',
    description: 'Orden de 3 tacos de pollo a la plancha con pico de gallo',
    price: 75,
    category: 'taco',
    available: true,
    featured: false,
    image: '',
  },
  {
    name: 'Tacos de Camarón',
    description: 'Orden de 3 tacos de camarón con salsa chipotle',
    price: 95,
    category: 'taco',
    available: true,
    featured: false,
    image: '',
  },

  // ── Bebidas ──────────────────────────────────────────────────────
  {
    name: 'Refresco 600 ml',
    description: 'Coca-Cola, Sprite o Fanta · botella individual',
    price: 25,
    category: 'bebida',
    available: true,
    featured: false,
    image: '',
  },
  {
    name: 'Agua Natural 1 L',
    description: 'Agua purificada en botella de 1 litro',
    price: 20,
    category: 'bebida',
    available: true,
    featured: false,
    image: '',
  },
  {
    name: 'Limonada Natural',
    description: 'Limonada fresca con hielo, azúcar y limón real',
    price: 35,
    category: 'bebida',
    available: true,
    featured: true,
    image: '',
  },
  {
    name: 'Cerveza',
    description: 'Carta Blanca o Corona · lata 355 ml',
    price: 45,
    category: 'bebida',
    available: true,
    featured: false,
    image: '',
  },

  // ── Otros ────────────────────────────────────────────────────────
  {
    name: 'Orden de Alitas (10 pzas)',
    description: 'Buffalo, BBQ o mango habanero · con aderezo ranch',
    price: 120,
    category: 'otro',
    available: true,
    featured: true,
    image: '',
  },
  {
    name: 'Palitos de Ajo',
    description: '8 palitos de pan con mantequilla de ajo y perejil',
    price: 55,
    category: 'otro',
    available: true,
    featured: false,
    image: '',
  },
  {
    name: 'Postre del Día',
    description: 'Pregunta a tu repartidor · disponibilidad limitada',
    price: 40,
    category: 'otro',
    available: true,
    featured: false,
    image: '',
  },
];

const CONFIG_INICIAL = {
  isOpen: true,
  whatsappNumber: '529811234567', // ← cambia al número real (con código de país, sin +)
  deliveryFee: 30,
  minOrder: 100,
  allowPickup: false,
};

async function seedMenu() {
  console.log('⏳ Subiendo', PRODUCTOS.length, 'productos...');
  for (const producto of PRODUCTOS) {
    const id = await FirebaseService.addProduct(producto);
    console.log('✅', producto.name, '—', id);
  }
  console.log('🎉 Menú subido correctamente.');
}

async function seedConfig() {
  console.log('⏳ Guardando configuración inicial...');
  await FirebaseService.updateConfig(CONFIG_INICIAL);
  console.log('✅ Config guardada:', CONFIG_INICIAL);
}

export async function seedAll() {
  try {
    await seedConfig();
    await seedMenu();
    console.log('');
    console.log('══════════════════════════════════════════');
    console.log('  ✅ Seed completo. Recarga menu.html para ver los productos.');
    console.log('  ⚠️  Cambia whatsappNumber en Admin → Configuración.');
    console.log('══════════════════════════════════════════');
  } catch (err) {
    console.error('❌ Error durante el seed:', err);
    throw err;
  }
}
