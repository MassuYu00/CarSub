import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Edit } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { DeleteVehicleButton } from "@/components/delete-vehicle-button"

export default async function AdminVehiclesPage() {
  const supabase = await createClient()

  // 管理者認証確認
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // 車両一覧を取得
  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching vehicles:", error)
  }

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      available: "default",
      rented: "secondary",
      maintenance: "destructive",
    }
    return variants[status] || "outline"
  }

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      available: "利用可能",
      rented: "レンタル中",
      maintenance: "メンテナンス中",
    }
    return statuses[status] || status
  }

  const getFuelTypeLabel = (fuelType: string) => {
    const types: Record<string, string> = {
      gasoline: "ガソリン",
      hybrid: "ハイブリッド",
      electric: "電気",
      diesel: "ディーゼル",
    }
    return types[fuelType] || fuelType
  }

  const getTransmissionLabel = (transmission: string) => {
    const types: Record<string, string> = {
      automatic: "AT",
      manual: "MT",
    }
    return types[transmission] || transmission
  }

  return (
    <div>
      <div className="flex flex-col gap-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">車両管理</h1>
              <p className="text-muted-foreground">車両の追加・編集・削除</p>
            </div>
          </div>
          <Link href="/admin/vehicles/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新しい車両を追加
            </Button>
          </Link>
        </div>

        {/* 車両一覧 */}
        {vehicles && vehicles.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>登録車両一覧</CardTitle>
              <CardDescription>現在 {vehicles.length} 台の車両が登録されています</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>車両情報</TableHead>
                    <TableHead>仕様</TableHead>
                    <TableHead>料金</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {vehicle.year}年 • {vehicle.color} • {vehicle.license_plate}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {vehicle.seats}人乗り • {getFuelTypeLabel(vehicle.fuel_type)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getTransmissionLabel(vehicle.transmission)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">¥{vehicle.daily_rate.toLocaleString()}/日</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(vehicle.status)}>{getStatusLabel(vehicle.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/admin/vehicles/${vehicle.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              編集
                            </Button>
                          </Link>
                          <DeleteVehicleButton
                            vehicleId={vehicle.id}
                            vehicleName={`${vehicle.make} ${vehicle.model}`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">登録されている車両がありません</p>
              <Link href="/admin/vehicles/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  最初の車両を追加
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
