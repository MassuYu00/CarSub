import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  color: string
  license_plate: string
  vehicle_type: string
  fuel_type: string
  transmission: string
  seats: number
  daily_rate: number
  monthly_rate: number
  status: string
  image_url: string | null
  description: string | null
  features: string[] | null
}

interface VehicleCardProps {
  vehicle: Vehicle
  dateRange?: {
    from: Date
    to: Date
  }
}

export function VehicleCard({ vehicle, dateRange }: VehicleCardProps) {
  const getVehicleTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      compact: "コンパクト",
      sedan: "セダン",
      suv: "SUV",
      truck: "トラック",
    }
    return types[type] || type
  }

  const getFuelTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      gasoline: "ガソリン",
      hybrid: "ハイブリッド",
      electric: "電気",
    }
    return types[type] || type
  }

  const getTransmissionLabel = (type: string) => {
    const types: Record<string, string> = {
      manual: "マニュアル",
      automatic: "オートマ",
    }
    return types[type] || type
  }

  const bookingUrl = dateRange
    ? `/vehicles/${vehicle.id}/book?startDate=${format(dateRange.from, "yyyy-MM-dd")}&endDate=${format(dateRange.to, "yyyy-MM-dd")}`
    : `/vehicles/${vehicle.id}/book`

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative bg-muted">
        <Image
          src={vehicle.image_url || "/placeholder.svg?height=200&width=300&query=car"}
          alt={`${vehicle.make} ${vehicle.model}`}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {vehicle.make} {vehicle.model}
            </CardTitle>
            <CardDescription>
              {vehicle.year}年 • {vehicle.color} • {vehicle.seats}人乗り
            </CardDescription>
          </div>
          <Badge variant="secondary">{getVehicleTypeLabel(vehicle.vehicle_type)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 車両詳細 */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{getFuelTypeLabel(vehicle.fuel_type)}</Badge>
            <Badge variant="outline">{getTransmissionLabel(vehicle.transmission)}</Badge>
          </div>

          {/* 特徴 */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {vehicle.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {vehicle.features.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{vehicle.features.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* 料金 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">日額</span>
              <span className="font-semibold">¥{vehicle.daily_rate.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">月額</span>
              <span className="font-semibold text-primary">¥{vehicle.monthly_rate.toLocaleString()}</span>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2">
            <Link href={`/vehicles/${vehicle.id}`} className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                詳細を見る
              </Button>
            </Link>
            <Link href={bookingUrl} className="flex-1">
              <Button className="w-full">予約する</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

