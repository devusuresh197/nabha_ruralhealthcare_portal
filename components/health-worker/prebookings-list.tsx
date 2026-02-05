"use client"

import type { PrebookingRequest } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Phone,
  MapPin,
} from "lucide-react"

interface PrebookingsListProps {
  prebookings: PrebookingRequest[]
}

export function PrebookingsList({ prebookings }: PrebookingsListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-accent text-accent-foreground gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          My Prebooking Requests
        </CardTitle>
        <CardDescription>
          Track your medicine prebooking requests and pharmacy responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {prebookings.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No prebooking requests yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Search for medicines and prebook when unavailable
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prebookings.map((prebooking) => (
              <div
                key={prebooking.id}
                className="p-4 rounded-lg border border-border"
              >
                <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">
                      {prebooking.medicineName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {prebooking.requestedQuantity} units
                    </p>
                  </div>
                  {getStatusBadge(prebooking.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Patient: {prebooking.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{prebooking.patientPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{prebooking.pharmacyName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Requested: {formatDate(prebooking.createdAt)}</span>
                  </div>
                </div>

                {prebooking.status === "confirmed" && prebooking.expectedAvailabilityDate && (
                  <div className="mt-3 p-3 bg-accent/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">
                        Expected Availability: {formatDate(prebooking.expectedAvailabilityDate)}
                      </span>
                    </div>
                  </div>
                )}

                {prebooking.status === "rejected" && (
                  <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-destructive">
                      This request was rejected by the pharmacy. Please try another pharmacy.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
