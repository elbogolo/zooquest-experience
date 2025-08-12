/**
 * Firebase Database Seeding Component
 * Run this component to populate Firestore with sample data
 */

import React, { useState } from 'react';
import { seedFirebase, clearFirebaseData } from '@/utils/seedFirebase';

const FirebaseSeed: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    setIsSeeding(true);
    setMessage('');
    try {
      await seedFirebase();
      setMessage('✅ Database seeded successfully!');
    } catch (error) {
      setMessage(`❌ Seeding failed: ${error}`);
      console.error('Seeding error:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    setMessage('');
    try {
      await clearFirebaseData();
      setMessage('✅ Database cleared successfully!');
    } catch (error) {
      setMessage(`❌ Clearing failed: ${error}`);
      console.error('Clearing error:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Firebase Database Management</h2>
      
      <div className="space-y-4">
        <button
          onClick={handleSeed}
          disabled={isSeeding || isClearing}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSeeding ? 'Seeding...' : 'Seed Database'}
        </button>
        
        <button
          onClick={handleClear}
          disabled={isSeeding || isClearing}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isClearing ? 'Clearing...' : 'Clear Database'}
        </button>
      </div>
      
      {message && (
        <div className="mt-4 p-3 rounded bg-gray-100">
          <p className="text-sm">{message}</p>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>• <strong>Seed Database:</strong> Adds sample animals, events, and notifications</p>
        <p>• <strong>Clear Database:</strong> Removes all data (use carefully!)</p>
      </div>
    </div>
  );
};

export default FirebaseSeed;
