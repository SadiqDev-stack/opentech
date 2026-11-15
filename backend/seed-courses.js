import { connectDB } from './config/db.js';
import Course from './models/Course.js';
import mongoose from 'mongoose';

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

async function seed() {
  await connectDB();
  await Course.deleteMany({});
  await Course.insertMany(mockCourses);
  console.log('Courses seeded successfully!');
  mongoose.connection.close();
}

seed();
