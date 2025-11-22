import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Car, Fuel, Users, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"

interface VehicleDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .eq("status", "available")
    .single()

  if (error || !vehicle) {
    notFound()
  }

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

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* ナビゲーション */}
        <div className="flex items-center gap-4">
          <Link href="/vehicles">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              車両一覧に戻る
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 車両画像 */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video relative bg-muted">
                <Image
                  src={vehicle.image_url || "/placeholder.svg?height=400&width=600&query=car"}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* 車両詳細 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {vehicle.year}年 • {vehicle.color}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {getVehicleTypeLabel(vehicle.vehicle_type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 基本情報 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{vehicle.seats}人乗り</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{getFuelTypeLabel(vehicle.fuel_type)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{getTransmissionLabel(vehicle.transmission)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{vehicle.license_plate}</span>
                    </div>
                  </div>

                  {/* 主要装備チェック */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">カーナビ</span>
                      {vehicle.features && (vehicle.features.includes('Navigation') || vehicle.features.includes('Navi') || vehicle.features.includes('GPS')) ? (
                        <Badge variant="default" className="bg-green-600">あり</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">なし</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">ETC</span>
                      {vehicle.features && vehicle.features.includes('ETC') ? (
                        <Badge variant="default" className="bg-green-600">あり</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">なし</Badge>
                      )}
                    </div>
                  </div>

                  {/* 説明 */}
                  {vehicle.description && (
                    <div>
                      <h4 className="font-semibold mb-2">車両について</h4>
                      <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                    </div>
                  )}

                  {/* 特徴 */}
                  {vehicle.features && vehicle.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">装備・特徴</h4>
                      <div className="flex flex-wrap gap-2">
                        {vehicle.features.map((feature: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 料金・予約 */}
            <Card>
              <CardHeader>
                <CardTitle>料金・予約</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">¥{vehicle.daily_rate.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">日額</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-primary/5">
                      <div className="text-2xl font-bold text-primary">¥{vehicle.monthly_rate.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">月額（おすすめ）</div>
                    </div>
                  </div>
                  <Link href={`/vehicles/${vehicle.id}/book`}>
                    <Button className="w-full" size="lg">
                      この車両を予約する
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
