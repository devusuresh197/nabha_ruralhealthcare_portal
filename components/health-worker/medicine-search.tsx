"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { searchMedicines, createPrebooking } from "@/lib/api-client"
import type { MedicineSearchResult } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Pill,
  MapPin,
  CheckCircle2,
  Package,
  AlertCircle,
} from "lucide-react"

interface MedicineSearchProps {
  onPrebookingCreated: () => void
}

export function MedicineSearch({ onPrebookingCreated }: MedicineSearchProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<MedicineSearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineSearchResult | null>(null)
  const [showPrebookModal, setShowPrebookModal] = useState(false)
  const [prebookSuccess, setPrebookSuccess] = useState(false)

  // Prebook form state
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [requestedQuantity, setRequestedQuantity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const results = await searchMedicines(searchQuery)
      setSearchResults(results)
    } catch (_error) {
      setSearchResults([])
    }
    setHasSearched(true)
  }

  const handlePrebook = (medicine: MedicineSearchResult) => {
    setSelectedMedicine(medicine)
    setShowPrebookModal(true)
    setPrebookSuccess(false)
    setPatientName("")
    setPatientPhone("")
    setRequestedQuantity("")
  }

  const submitPrebooking = async () => {
    if (!user || !selectedMedicine) return

    setIsSubmitting(true)
    await createPrebooking({
      medicineId: selectedMedicine.medicineId,
      medicineName: selectedMedicine.medicineName,
      requestedQuantity: parseInt(requestedQuantity, 10),
      patientName,
      patientPhone,
      healthWorkerId: user.id,
      healthWorkerName: user.name,
      pharmacyId: selectedMedicine.pharmacyId,
      pharmacyName: selectedMedicine.pharmacyName,
      actorId: user.id,
    })

    setIsSubmitting(false)
    setPrebookSuccess(true)
    onPrebookingCreated()

    setTimeout(() => {
      setShowPrebookModal(false)
      setSelectedMedicine(null)
    }, 2000)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Medicine Availability Search
          </CardTitle>
          <CardDescription>
            Search for medicine availability across pharmacies in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Search medicine name (e.g., Paracetamol, Amoxicillin)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-3">
              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No medicines found matching "{searchQuery}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try searching with a different name
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Found {searchResults.length} result(s) for "{searchQuery}"
                  </p>
                  {searchResults.map((result) => (
                    <div
                      key={`${result.pharmacyId}-${result.medicineId}`}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">
                            {result.medicineName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {result.pharmacyName}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.pharmacyAddress}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        {result.available ? (
                          <>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                <span className="text-sm font-medium text-accent">
                                  Available
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {result.quantity} units in stock
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-destructive" />
                                <span className="text-sm font-medium text-destructive">
                                  Not Available
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrebook(result)}
                              className="gap-1"
                            >
                              <Package className="w-4 h-4" />
                              Prebook
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Initial State */}
          {!hasSearched && (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Enter a medicine name to search for availability
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prebook Modal */}
      <Dialog open={showPrebookModal} onOpenChange={setShowPrebookModal}>
        <DialogContent className="sm:max-w-md">
          {prebookSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Prebooking Request Sent
              </h3>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                The pharmacy will respond with availability details soon.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Prebook Medicine</DialogTitle>
                <DialogDescription>
                  Request {selectedMedicine?.medicineName} from{" "}
                  {selectedMedicine?.pharmacyName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="prebookPatientName">Patient Name *</Label>
                  <Input
                    id="prebookPatientName"
                    placeholder="Enter patient's name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prebookPatientPhone">Patient Mobile Number *</Label>
                  <Input
                    id="prebookPatientPhone"
                    placeholder="+91 XXXXX XXXXX"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prebookQuantity">Required Quantity *</Label>
                  <Input
                    id="prebookQuantity"
                    type="number"
                    placeholder="Number of units needed"
                    value={requestedQuantity}
                    onChange={(e) => setRequestedQuantity(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowPrebookModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitPrebooking}
                  disabled={
                    !patientName || !patientPhone || !requestedQuantity || isSubmitting
                  }
                >
                  {isSubmitting ? "Sending..." : "Send Prebooking Request"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
