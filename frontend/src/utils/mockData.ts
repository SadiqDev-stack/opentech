/**
 * Mock data used as a fallback when the API is unreachable.
 * Shapes intentionally match the OpenTech REST API documentation so the
 * backend can be plugged in without touching the UI.
 */

export type Product = {
  id: number;
  image: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  rating: number;
  ratingCount: number;
  featured: boolean;
};

export type Course = {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number;
  enrollment: number;
  category: string;
  duration: string;
  level: string;
  lessonCount: number;
  rating: number;
  ratingCount: number;
  featured: boolean;
  badge?: string;
};

export type CartItem = {
  productId: number;
  name: string;
  sku: string;
  image: string;
  unitPrice: number;
  quantity: number;
  inStock: boolean;
};

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=70`;

export const mockProducts: Product[] = [
  {
    id: 1,
    image: img("1553406830-ef2513450d76"),
    name: "Arduino Uno R3",
    sku: "ARD-UNO-R3",
    description: "Classic ATmega328P development board for beginners.",
    price: 8500,
    stock: 42,
    category: "Arduino & Microcontrollers",
    brand: "Arduino",
    rating: 4.8,
    ratingCount: 120,
    featured: true,
  },
  {
    id: 2,
    image: img("1608564697071-ddf911d81370"),
    name: "ESP32 Dev Board",
    sku: "ESP32-DEV",
    description: "WiFi + Bluetooth microcontroller for IoT projects.",
    price: 6500,
    stock: 30,
    category: "Arduino & Microcontrollers",
    brand: "ESP",
    rating: 4.9,
    ratingCount: 96,
    featured: true,
  },
  {
    id: 3,
    image: img("1580983218765-f663bec07b37"),
    name: "L298N Motor Driver Module",
    sku: "MOT-L298N",
    description: "Dual H-bridge driver for DC and stepper motors.",
    price: 2800,
    stock: 55,
    category: "Robotics & Motors",
    brand: "Elegoo",
    rating: 4.7,
    ratingCount: 78,
    featured: false,
  },
  {
    id: 4,
    image: img("1581092160562-40aa08e78837"),
    name: "HC-SR04 Ultrasonic Sensor",
    sku: "SEN-HCSR04",
    description: "Distance measuring sensor with 2cm-400cm range.",
    price: 1200,
    stock: 80,
    category: "Sensors & Modules",
    brand: "DFRobot",
    rating: 4.8,
    ratingCount: 145,
    featured: true,
  },
  {
    id: 5,
    image: img("1601999009192-2c5f6b6e3b62"),
    name: "SG90 Micro Servo Motor",
    sku: "MOT-SG90",
    description: "9g micro servo with 180 degrees rotation.",
    price: 1800,
    stock: 64,
    category: "Robotics & Motors",
    brand: "Elegoo",
    rating: 4.7,
    ratingCount: 88,
    featured: false,
  },
  {
    id: 6,
    image: img("1619641805634-b0b06d2d1b91"),
    name: "18650 Li-ion Battery",
    sku: "BAT-18650",
    description: "Rechargeable 3.7V cell for portable builds.",
    price: 1500,
    stock: 100,
    category: "Power & Batteries",
    brand: "Arduino",
    rating: 4.9,
    ratingCount: 154,
    featured: false,
  },
  {
    id: 7,
    image: img("1544197150-b99a580bb7a8"),
    name: "Jumper Wires Pack (Male to Male)",
    sku: "ACC-JMP-MM",
    description: "40 pieces of 20cm breadboard jumper wires.",
    price: 2000,
    stock: 200,
    category: "Tools & Accessories",
    brand: "Elegoo",
    rating: 4.8,
    ratingCount: 130,
    featured: true,
  },
  {
    id: 8,
    image: img("1591799264318-7e6ef8ddb7ea"),
    name: "Soldering Iron 60W",
    sku: "TOO-SOL60",
    description: "Adjustable temperature soldering iron kit.",
    price: 5500,
    stock: 25,
    category: "Tools & Accessories",
    brand: "DFRobot",
    rating: 4.6,
    ratingCount: 64,
    featured: false,
  },
  {
    id: 9,
    image: img("1610945265064-0e34e5519bbf"),
    name: "Raspberry Pi 4 Model B (4GB)",
    sku: "RPI-4B-4G",
    description: "Quad-core single board computer with 4GB RAM.",
    price: 85000,
    stock: 12,
    category: "Arduino & Microcontrollers",
    brand: "Raspberry Pi",
    rating: 4.9,
    ratingCount: 68,
    featured: true,
  },
  {
    id: 10,
    image: img("1631561017835-0c0b1ba0b0d5"),
    name: "Breadboard (830 Points)",
    sku: "ACC-BB830",
    description: "Solderless prototyping breadboard.",
    price: 1500,
    stock: 90,
    category: "Tools & Accessories",
    brand: "Elegoo",
    rating: 4.8,
    ratingCount: 130,
    featured: true,
  },
  {
    id: 11,
    image: img("1563207153-f403bf289096"),
    name: "Robotic Car Kit (4WD)",
    sku: "KIT-CAR4WD",
    description: "Complete four wheel drive robot chassis kit.",
    price: 25000,
    stock: 18,
    category: "Kits & Starter Packs",
    brand: "Elegoo",
    rating: 4.9,
    ratingCount: 67,
    featured: true,
  },
  {
    id: 12,
    image: img("1518770660439-4636190af475"),
    name: "IR Obstacle Avoidance Sensor",
    sku: "SEN-IR-OBS",
    description: "Infrared proximity sensor for robots.",
    price: 1300,
    stock: 75,
    category: "Sensors & Modules",
    brand: "DFRobot",
    rating: 4.7,
    ratingCount: 82,
    featured: false,
  },
];

export const mockCourses: Course[] = [
  {
    id: 1,
    image: img("1517180102446-f3ece451e9d8"),
    title: "Frontend Web Development with React & Tailwind CSS",
    description: "Build modern responsive interfaces from scratch.",
    price: 20000,
    enrollment: 320,
    category: "Programming",
    duration: "8 Weeks",
    level: "Beginner",
    lessonCount: 32,
    rating: 4.8,
    ratingCount: 320,
    featured: true,
    badge: "BESTSELLER",
  },
  {
    id: 2,
    image: img("1553406830-ef2513450d76"),
    title: "Electronics & Arduino for Beginners",
    description: "Learn circuits, components and Arduino programming.",
    price: 18000,
    enrollment: 210,
    category: "Electronics",
    duration: "6 Weeks",
    level: "Beginner",
    lessonCount: 28,
    rating: 4.7,
    ratingCount: 210,
    featured: true,
    badge: "POPULAR",
  },
  {
    id: 3,
    image: img("1627398242454-45a1465c2479"),
    title: "Backend Development with Node.js & Express",
    description: "Design and ship production ready REST APIs.",
    price: 22000,
    enrollment: 150,
    category: "Programming",
    duration: "8 Weeks",
    level: "Intermediate",
    lessonCount: 30,
    rating: 4.8,
    ratingCount: 150,
    featured: true,
  },
  {
    id: 4,
    image: img("1581090700227-1e37b190418e"),
    title: "Robotics with Raspberry Pi & Python",
    description: "Build and program autonomous robots.",
    price: 22000,
    enrollment: 180,
    category: "Robotics",
    duration: "10 Weeks",
    level: "Intermediate",
    lessonCount: 35,
    rating: 4.9,
    ratingCount: 180,
    featured: true,
    badge: "NEW",
  },
  {
    id: 5,
    image: img("1620712943543-bcc4688e7485"),
    title: "AI-Powered Web Apps with OpenAI API",
    description: "Add practical AI features to your products.",
    price: 25000,
    enrollment: 103,
    category: "AI & Data",
    duration: "6 Weeks",
    level: "Advanced",
    lessonCount: 24,
    rating: 4.9,
    ratingCount: 103,
    featured: true,
  },
];

export const mockCart: CartItem[] = [
  {
    productId: 1,
    name: "Arduino Uno R3",
    sku: "ARD-UNO-R3",
    image: img("1553406830-ef2513450d76"),
    unitPrice: 8500,
    quantity: 1,
    inStock: true,
  },
  {
    productId: 2,
    name: "ESP32 Dev Board",
    sku: "ESP32-DEV",
    image: img("1608564697071-ddf911d81370"),
    unitPrice: 6500,
    quantity: 1,
    inStock: true,
  },
  {
    productId: 6,
    name: "18650 Li-ion Battery",
    sku: "BAT-18650",
    image: img("1619641805634-b0b06d2d1b91"),
    unitPrice: 1500,
    quantity: 2,
    inStock: true,
  },
];

export const productCategories = [
  { name: "Arduino & Microcontrollers", icon: "fa-microchip" },
  { name: "Robotics & Motors", icon: "fa-robot" },
  { name: "Sensors & Modules", icon: "fa-satellite-dish" },
  { name: "Power & Batteries", icon: "fa-battery-full" },
  { name: "Tools & Accessories", icon: "fa-screwdriver-wrench" },
  { name: "Kits & Starter Packs", icon: "fa-box-open" },
];

export const mockStats = [
  { icon: "fa-users", value: "10K+", label: "Students Trained" },
  { icon: "fa-graduation-cap", value: "50+", label: "Expert Instructors" },
  { icon: "fa-box", value: "2K+", label: "Products Sold" },
  { icon: "fa-award", value: "98%", label: "Satisfaction Rate" },
  { icon: "fa-location-dot", value: "12+", label: "States Reached" },
];

export const mockTeam = [
  { name: "Sadiq Abubakar", role: "Founder & CEO", image: img("1507003211169-0a1dd7228f2d") },
  { name: "Aminu Musa", role: "CTO", image: img("1531384441138-2736e62e0919") },
  { name: "Haruna Lawan", role: "Head of Engineering", image: img("1500648767791-00dcc994a43e") },
  { name: "Aisha Mohammed", role: "Head of Academy", image: img("1573497019940-1c28c88b4f3e") },
  { name: "Yusuf Ibrahim", role: "Head of Operations", image: img("1506794778202-cad84cf45f1d") },
];

export const mockTestimonials = [
  {
    name: "Zainab Aliyu",
    role: "Robotics Student",
    rating: 5,
    quote:
      "OpenTech Academy changed my life. The practical lessons and support helped me build my first product and start earning.",
    image: img("1573497019940-1c28c88b4f3e"),
  },
  {
    name: "Muktar Baba",
    role: "Electronics Enthusiast",
    rating: 5,
    quote:
      "The quality of components in the store is top-notch and delivery is always fast. My go-to place for all electronics needs.",
    image: img("1506794778202-cad84cf45f1d"),
  },
  {
    name: "Fatima Usman",
    role: "Web Development Student",
    rating: 5,
    quote:
      "The project-based approach made learning so easy and fun. Highly recommend OpenTech Academy to anyone.",
    image: img("1544005313-94ddf0286df2"),
  },
];

export const mockServices = [
  {
    icon: "fa-screwdriver-wrench",
    title: "Repair Services",
    description:
      "We repair electronics, gadgets, industrial equipment and more with quality and reliability.",
    points: ["Device Diagnostics", "Hardware Repair", "Maintenance & Support"],
  },
  {
    icon: "fa-solar-panel",
    title: "Solar Installation",
    description:
      "We design and install efficient solar power systems for homes, offices and businesses.",
    points: ["Solar System Design", "Installation & Setup", "Maintenance"],
  },
  {
    icon: "fa-microchip",
    title: "Smart Devices",
    description:
      "We build smart devices and IoT solutions that automate tasks and improve productivity.",
    points: ["IoT & Automation", "Smart Hardware", "Prototyping"],
  },
  {
    icon: "fa-gear",
    title: "Custom Hardware",
    description:
      "Need something unique? We design and build custom hardware tailored to your needs.",
    points: ["Product Design", "PCB & Prototyping", "Manufacturing Support"],
  },
];

export const mockProjects = [
  {
    title: "Smart Attendance System",
    category: "School Attendance Solution",
    description: "A biometric attendance system with real-time reports and analytics for schools.",
    image: img("1517430816045-df4b7de11d1d"),
  },
  {
    title: "Smart Plant Monitoring System",
    category: "IoT Based Solution",
    description: "Monitor plant health, soil moisture and environment in real-time.",
    image: img("1416879595882-3373a0480b5b"),
  },
  {
    title: "5kW Solar Power System",
    category: "Solar Installation",
    description: "Complete solar installation for a residential building in Kano.",
    image: img("1509391366360-2e959784a276"),
  },
  {
    title: "Robotic Arm Prototype",
    category: "Custom Hardware",
    description: "A 4-axis robotic arm built for research and automation projects.",
    image: img("1581091226825-a6a2a5aee158"),
  },
];
