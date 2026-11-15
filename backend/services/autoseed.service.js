import User from '../models/User.js';
import Course from '../models/Course.js';
import Product from '../models/Product.js';
import Innovation from '../models/Innovation.js';
import Setting from '../models/Setting.js';
import env from '../config/env.js';
import { hashPassword } from '../utils/helpers.js';

const mockCourses = [
  {
    title: { ha: 'Koyon Hada Inverter da Tsarin Solar', en: 'Inverter & Solar Assembly' },
    description: { ha: 'Koyi yadda ake hada pure sine wave inverter, lissafin batir da panel na solar a aikace.', en: 'Learn to build pure sine wave inverters, battery calculations, and solar panel installation.' },
    price: 35000,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=70',
    duration: '6 Weeks',
    telegramLink: 'https://t.me/opentech_inverter',
    slug: 'solar-inverter-assembly'
  },
  {
    title: { ha: 'Kayan Waya da Microcontroller (IoT)', en: 'Microcontrollers & IoT' },
    description: { ha: 'Yadda ake tsara ESP32 da na\'urori masu sarrafa kansu ta amfani da wayar hannu.', en: 'Build ESP32 projects and self-controlled devices from your phone.' },
    price: 28000,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70',
    duration: '4 Weeks',
    telegramLink: 'https://t.me/opentech_iot',
    slug: 'microcontrollers-iot'
  }
];

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

const mockInnovations = [
  {
    title: { ha: 'Tsarin Ban Ruwa na Solar', en: 'Sensor-assisted Solar Irrigation System' },
    description: { ha: 'An kera wa manoma don rage kudin man fetur.', en: 'Built for farmers to remove the cost of expensive fuel pumps.' },
    category: 'Irrigation',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=70',
    slug: 'solar-irrigation'
  },
  {
    title: { ha: 'Tsarin Wutar Solar 10kVA', en: '10kVA Solar System' },
    description: { ha: 'Don asibitoci da masana\'anta.', en: 'For hospitals and factories.' },
    category: 'Renewable Energy',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=900&q=70',
    slug: 'commercial-solar'
  }
];

export async function ensureInitialAdminAndSeed(email, password) {
  const adminEmail = (env.admin?.email || 'khalifa@opentech.ng').toLowerCase();
  const adminPass = env.admin?.password || 'AdminPassword123!';

  let admin = await User.findOne({ role: 'admin' });
  if (!admin && email.toLowerCase() === adminEmail && password === adminPass) {
    const hashed = await hashPassword(password);
    admin = await User.create({
      fullName: env.admin?.name || 'Khalifa Aminu',
      email: adminEmail,
      phone: '',
      password: hashed,
      role: 'admin',
      emailVerified: true,
      active: true
    });
    console.log('[autoseed] Created initial admin user:', adminEmail);
  }

  if (admin) {
    const [cCount, pCount, iCount, sCount] = await Promise.all([
      Course.countDocuments(),
      Product.countDocuments(),
      Innovation.countDocuments(),
      Setting.countDocuments()
    ]);

    if (cCount === 0) {
      await Course.insertMany(mockCourses);
      console.log('[autoseed] Seeded initial courses');
    }
    if (pCount === 0) {
      await Product.insertMany(mockProducts);
      console.log('[autoseed] Seeded initial products');
    }
    if (iCount === 0) {
      await Innovation.insertMany(mockInnovations);
      console.log('[autoseed] Seeded initial innovations');
    }
    if (sCount === 0) {
      await Setting.create({ maintenanceMode: false });
      console.log('[autoseed] Seeded initial settings');
    }
  }

  return admin;
}
