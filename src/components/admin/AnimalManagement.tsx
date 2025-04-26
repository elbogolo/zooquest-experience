
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
import { adminService, AdminAnimal } from "@/services/adminService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnimalManagementProps {
  searchQuery: string;
  filterStatus: string;
}

const AnimalManagement = ({ searchQuery, filterStatus }: AnimalManagementProps) => {
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
      const data = await adminService.getItems<AdminAnimal>("animals");
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
      const createdAnimal = await adminService.createItem<AdminAnimal>("animals", newAnimal);
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

  const handleEditAnimal = async (id: string) => {
    const animal = animals.find(a => a.id === id);
    if (!animal) return;

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
      const updatedAnimal = await adminService.updateItem<AdminAnimal>(
        "animals", 
        animalToEdit.id, 
        editedAnimal
      );
      
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
      const imageUrl = await adminService.uploadImage(file, "animals", selectedAnimal.id);
      
      // Update the animal with the new image URL
      const updatedAnimal = await adminService.updateItem<AdminAnimal>(
        "animals",
        selectedAnimal.id,
        { imageUrl }
      );
      
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
      const updatedAnimals = await adminService.getItems<AdminAnimal>("animals");
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
    <div className="bg-card dark:bg-card border border-border rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
        <FileText className="h-5 w-5 text-primary" />
        Animals Management
      </h2>
      
      <div className="mb-4 border border-border rounded-lg p-3 bg-muted/30 dark:bg-muted/10">
        <h3 className="text-md font-medium mb-2 text-foreground">Add New Animal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="animal-name">Name</Label>
            <Input
              id="animal-name"
              value={newAnimal.name}
              onChange={(e) => setNewAnimal({...newAnimal, name: e.target.value})}
              placeholder="Animal name"
            />
          </div>
          <div>
            <Label htmlFor="animal-species">Species</Label>
            <Input
              id="animal-species"
              value={newAnimal.species || ""}
              onChange={(e) => setNewAnimal({...newAnimal, species: e.target.value})}
              placeholder="Species"
            />
          </div>
          <div>
            <Label htmlFor="animal-location">Location</Label>
            <Input
              id="animal-location"
              value={newAnimal.location}
              onChange={(e) => setNewAnimal({...newAnimal, location: e.target.value})}
              placeholder="Location"
            />
          </div>
          <div>
            <Label htmlFor="animal-status">Status</Label>
            <select
              id="animal-status"
              className="w-full rounded-md border border-input bg-background px-3 h-10 text-foreground"
              value={newAnimal.status}
              onChange={(e) => setNewAnimal({
                ...newAnimal, 
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
        <Button 
          onClick={handleAddAnimal} 
          className="mt-3"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Animal
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table className="border-collapse w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Checkup</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading animals data...</p>
                </TableCell>
              </TableRow>
            ) : getFilteredAnimals().length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">No animals found matching your criteria</p>
                </TableCell>
              </TableRow>
            ) : (
              getFilteredAnimals().map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {animal.imageUrl && (
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img 
                            src={animal.imageUrl} 
                            alt={animal.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {animal.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{animal.location}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      animal.status === "Healthy" 
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" 
                        : animal.status === "Under observation"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                    }`}>
                      {animal.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground">{animal.lastCheckup}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openHealthReportDialog(animal.id)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Health Report</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleUploadImage(animal.id)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Image className="h-4 w-4" />
                        <span className="sr-only">Upload Image</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditAnimal(animal.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteAnimal(animal.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Animal: {animalToEdit?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 mt-2">
            <div>
              <Label htmlFor="edit-animal-name">Name</Label>
              <Input
                id="edit-animal-name"
                value={editedAnimal.name || ''}
                onChange={(e) => setEditedAnimal({...editedAnimal, name: e.target.value})}
                placeholder="Animal name"
              />
            </div>
            <div>
              <Label htmlFor="edit-animal-species">Species</Label>
              <Input
                id="edit-animal-species"
                value={editedAnimal.species || ''}
                onChange={(e) => setEditedAnimal({...editedAnimal, species: e.target.value})}
                placeholder="Species"
              />
            </div>
            <div>
              <Label htmlFor="edit-animal-location">Location</Label>
              <Input
                id="edit-animal-location"
                value={editedAnimal.location || ''}
                onChange={(e) => setEditedAnimal({...editedAnimal, location: e.target.value})}
                placeholder="Location"
              />
            </div>
            <div>
              <Label htmlFor="edit-animal-status">Status</Label>
              <select
                id="edit-animal-status"
                className="w-full rounded-md border border-input bg-background px-3 h-10 text-foreground"
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
            <div>
              <Label htmlFor="edit-animal-dietary">Dietary Needs</Label>
              <textarea
                id="edit-animal-dietary"
                className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[60px] text-foreground"
                value={editedAnimal.dietaryNeeds || ''}
                onChange={(e) => setEditedAnimal({...editedAnimal, dietaryNeeds: e.target.value})}
                placeholder="Dietary needs and requirements"
              />
            </div>
            <div>
              <Label htmlFor="edit-animal-caretaker">Primary Caretaker</Label>
              <Input
                id="edit-animal-caretaker"
                value={editedAnimal.caretaker || ''}
                onChange={(e) => setEditedAnimal({...editedAnimal, caretaker: e.target.value})}
                placeholder="Primary caretaker"
              />
            </div>
            <div>
              <Label htmlFor="edit-animal-nextcheckup">Next Checkup</Label>
              <Input
                id="edit-animal-nextcheckup"
                type="date"
                value={editedAnimal.nextCheckup || ''}
                onChange={(e) => setEditedAnimal({...editedAnimal, nextCheckup: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="outline"
                onClick={() => setEditAnimalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEditedAnimal}
                disabled={loading}
              >
                Save Changes
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
