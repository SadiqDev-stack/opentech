import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import mongoose from 'mongoose';

const mockProducts = [
  {
    name: { ha: 'ESP32 IoT Module Kit', en: 'ESP32 IoT Module Kit' },
    description: { ha: 'Relay module da Wi-Fi don sarrafa fitilu da famfo.', en: 'Relay and Wi-Fi module for smart control.' },
    price: 14500,
    image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=70',
    stock: 45,
    slug: 'esp32-iot-kit'
  },
  {
    name: { ha: 'MPPT Solar Controller 30A', en: 'MPPT Solar Controller 30A' },
    description: { ha: 'Kariya ga batir da caji mai sauri.', en: 'Battery protection with fast charge and LCD.' },
    price: 24000,
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=70',
    stock: 12,
    slug: 'mppt-controller-30a'
  },
  {
    name: { ha: 'Digital Multimeter', en: 'Digital Multimeter' },
    description: { ha: 'Kayan gwajin voltage, batir da wayoyi.', en: 'Voltage, battery, and continuity tester.' },
    price: 12500,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=70',
    stock: 0,
    slug: 'digital-multimeter'
  }
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(mockProducts);
  console.log('Products seeded successfully!');
  mongoose.connection.close();
}

seed();
