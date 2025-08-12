import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Database, Trash2, AlertTriangle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { collection, addDoc, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';

const SeedPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [seedResults, setSeedResults] = useState<{
    success: boolean;
    message: string;
    details?: Record<string, unknown>;
  } | null>(null);

  // Sample data to seed the database
  const sampleAnimals = [
    {
      name: "African Elephant",
      species: "Loxodonta africana",
      habitat: "Savanna",
      diet: "Herbivore",
      status: "Near Threatened",
      description: "The largest living terrestrial animal, known for their intelligence and strong social bonds.",
      imageUrl: "https://images.unsplash.com/photo-1564760055365-55747b74aafd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      facts: ["Can weigh up to 6 tons", "Live in matriarchal herds", "Excellent memory"],
      location: { lat: 5.603717, lng: -0.186964 }
    },
    {
      name: "West African Lion",
      species: "Panthera leo",
      habitat: "Grassland",
      diet: "Carnivore", 
      status: "Critically Endangered",
      description: "Majestic predators known as the 'King of the Jungle', though they primarily live in grasslands.",
      imageUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      facts: ["Live in prides", "Males have distinctive manes", "Can run up to 50 mph"],
      location: { lat: 5.604200, lng: -0.186500 }
    },
    {
      name: "Zebra",
      species: "Equus quagga",
      habitat: "Savanna",
      diet: "Herbivore",
      status: "Near Threatened", 
      description: "Distinctive black and white striped animals that are closely related to horses.",
      imageUrl: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      facts: ["Each zebra has unique stripes", "Live in herds", "Stripes may help deter insects"],
      location: { lat: 5.604500, lng: -0.187200 }
    }
  ];

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedResults(null);
    
    try {
      const animalsCollection = collection(db, 'animals');
      let addedCount = 0;
      
      // Add each sample animal to Firestore
      for (const animal of sampleAnimals) {
        await addDoc(animalsCollection, {
          ...animal,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        addedCount++;
      }
      
      const result = {
        success: true,
        message: `Successfully seeded database with ${addedCount} animals!`,
        details: {
          animalsAdded: addedCount,
          animals: sampleAnimals.map(a => a.name)
        }
      };
      
      setSeedResults(result);
      toast.success(result.message);
      
    } catch (error) {
      console.error('Seed error:', error);
      const result = {
        success: false,
        message: 'Failed to seed database',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      setSeedResults(result);
      toast.error(result.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('⚠️ This will permanently delete ALL data from the database. Are you sure you want to continue?')) {
      return;
    }
    
    setIsClearing(true);
    setSeedResults(null);
    
    try {
      const collections = ['animals', 'events', 'visits', 'favorites'];
      let deletedCount = 0;
      
      // Clear each collection
      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.docs.forEach((docSnapshot) => {
            batch.delete(doc(db, collectionName, docSnapshot.id));
          });
          await batch.commit();
          deletedCount += snapshot.docs.length;
        }
      }
      
      const result = {
        success: true,
        message: `Successfully cleared database! Deleted ${deletedCount} documents.`,
        details: {
          documentsDeleted: deletedCount,
          collectionsCleared: collections
        }
      };
      
      setSeedResults(result);
      toast.success(result.message);
      
    } catch (error) {
      console.error('Clear error:', error);
      const result = {
        success: false,
        message: 'Failed to clear database',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      setSeedResults(result);
      toast.error(result.message);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zoo-primary to-zoo-secondary p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/admin" 
            className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Database Seeding</h1>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Management</h2>
          <p className="text-gray-600 mb-6">
            Use these tools to manage your database content. Seeding will populate the database with sample data, 
            while clearing will remove all existing data.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="w-full bg-zoo-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-zoo-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                "Seed Database"
              )}
            </button>

            <button
              onClick={handleClearDatabase}
              disabled={isClearing}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isClearing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Clearing Database...
                </>
              ) : (
                "Clear Database"
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {seedResults && (
          <div className={`bg-white rounded-lg shadow-lg p-6 ${
            seedResults.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          }`}>
            <div className="flex items-start gap-3">
              {seedResults.success ? (
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${
                  seedResults.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {seedResults.success ? 'Success' : 'Error'}
                </h3>
                <p className="text-gray-700 mb-4">{seedResults.message}</p>
                
                {seedResults.details && (
                  <details className="bg-gray-50 rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                      View Details
                    </summary>
                    <pre className="text-sm text-gray-600 overflow-auto">
                      {JSON.stringify(seedResults.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="font-semibold mb-3">Instructions</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Seed Database:</strong> Populates the database with sample animals, events, and other data for testing.</p>
            <p><strong>Clear Database:</strong> Removes all data from the database (use with caution).</p>
            <p><strong>Note:</strong> Make sure your Firebase Firestore is properly configured before using these tools.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedPage;
