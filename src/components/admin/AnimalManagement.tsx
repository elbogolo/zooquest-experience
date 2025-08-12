import React, { useState, useEffect, useRef } from "react";
import { Edit, Trash2, Image, FileText, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { adminService } from "@/services/adminService";
import { AdminAnimal } from "@/types/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnimalManagementProps {
  searchQuery: string;
  filterStatus: string;
}

const AnimalManagement = ({ searchQuery, filterStatus }: AnimalManagementProps) => {
  // Helper function to format location for display
  const formatLocationForDisplay = (location: string | { lat: number; lng: number } | undefined | null): string => {
    if (!location) return 'Unknown';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
      return `${location.lat}, ${location.lng}`;
    }
    return 'Unknown';
  };

  const [animals, setAnimals] = useState<AdminAnimal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AdminAnimal | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newAnimal, setNewAnimal] = useState<Partial<AdminAnimal>>({
    name: "",
    species: "",
    location: "Main Enclosure",
    status: "Healthy",
    lastCheckup: new Date().toLocaleDateString()
  });
  const [healthReportDialogOpen, setHealthReportDialogOpen] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [healthReport, setHealthReport] = useState({
    animalId: "",
    veterinarian: "",
    findings: "",
    recommendations: "",
    followUpDate: ""
  });

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      const data = await adminService.getItems("animals") as AdminAnimal[];
      setAnimals(data);
    } catch (error) {
      toast.error("Failed to load animals");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAnimals = () => {
    return animals.filter(animal => {
      const matchesSearch = animal.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || animal.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  };

  const handleAddAnimal = async () => {
    if (!newAnimal.name) {
      toast.error("Animal name is required");
      return;
    }

    setLoading(true);
    try {
      const createdAnimal = await adminService.createItem("animals", newAnimal) as AdminAnimal;
      setAnimals([...animals, createdAnimal]);
      setNewAnimal({
        name: "",
        species: "",
        location: "Main Enclosure",
        status: "Healthy",
        lastCheckup: new Date().toLocaleDateString()
      });
      toast.success(`${createdAnimal.name} added successfully`);
    } catch (error) {
      toast.error("Failed to add animal");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [editAnimalModalOpen, setEditAnimalModalOpen] = useState(false);
  const [animalToEdit, setAnimalToEdit] = useState<AdminAnimal | null>(null);
  const [editedAnimal, setEditedAnimal] = useState<Partial<AdminAnimal>>({});

  const handleEditAnimal = (animal: AdminAnimal) => {
    // Set the animal to edit and open modal
    setAnimalToEdit(animal);
    setEditedAnimal({
      name: animal.name,
      species: animal.species || '',
      location: animal.location,
      status: animal.status,
      dietaryNeeds: animal.dietaryNeeds || '',
      caretaker: animal.caretaker || '',
      nextCheckup: animal.nextCheckup || '',
      medicalHistory: animal.medicalHistory || []
    });
    setEditAnimalModalOpen(true);
  };

  const handleSaveEditedAnimal = async () => {
    if (!animalToEdit) return;
    if (!editedAnimal.name) {
      toast.error("Animal name is required");
      return;
    }

    setLoading(true);
    try {
      const updatedAnimal = await adminService.updateItem(
        "animals", 
        animalToEdit.id, 
        editedAnimal
      ) as AdminAnimal;
      
      setAnimals(animals.map(a => a.id === animalToEdit.id ? updatedAnimal : a));
      toast.success(`${updatedAnimal.name} updated successfully`);
      setEditAnimalModalOpen(false);
    } catch (error) {
      toast.error("Failed to update animal");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnimal = async (id: string) => {
    if (confirm("Are you sure you want to delete this animal?")) {
      setLoading(true);
      try {
        await adminService.deleteItem("animals", id);
        setAnimals(animals.filter(a => a.id !== id));
        toast.success("Animal deleted successfully");
      } catch (error) {
        toast.error("Failed to delete animal");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUploadImage = (id: string) => {
    setSelectedAnimal(animals.find(a => a.id === id) || null);
    // Trigger file input click
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 100);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAnimal || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setLoading(true);
    
    try {
      const result = await adminService.uploadAnimalImage(selectedAnimal.id, file);
      
      // Update the animal with the new image URL
      const updatedAnimal = await adminService.updateItem(
        "animals",
        selectedAnimal.id,
        { imageUrl: result.imageUrl }
      ) as AdminAnimal;
      
      setAnimals(animals.map(a => a.id === selectedAnimal.id ? updatedAnimal : a));
      toast.success(`Image for ${selectedAnimal.name} uploaded successfully`);
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setLoading(false);
      setSelectedAnimal(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openHealthReportDialog = (animalId: string) => {
    setSelectedAnimalId(animalId);
    const animal = animals.find(a => a.id === animalId);
    
    setHealthReport({
      animalId,
      veterinarian: "",
      findings: "",
      recommendations: "",
      followUpDate: ""
    });
    setHealthReportDialogOpen(true);
  };

  const handleSubmitHealthReport = async () => {
    if (!healthReport.veterinarian || !healthReport.findings) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await adminService.createHealthReport({
        ...healthReport,
        date: new Date().toISOString()
      });
      
      // Update the animal's last checkup
      const updatedAnimals = await adminService.getItems("animals") as AdminAnimal[];
      setAnimals(updatedAnimals);
      
      setHealthReportDialogOpen(false);
      toast.success("Health report submitted successfully");
    } catch (error) {
      toast.error("Failed to submit health report");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Animal Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-medium text-foreground">Animal Directory</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs px-3">
              <Plus className="w-3 h-3 mr-1" />
              Add Animal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm">Add New Animal</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs">Name</Label>
                  <Input
                    id="name"
                    value={newAnimal.name}
                    onChange={(e) => setNewAnimal({ ...newAnimal, name: e.target.value })}
                    placeholder="Animal name"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="species" className="text-xs">Species</Label>
                  <Input
                    id="species"
                    value={newAnimal.species}
                    onChange={(e) => setNewAnimal({ ...newAnimal, species: e.target.value })}
                    placeholder="Animal species"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="location" className="text-xs">Location</Label>
                  <Input
                    id="location"
                    value={formatLocationForDisplay(newAnimal.location)}
                    onChange={(e) => setNewAnimal({ ...newAnimal, location: e.target.value })}
                    placeholder="Enclosure/Location"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="status" className="text-xs">Health Status</Label>
                  <select
                    className="w-full h-8 text-xs border rounded-md px-2 bg-background"
                    value={newAnimal.status}
                    onChange={(e) => setNewAnimal({ ...newAnimal, status: e.target.value as AdminAnimal['status'] })}
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Under observation">Under observation</option>
                    <option value="Treatment required">Treatment required</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="dietaryNeeds" className="text-xs">Dietary Needs</Label>
                <textarea
                  id="dietaryNeeds"
                  value={newAnimal.dietaryNeeds || ""}
                  onChange={(e) => setNewAnimal({ ...newAnimal, dietaryNeeds: e.target.value })}
                  placeholder="Dietary requirements..."
                  className="w-full h-16 text-xs border rounded-md px-2 py-1 bg-background resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleAddAnimal} 
                  disabled={loading}
                  className="flex-1 h-8 text-xs"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Animal'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Animals Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs h-8 w-12">Image</TableHead>
              <TableHead className="text-xs h-8">Name</TableHead>
              <TableHead className="text-xs h-8 hidden sm:table-cell">Species</TableHead>
              <TableHead className="text-xs h-8 hidden md:table-cell">Location</TableHead>
              <TableHead className="text-xs h-8">Status</TableHead>
              <TableHead className="text-xs h-8 w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-xs">Loading animals...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : getFilteredAnimals().length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <p className="text-xs text-muted-foreground">No animals found</p>
                </TableCell>
              </TableRow>
            ) : (
              getFilteredAnimals().map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell className="p-2">
                    <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      {animal.imageUrl ? (
                        <img 
                          src={animal.imageUrl} 
                          alt={animal.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className="text-xs text-muted-foreground">🦁</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div>
                      <p className="text-xs font-medium">{animal.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{animal.species}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs py-2 hidden sm:table-cell">{animal.species}</TableCell>
                  <TableCell className="text-xs py-2 hidden md:table-cell">
                    {formatLocationForDisplay(animal.location)}
                  </TableCell>
                  <TableCell className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      animal.status === "Healthy" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : animal.status === "Under observation"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {animal.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleUploadImage(animal.id)}
                        title="Upload image"
                      >
                        <Image className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEditAnimal(animal)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteAnimal(animal.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Hidden file input for image upload */}
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {/* Edit Animal Modal */}
      <Dialog open={editAnimalModalOpen} onOpenChange={setEditAnimalModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Animal: {animalToEdit?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            {/* Basic Information Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-foreground border-b pb-1">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-animal-name" className="text-xs">Name</Label>
                  <Input
                    id="edit-animal-name"
                    value={editedAnimal.name || ''}
                    onChange={(e) => setEditedAnimal({...editedAnimal, name: e.target.value})}
                    placeholder="Animal name"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-animal-species" className="text-xs">Species</Label>
                  <Input
                    id="edit-animal-species"
                    value={editedAnimal.species || ''}
                    onChange={(e) => setEditedAnimal({...editedAnimal, species: e.target.value})}
                    placeholder="Species"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-animal-location" className="text-xs">Location</Label>
                  <Input
                    id="edit-animal-location"
                    value={formatLocationForDisplay(editedAnimal.location)}
                    onChange={(e) => setEditedAnimal({...editedAnimal, location: e.target.value})}
                    placeholder="Location"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-animal-status" className="text-xs">Health Status</Label>
                  <select
                    id="edit-animal-status"
                    className="w-full h-8 text-xs border rounded-md px-2 bg-background"
                    value={editedAnimal.status || 'Healthy'}
                    onChange={(e) => setEditedAnimal({
                      ...editedAnimal, 
                      status: e.target.value as AdminAnimal['status']
                    })}
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Under observation">Under observation</option>
                    <option value="Scheduled for checkup">Scheduled for checkup</option>
                    <option value="Treatment required">Treatment required</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Care Information Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-foreground border-b pb-1">Care Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-animal-caretaker" className="text-xs">Primary Caretaker</Label>
                  <Input
                    id="edit-animal-caretaker"
                    value={editedAnimal.caretaker || ''}
                    onChange={(e) => setEditedAnimal({...editedAnimal, caretaker: e.target.value})}
                    placeholder="Primary caretaker"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-animal-nextcheckup" className="text-xs">Next Checkup</Label>
                  <Input
                    id="edit-animal-nextcheckup"
                    type="date"
                    value={editedAnimal.nextCheckup || ''}
                    onChange={(e) => setEditedAnimal({...editedAnimal, nextCheckup: e.target.value})}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-animal-dietary" className="text-xs">Dietary Needs</Label>
                <textarea
                  id="edit-animal-dietary"
                  className="w-full rounded-md border border-input bg-background px-2 py-1 min-h-[60px] text-xs resize-none"
                  value={editedAnimal.dietaryNeeds || ''}
                  onChange={(e) => setEditedAnimal({...editedAnimal, dietaryNeeds: e.target.value})}
                  placeholder="Dietary needs and requirements"
                />
              </div>
            </div>

            {/* Image Management Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-foreground border-b pb-1">Image Management</h3>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {animalToEdit?.imageUrl ? (
                    <div className="relative w-16 h-16 bg-gray-100 rounded border">
                      <img
                        src={animalToEdit.imageUrl}
                        alt={animalToEdit.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/api/placeholder/150/150";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                      <Image className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {animalToEdit?.imageUrl ? 'Current animal image' : 'No image uploaded'}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUploadImage(animalToEdit?.id || '')}
                    className="h-6 text-xs px-2"
                  >
                    <Image className="w-3 h-3 mr-1" />
                    {animalToEdit?.imageUrl ? 'Change' : 'Upload'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => setEditAnimalModalOpen(false)}
                className="h-8 text-xs px-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEditedAnimal}
                disabled={loading}
                className="h-8 text-xs px-3"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-4 border-t border-border pt-4">
        <h3 className="font-medium mb-2 text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => {
              if (animals.length === 0) {
                toast.error("Add animals first before uploading images");
                return;
              }
              toast.info("Select an animal from the list to upload an image");
            }}
          >
            <Image className="w-4 h-4" />
            <span>Upload Images</span>
          </Button>
          <Dialog open={healthReportDialogOpen} onOpenChange={setHealthReportDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  if (animals.length === 0) {
                    toast.error("Add animals first before submitting health reports");
                    return;
                  }
                }}
              >
                <FileText className="w-4 h-4" />
                <span>Health Reports</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Health Report</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-3 mt-2">
                <div>
                  <Label htmlFor="report-animal">Animal</Label>
                  <select
                    id="report-animal"
                    className="w-full rounded-md border border-input bg-background px-3 h-10 text-foreground"
                    value={healthReport.animalId}
                    onChange={(e) => setHealthReport({...healthReport, animalId: e.target.value})}
                  >
                    <option value="">Select an animal</option>
                    {animals.map(animal => (
                      <option key={animal.id} value={animal.id}>{animal.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="report-vet">Veterinarian</Label>
                  <Input
                    id="report-vet"
                    value={healthReport.veterinarian}
                    onChange={(e) => setHealthReport({...healthReport, veterinarian: e.target.value})}
                    placeholder="Veterinarian name"
                  />
                </div>
                <div>
                  <Label htmlFor="report-findings">Findings</Label>
                  <textarea
                    id="report-findings"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[80px] text-foreground"
                    value={healthReport.findings}
                    onChange={(e) => setHealthReport({...healthReport, findings: e.target.value})}
                    placeholder="Examination findings"
                  />
                </div>
                <div>
                  <Label htmlFor="report-recommendations">Recommendations</Label>
                  <textarea
                    id="report-recommendations"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[80px] text-foreground"
                    value={healthReport.recommendations}
                    onChange={(e) => setHealthReport({...healthReport, recommendations: e.target.value})}
                    placeholder="Treatment recommendations"
                  />
                </div>
                <div>
                  <Label htmlFor="report-followup">Follow-up Date</Label>
                  <Input
                    id="report-followup"
                    type="date"
                    value={healthReport.followUpDate}
                    onChange={(e) => setHealthReport({...healthReport, followUpDate: e.target.value})}
                  />
                </div>
                <Button
                  onClick={handleSubmitHealthReport}
                  className="w-full mt-2"
                  disabled={loading}
                >
                  Submit Health Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Display alert if no animals */}
      {animals.length === 0 && !loading && (
        <Alert className="mt-4">
          <AlertDescription>
            No animals added yet. Use the form above to add your first animal.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AnimalManagement;
