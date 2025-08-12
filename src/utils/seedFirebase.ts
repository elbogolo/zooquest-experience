/**
 * Firebase Data Seeding Script
 * Populates Firestore with sample zoo data
 */

import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { firebaseService } from '@/services/firebaseService';
import type { AdminAnimal, AdminEvent, AdminNotification } from '@/types/admin';

// Sample Animals Data
const animals: Partial<AdminAnimal>[] = [
  {
    name: "Leo",
    species: "African Lion",
    location: "Lion's Den - Section A",
    status: "Healthy",
    lastCheckup: "2024-01-15",
    nextCheckup: "2024-03-15",
    dietaryNeeds: "Meat diet - 15kg daily",
    caretaker: "John Smith",
    imageUrl: "/placeholder.svg"
  },
  {
    name: "Ella",
    species: "African Elephant",
    location: "Elephant Sanctuary - Main Area",
    status: "Healthy",
    lastCheckup: "2024-01-10",
    nextCheckup: "2024-04-10",
    dietaryNeeds: "Hay, fruits, vegetables - 150kg daily",
    caretaker: "Sarah Johnson",
    imageUrl: "/placeholder.svg"
  },
  {
    name: "Bruno",
    species: "American Black Bear",
    location: "Bear Habitat - North Wing",
    status: "Under observation",
    lastCheckup: "2024-01-20",
    nextCheckup: "2024-02-20",
    dietaryNeeds: "Omnivore diet - fish, berries, honey",
    caretaker: "Mike Wilson",
    imageUrl: "/placeholder.svg"
  },
  {
    name: "Flipper",
    species: "Bottlenose Dolphin",
    location: "Marine Center - Pool 1",
    status: "Healthy",
    lastCheckup: "2024-01-12",
    nextCheckup: "2024-03-12",
    dietaryNeeds: "Fish diet - 15kg daily",
    caretaker: "Lisa Chang",
    imageUrl: "/placeholder.svg"
  },
  {
    name: "Ruby",
    species: "Red Panda",
    location: "Asian Forest - Section B",
    status: "Scheduled for checkup",
    lastCheckup: "2023-12-15",
    nextCheckup: "2024-02-15",
    dietaryNeeds: "Bamboo, fruits, small insects",
    caretaker: "David Park",
    imageUrl: "/placeholder.svg"
  },
  {
    name: "Raja",
    species: "Bengal Tiger",
    location: "Tiger Territory - Main Enclosure",
    status: "Treatment required",
    lastCheckup: "2024-01-18",
    nextCheckup: "2024-02-10",
    dietaryNeeds: "Meat diet - 12kg daily",
    medicalHistory: ["Dental treatment 2023", "Vaccination 2024"],
    caretaker: "Emily Rodriguez",
    imageUrl: "/placeholder.svg"
  },
  {
    name: "Charlie",
    species: "Chimpanzee",
    location: "Primate House - Enclosure 1",
    status: "Healthy",
    lastCheckup: "2024-01-14",
    nextCheckup: "2024-03-14",
    dietaryNeeds: "Fruits, vegetables, occasional nuts",
    caretaker: "Tom Anderson",
    imageUrl: "/placeholder.svg"
  },
  {
    name: "Dash",
    species: "Cheetah",
    location: "Cheetah Run - Track Area",
    status: "Healthy",
    lastCheckup: "2024-01-16",
    nextCheckup: "2024-03-16",
    dietaryNeeds: "Lean meat diet - 8kg daily",
    caretaker: "Jessica Lee",
    imageUrl: "/placeholder.svg"
  }
];

// Sample Events Data
const events: Partial<AdminEvent>[] = [
  {
    title: "Lion Feeding Experience",
    date: "2024-01-25",
    time: "10:00",
    location: "Lion's Den - Section A",
    description: "Watch our lions enjoy their morning meal and learn about their dietary habits.",
    duration: "45 minutes",
    host: "John Smith",
    status: "Scheduled",
    attendees: 18
  },
  {
    title: "Dolphin Training Session",
    date: "2024-01-26",
    time: "14:00",
    location: "Marine Center - Main Theater",
    description: "Observe our dolphin training session and learn about marine mammal intelligence.",
    duration: "60 minutes",
    host: "Lisa Chang",
    status: "Scheduled",
    attendees: 67
  },
  {
    title: "Behind the Scenes: Elephant Care",
    date: "2024-01-27",
    time: "09:00",
    location: "Elephant Sanctuary - Care Facility",
    description: "Get an exclusive look at how we care for our elephants including feeding and health checks.",
    duration: "90 minutes",
    host: "Sarah Johnson",
    status: "Scheduled",
    attendees: 12
  },
  {
    title: "Nighttime Zoo Adventure",
    date: "2024-02-01",
    time: "19:00",
    location: "Zoo Main Entrance",
    description: "Experience the zoo after dark and see how nocturnal animals behave.",
    duration: "120 minutes",
    host: "Mike Wilson",
    status: "Scheduled",
    attendees: 8
  },
  {
    title: "Conservation Workshop",
    date: "2024-01-30",
    time: "11:00",
    location: "Education Center - Room A",
    description: "Learn about wildlife conservation efforts and how you can help protect endangered species.",
    duration: "75 minutes",
    host: "Emily Rodriguez",
    status: "Scheduled",
    attendees: 22
  }
];

// Sample Notifications Data
const notifications: Partial<AdminNotification>[] = [
  {
    title: "System Maintenance Notice",
    status: "Sent",
    recipients: "All Staff",
    date: "2024-01-20",
    message: "Scheduled system maintenance will occur tonight from 11 PM to 1 AM.",
    priority: "High",
    sender: "IT Department"
  },
  {
    title: "New Safety Protocol",
    status: "Draft",
    recipients: "Animal Care Staff",
    date: "2024-01-22",
    message: "Please review the updated safety protocols for handling large carnivores.",
    priority: "High",
    sender: "Safety Department"
  },
  {
    title: "Upcoming Event Reminder",
    status: "Scheduled",
    recipients: "All Visitors",
    date: "2024-01-24",
    message: "Don't forget about the special lion feeding event tomorrow at 10 AM!",
    priority: "Medium",
    sender: "Events Team",
    scheduledTime: "2024-01-24T08:00:00Z"
  }
];

// Seed function
export async function seedFirebase() {
  try {
    console.log('Seeding Firebase with animals, events, and notifications...');
    
    // Seed animals
    const animalsRef = collection(db, 'animals');
    for (const animal of animals) {
      await addDoc(animalsRef, {
        ...animal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log(`✅ Added ${animals.length} animals to Firestore`);

    // Seed events
    const eventsRef = collection(db, 'events');
    for (const event of events) {
      await addDoc(eventsRef, {
        ...event,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log(`✅ Added ${events.length} events to Firestore`);

    // Seed notifications
    const notificationsRef = collection(db, 'notifications');
    for (const notification of notifications) {
      await addDoc(notificationsRef, {
        ...notification,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    console.log(`✅ Added ${notifications.length} notifications to Firestore`);

    console.log('🎉 Firebase seeding completed successfully!');
  } catch (error) {
    console.error('❌ Firebase seeding failed:', error);
    throw error;
  }
}

// Function to clear all data (for development)
export async function clearFirebaseData() {
  try {
    console.log('🗑️ Clearing Firebase data...');

    // Note: In a real app, you'd implement proper bulk delete
    // For now, this is just a placeholder
    console.log('⚠️ Clear function not implemented yet - use Firebase Console for bulk operations');
    
    return {
      success: true,
      message: 'Use Firebase Console to clear data'
    };

  } catch (error) {
    console.error('❌ Error clearing Firebase data:', error);
    throw new Error('Failed to clear Firebase database');
  }
}
