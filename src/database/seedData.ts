import { 
  userModel, 
  animalModel, 
  eventModel, 
  notificationModel, 
  healthReportModel 
} from './models';
import { getDatabase } from './connection';
import bcrypt from 'bcrypt';

/**
 * Seed database with initial data
 */
export const seedDatabase = async (): Promise<void> => {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - for development)
    await clearDatabase();

    // Seed users
    await seedUsers();
    
    // Seed animals
    await seedAnimals();
    
    // Seed events
    await seedEvents();
    
    // Seed notifications
    await seedNotifications();
    
    // Seed health reports
    await seedHealthReports();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

/**
 * Clear all data from database (for development/testing)
 */
const clearDatabase = async (): Promise<void> => {
  const db = getDatabase();
  
  const tables = [
    'health_reports',
    'user_favorites', 
    'visit_history',
    'notifications',
    'events',
    'animals',
    'staff',
    'users'
  ];

  for (const table of tables) {
    db.prepare(`DELETE FROM ${table}`).run();
  }
  
  console.log('🧹 Database cleared');
};

/**
 * Seed users
 */
const seedUsers = async (): Promise<void> => {
  const users = [
    {
      email: 'admin@zooquest.com',
      password: 'admin123',
      name: 'Zoo Administrator',
      role: 'admin' as const,
    },
    {
      email: 'staff@zooquest.com',
      password: 'staff123',
      name: 'Zoo Staff Member',
      role: 'staff' as const,
    },
    {
      email: 'visitor@zooquest.com',
      password: 'visitor123',
      name: 'John Visitor',
      role: 'visitor' as const,
    }
  ];

  for (const userData of users) {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    userModel.create({
      email: userData.email,
      password_hash: passwordHash,
      name: userData.name,
      role: userData.role,
    });
  }

  console.log('👥 Users seeded');
};

/**
 * Seed animals
 */
const seedAnimals = async (): Promise<void> => {
  const animals = [
    {
      name: 'Simba',
      species: 'African Lion',
      scientific_name: 'Panthera leo',
      description: 'A majestic male lion known for his impressive mane and regal presence.',
      habitat: 'African Savanna',
      diet: 'Carnivore - primarily zebras, wildebeest, and other large mammals',
      fun_fact: 'Lions can sleep up to 20 hours a day!',
      location: 'Lion Pride Lands',
      status: 'Healthy' as const,
      age: 8,
      weight: 190.5,
      arrival_date: '2019-03-15',
      last_checkup: '2024-01-15',
      caretaker: 'Dr. Sarah Wilson',
      dietary_needs: 'High-protein diet, 15-20 lbs of meat daily',
      image_url: '/images/animals/lion.jpg'
    },
    {
      name: 'Rajah',
      species: 'Bengal Tiger',
      scientific_name: 'Panthera tigris tigris',
      description: 'A powerful Bengal tiger with distinctive black stripes and piercing amber eyes.',
      habitat: 'Indian Forests and Grasslands',
      diet: 'Carnivore - deer, wild boar, and other medium to large mammals',
      fun_fact: 'Each tiger has a unique stripe pattern, like human fingerprints!',
      location: 'Tiger Territory',
      status: 'Healthy' as const,
      age: 6,
      weight: 220.0,
      arrival_date: '2020-07-22',
      last_checkup: '2024-01-10',
      caretaker: 'Dr. Michael Chen',
      dietary_needs: 'Raw meat diet, 20-25 lbs daily',
      image_url: '/images/animals/tiger.jpg'
    },
    {
      name: 'Koko',
      species: 'Western Lowland Gorilla',
      scientific_name: 'Gorilla gorilla gorilla',
      description: 'A gentle giant gorilla known for his intelligence and playful nature.',
      habitat: 'Central African Rainforests',
      diet: 'Herbivore - fruits, leaves, bark, and stems',
      fun_fact: 'Gorillas share 98% of their DNA with humans!',
      location: 'Gorilla Grove',
      status: 'Under observation' as const,
      age: 12,
      weight: 180.0,
      arrival_date: '2018-05-10',
      last_checkup: '2024-01-20',
      caretaker: 'Dr. Emily Rodriguez',
      dietary_needs: 'High-fiber plant diet, 40 lbs daily',
      image_url: '/images/animals/gorilla.jpg'
    },
    {
      name: 'Luna',
      species: 'Gray Wolf',
      scientific_name: 'Canis lupus',
      description: 'A beautiful gray wolf with piercing blue eyes and a thick winter coat.',
      habitat: 'Northern Forests and Tundra',
      diet: 'Carnivore - elk, deer, moose, and smaller mammals',
      fun_fact: 'Wolves can run up to 40 mph and have an incredible sense of smell!',
      location: 'Wolf Pack Territory',
      status: 'Healthy' as const,
      age: 5,
      weight: 65.0,
      arrival_date: '2021-09-08',
      last_checkup: '2024-01-18',
      caretaker: 'Dr. James Parker',
      dietary_needs: 'Raw meat diet, 8-12 lbs daily',
      image_url: '/images/animals/wolf.jpg'
    },
    {
      name: 'Mango',
      species: 'Red Panda',
      scientific_name: 'Ailurus fulgens',
      description: 'An adorable red panda with fluffy fur and a ringed tail.',
      habitat: 'Himalayan Forests',
      diet: 'Herbivore - primarily bamboo, also fruits and insects',
      fun_fact: 'Red pandas were discovered 50 years before giant pandas!',
      location: 'Bamboo Forest',
      status: 'Scheduled for checkup' as const,
      age: 3,
      weight: 5.2,
      arrival_date: '2022-04-12',
      last_checkup: '2023-12-15',
      caretaker: 'Dr. Lisa Thompson',
      dietary_needs: 'Bamboo-rich diet with fruit supplements',
      image_url: '/images/animals/red-panda.jpg'
    },
    {
      name: 'Zara',
      species: 'African Elephant',
      scientific_name: 'Loxodonta africana',
      description: 'A magnificent female elephant known for her gentle nature and intelligence.',
      habitat: 'African Savannas and Forests',
      diet: 'Herbivore - grasses, fruits, bark, and roots',
      fun_fact: 'Elephants can recognize themselves in mirrors and have excellent memories!',
      location: 'Elephant Sanctuary',
      status: 'Healthy' as const,
      age: 25,
      weight: 4500.0,
      arrival_date: '2015-11-30',
      last_checkup: '2024-01-12',
      caretaker: 'Dr. Robert Anderson',
      dietary_needs: 'High-fiber plant diet, 300-400 lbs daily',
      image_url: '/images/animals/elephant.jpg'
    }
  ];

  for (const animal of animals) {
    animalModel.create(animal);
  }

  console.log('🦁 Animals seeded');
};

/**
 * Seed events
 */
const seedEvents = async (): Promise<void> => {
  const events = [
    {
      title: 'Lion Feeding Time',
      description: 'Watch our majestic lions during their afternoon feeding session. Learn about their hunting behaviors and social dynamics.',
      date: '2024-02-15',
      time: '15:00',
      location: 'Lion Pride Lands',
      capacity: 50,
      registered_count: 32,
      status: 'Scheduled' as const,
      image_url: '/images/events/lion-feeding.jpg'
    },
    {
      title: 'Elephant Care Workshop',
      description: 'Join our keepers to learn about elephant care, training, and conservation efforts.',
      date: '2024-02-16',
      time: '10:30',
      location: 'Elephant Sanctuary',
      capacity: 25,
      registered_count: 18,
      status: 'Scheduled' as const,
      image_url: '/images/events/elephant-care.jpg'
    },
    {
      title: 'Night Safari Adventure',
      description: 'Experience the zoo after dark and discover which animals are most active at night.',
      date: '2024-02-17',
      time: '19:00',
      location: 'Main Entrance',
      capacity: 30,
      registered_count: 25,
      status: 'Scheduled' as const,
      image_url: '/images/events/night-safari.jpg'
    },
    {
      title: 'Conservation Talk: Protecting Wildlife',
      description: 'Learn about global conservation efforts and how you can help protect endangered species.',
      date: '2024-02-18',
      time: '14:00',
      location: 'Education Center',
      capacity: 100,
      registered_count: 67,
      status: 'Scheduled' as const,
      image_url: '/images/events/conservation-talk.jpg'
    }
  ];

  for (const event of events) {
    eventModel.create(event);
  }

  console.log('📅 Events seeded');
};

/**
 * Seed notifications
 */
const seedNotifications = async (): Promise<void> => {
  const notifications = [
    {
      title: 'New Baby Red Panda Born!',
      message: 'We are excited to announce the birth of a healthy baby red panda. Visit the Bamboo Forest to catch a glimpse!',
      recipients: 'all',
      status: 'Sent' as const,
      priority: 'High' as const,
      sent_at: '2024-01-20T10:00:00Z'
    },
    {
      title: 'Maintenance Notice',
      message: 'The Lion Pride Lands will be temporarily closed for maintenance from 9 AM to 11 AM tomorrow.',
      recipients: 'all',
      status: 'Sent' as const,
      priority: 'Medium' as const,
      sent_at: '2024-01-22T16:30:00Z'
    },
    {
      title: 'Special Event: Meet the Keepers',
      message: 'Join us this weekend for a special "Meet the Keepers" event where you can learn about animal care from our expert staff.',
      recipients: 'visitors',
      status: 'Scheduled' as const,
      priority: 'Low' as const,
      scheduled_for: '2024-02-10T08:00:00Z'
    },
    {
      title: 'Weather Alert',
      message: 'Due to expected heavy rain, some outdoor exhibits may be temporarily closed. Please check with staff for updates.',
      recipients: 'all',
      status: 'Draft' as const,
      priority: 'Urgent' as const
    }
  ];

  for (const notification of notifications) {
    notificationModel.create(notification);
  }

  console.log('📢 Notifications seeded');
};

/**
 * Seed health reports
 */
const seedHealthReports = async (): Promise<void> => {
  // Get all animals to create health reports for them
  const animals = animalModel.findAll();
  
  const healthReports = [
    {
      animal_id: animals[0]?.id || 'unknown', // Simba
      veterinarian: 'Dr. Sarah Wilson',
      examination_date: '2024-01-15',
      findings: 'Excellent overall health. Strong muscle tone and healthy coat. All vital signs normal.',
      recommendations: 'Continue current diet and exercise routine. Schedule next checkup in 6 months.',
      weight: 190.5,
      temperature: 38.2,
      status: 'Normal' as const
    },
    {
      animal_id: animals[1]?.id || 'unknown', // Rajah
      veterinarian: 'Dr. Michael Chen',
      examination_date: '2024-01-10',
      findings: 'Healthy tiger with good appetite. Minor dental tartar buildup noted.',
      recommendations: 'Add dental chews to diet. Monitor eating habits. Next checkup in 4 months.',
      weight: 220.0,
      temperature: 38.5,
      status: 'Normal' as const
    },
    {
      animal_id: animals[2]?.id || 'unknown', // Koko
      veterinarian: 'Dr. Emily Rodriguez',
      examination_date: '2024-01-20',
      findings: 'Generally healthy but showing signs of minor joint stiffness. Possible early arthritis.',
      recommendations: 'Increase comfort measures in enclosure. Consider joint supplements. Monitor mobility closely.',
      follow_up_date: '2024-03-20',
      weight: 180.0,
      temperature: 37.8,
      status: 'Attention Needed' as const
    }
  ];

  for (const report of healthReports) {
    if (report.animal_id !== 'unknown') {
      healthReportModel.create(report);
    }
  }

  console.log('🏥 Health reports seeded');
};

/**
 * Check if database needs seeding
 */
export const needsSeeding = (): boolean => {
  const animalCount = animalModel.count();
  const userCount = userModel.count();
  
  return animalCount === 0 || userCount === 0;
};

/**
 * Initialize database with seed data if needed
 */
export const initializeWithSeedData = async (): Promise<void> => {
  if (needsSeeding()) {
    console.log('📊 Database appears empty, seeding with initial data...');
    await seedDatabase();
  } else {
    console.log('📊 Database already contains data, skipping seeding');
  }
};
