import { connectDB } from './config/db.js';
import Innovation from './models/Innovation.js';
import mongoose from 'mongoose';

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

async function seed() {
  await connectDB();
  await Innovation.deleteMany({});
  await Innovation.insertMany(mockInnovations);
  console.log('Innovations seeded successfully!');
  mongoose.connection.close();
}

seed();
