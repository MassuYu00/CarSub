import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { VehicleCard } from "@/components/vehicle-card"
import { VehicleFilters } from "@/components/vehicle-filters"
import Link from "next/link"
import { addDays, format, parseISO } from "date-fns"

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
  images: string[] | null
  description: string | null
  features: string[] | null
  equipment: string[] | null
}

interface VehiclesPageProps {
  searchParams: Promise<{
    search?: string
    type?: string
    fuel?: string
    transmission?: string
    seats?: string
    startDate?: string
    endDate?: string
  }>
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // 車両データを取得（フィルター適用）
  let query = supabase.from("vehicles").select("*").eq("status", "available")

  // 検索フィルターを適用
  if (params.search) {
    query = query.or(`make.ilike.%${params.search}%,model.ilike.%${params.search}%`)
  }
  if (params.type) {
    query = query.eq("vehicle_type", params.type)
  }
  if (params.fuel) {
    query = query.eq("fuel_type", params.fuel)
  }
  if (params.transmission) {
    query = query.eq("transmission", params.transmission)
  }
  if (params.seats) {
    query = query.eq("seats", Number.parseInt(params.seats))
  }

  const { data: vehicles, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching vehicles:", error)
  }

  let availableVehicles = vehicles || []

  // 日付による絞り込み（重複チェック）
  if (params.startDate && params.endDate) {
    const startDate = params.startDate
    const endDate = params.endDate

    // 指定期間に重複する予約を取得
    const { data: conflictingReservations } = await supabase
      .from("reservations")
      .select("vehicle_id")
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`)
      .in("status", ["confirmed", "active"]) // キャンセル済みなどは除外

    if (conflictingReservations && conflictingReservations.length > 0) {
      const conflictingVehicleIds = new Set(conflictingReservations.map((r) => r.vehicle_id))
      availableVehicles = availableVehicles.filter((v) => !conflictingVehicleIds.has(v.id))
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">車両一覧</h1>
            <p className="text-muted-foreground">利用可能な車両から選択してください</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">ダッシュボードに戻る</Button>
          </Link>
        </div>

        {/* フィルター */}
        <VehicleFilters />

        {/* 車両一覧 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableVehicles.length > 0 ? (
            availableVehicles.map((vehicle: Vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                dateRange={
                  params.startDate && params.endDate
                    ? { from: new Date(params.startDate), to: new Date(params.endDate) }
                    : undefined
                }
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">条件に合う車両が見つかりませんでした。</p>
              {params.startDate && (
                <p className="text-sm text-muted-foreground mt-2">
                  指定された期間は予約が埋まっている可能性があります。日程を変更して再度お試しください。
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
