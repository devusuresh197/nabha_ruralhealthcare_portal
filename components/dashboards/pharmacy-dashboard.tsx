"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  getMedicinesByPharmacy,
  getPrebookingsByPharmacy,
  updateMedicineStock,
  addMedicine,
  respondToPrebooking,
} from "@/lib/api-client"
import { mockPharmacies } from "@/lib/mock-data"
import type { Medicine, PrebookingRequest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pill,
  Package,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  Calendar,
  AlertCircle,
} from "lucide-react"

export function PharmacyDashboard() {
  const { user } = useAuth()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [prebookings, setPrebookings] = useState<PrebookingRequest[]>([])
  const [activeTab, setActiveTab] = useState<"inventory" | "prebookings">("inventory")
  const [showAddMedicine, setShowAddMedicine] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [respondingTo, setRespondingTo] = useState<PrebookingRequest | null>(null)

  // Form states
  const [newMedicineName, setNewMedicineName] = useState("")
  const [newMedicineQuantity, setNewMedicineQuantity] = useState("")
  const [editQuantity, setEditQuantity] = useState("")
  const [availabilityDate, setAvailabilityDate] = useState("")

  // Get the pharmacy ID for this pharmacist (using first pharmacy for demo)
  const pharmacyId = mockPharmacies[0].id

  const loadData = async () => {
    try {
      const [medicineData, prebookingData] = await Promise.all([
        getMedicinesByPharmacy(pharmacyId),
        getPrebookingsByPharmacy(pharmacyId),
      ])
      setMedicines(medicineData)
      setPrebookings(prebookingData)
    } catch (_error) {
      setMedicines([])
      setPrebookings([])
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const pendingPrebookings = prebookings.filter((p) => p.status === "pending")
  const availableMedicines = medicines.filter((m) => m.quantity > 0)
  const outOfStockMedicines = medicines.filter((m) => m.quantity === 0)

  const handleAddMedicine = async () => {
    if (!newMedicineName || !newMedicineQuantity) return

    await addMedicine(newMedicineName, parseInt(newMedicineQuantity, 10), pharmacyId)
    setNewMedicineName("")
    setNewMedicineQuantity("")
    setShowAddMedicine(false)
    void loadData()
  }

  const handleUpdateStock = async () => {
    if (!editingMedicine || !editQuantity) return

    await updateMedicineStock(editingMedicine.id, parseInt(editQuantity, 10))
    setEditingMedicine(null)
    setEditQuantity("")
    void loadData()
  }

  const handleRespond = async (status: "confirmed" | "rejected") => {
    if (!respondingTo) return

    await respondToPrebooking(respondingTo.id, {
      status,
      expectedAvailabilityDate: status === "confirmed" ? availabilityDate : undefined,
    })
    setRespondingTo(null)
    setAvailabilityDate("")
    void loadData()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          Pharmacy Dashboard - {mockPharmacies[0].name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Pill className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {medicines.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Medicines</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {availableMedicines.length}
                </p>
                <p className="text-sm text-muted-foreground">In Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {outOfStockMedicines.length}
                </p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-chart-4/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {pendingPrebookings.length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-3">
        <Button
          variant={activeTab === "inventory" ? "default" : "outline"}
          onClick={() => setActiveTab("inventory")}
          className="gap-2"
        >
          <Pill className="w-4 h-4" />
          Medicine Inventory
        </Button>
        <Button
          variant={activeTab === "prebookings" ? "default" : "outline"}
          onClick={() => setActiveTab("prebookings")}
          className="gap-2"
        >
          <Package className="w-4 h-4" />
          Prebooking Requests
          {pendingPrebookings.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {pendingPrebookings.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Medicine Inventory
                </CardTitle>
                <CardDescription>
                  Manage your medicine stock and availability
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddMedicine(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Medicine
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {medicines.length === 0 ? (
              <div className="text-center py-8">
                <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No medicines in inventory</p>
                <Button
                  variant="link"
                  onClick={() => setShowAddMedicine(true)}
                  className="mt-2"
                >
                  Add your first medicine
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {medicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {medicine.name}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Last updated: {formatDate(medicine.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              medicine.quantity > 0 ? "bg-accent" : "bg-destructive"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              medicine.quantity > 0 ? "text-accent" : "text-destructive"
                            }`}
                          >
                            {medicine.quantity > 0 ? "Available" : "Out of Stock"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {medicine.quantity} units
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingMedicine(medicine)
                          setEditQuantity(medicine.quantity.toString())
                        }}
                      >
                        Update Stock
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Prebookings Tab */}
      {activeTab === "prebookings" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Prebooking Requests from Health Workers
            </CardTitle>
            <CardDescription>
              Review and respond to medicine prebooking requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prebookings.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No prebooking requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prebookings.map((prebooking) => (
                  <div
                    key={prebooking.id}
                    className={`p-4 rounded-lg border ${
                      prebooking.status === "pending"
                        ? "border-chart-4/30 bg-chart-4/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">
                          {prebooking.medicineName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Requested Quantity: {prebooking.requestedQuantity} units
                        </p>
                      </div>
                      {prebooking.status === "pending" ? (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </Badge>
                      ) : prebooking.status === "confirmed" ? (
                        <Badge className="bg-accent text-accent-foreground gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Patient: {prebooking.patientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{prebooking.patientPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Health Worker: {prebooking.healthWorkerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Requested: {formatDate(prebooking.createdAt)}</span>
                      </div>
                    </div>

                    {prebooking.status === "confirmed" && prebooking.expectedAvailabilityDate && (
                      <div className="p-2 bg-accent/10 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span className="text-foreground">
                            Expected Availability: {formatDate(prebooking.expectedAvailabilityDate)}
                          </span>
                        </div>
                      </div>
                    )}

                    {prebooking.status === "pending" && (
                      <div className="flex justify-end mt-3">
                        <Button
                          size="sm"
                          onClick={() => setRespondingTo(prebooking)}
                        >
                          Respond
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Medicine Dialog */}
      <Dialog open={showAddMedicine} onOpenChange={setShowAddMedicine}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
            <DialogDescription>
              Add a new medicine to your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="medicineName">Medicine Name</Label>
              <Input
                id="medicineName"
                placeholder="e.g., Paracetamol 500mg"
                value={newMedicineName}
                onChange={(e) => setNewMedicineName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicineQuantity">Initial Quantity</Label>
              <Input
                id="medicineQuantity"
                type="number"
                placeholder="Number of units"
                value={newMedicineQuantity}
                onChange={(e) => setNewMedicineQuantity(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMedicine(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMedicine}
              disabled={!newMedicineName || !newMedicineQuantity}
            >
              Add Medicine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Stock Dialog */}
      <Dialog open={!!editingMedicine} onOpenChange={() => setEditingMedicine(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Update quantity for {editingMedicine?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editQuantity">New Quantity</Label>
              <Input
                id="editQuantity"
                type="number"
                placeholder="Enter new quantity"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMedicine(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock} disabled={!editQuantity}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Respond to Prebooking Dialog */}
      <Dialog open={!!respondingTo} onOpenChange={() => setRespondingTo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Prebooking</DialogTitle>
            <DialogDescription>
              {respondingTo?.medicineName} - {respondingTo?.requestedQuantity} units
              requested by {respondingTo?.healthWorkerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-secondary rounded-lg text-sm">
              <p>
                <strong>Patient:</strong> {respondingTo?.patientName}
              </p>
              <p>
                <strong>Phone:</strong> {respondingTo?.patientPhone}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availabilityDate">
                Expected Availability Date (if confirming)
              </Label>
              <Input
                id="availabilityDate"
                type="date"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={() => handleRespond("rejected")}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
            <Button
              onClick={() => handleRespond("confirmed")}
              disabled={!availabilityDate}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
