import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CancelReservationButton } from "@/components/cancel-reservation-button"
import { Calendar, MapPin, Car } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { redirect } from "next/navigation"

export default async function ReservationsPage() {
  const supabase = await createClient()

  // ユーザー認証確認
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // 予約一覧を取得
  const { data: reservations, error } = await supabase
    .from("reservations")
    .select(
      `
      *,
      vehicles (
        make,
        model,
        year,
        color,
        vehicle_type,
        image_url
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reservations:", error)
  }

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      pending: "確認待ち",
      confirmed: "確定",
      active: "利用中",
      completed: "完了",
      cancelled: "キャンセル",
    }
    return statuses[status] || status
  }

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      active: "default",
      completed: "outline",
      cancelled: "destructive",
    }
    return variants[status] || "secondary"
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">予約一覧</h1>
            <p className="text-muted-foreground">あなたの予約履歴を確認できます</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">ダッシュボードに戻る</Button>
          </Link>
        </div>

        {/* 予約一覧 */}
        <div className="space-y-4">
          {reservations && reservations.length > 0 ? (
            reservations.map((reservation) => (
              <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {reservation.vehicles.make} {reservation.vehicles.model}
                      </CardTitle>
                      <CardDescription>予約番号: {reservation.id.slice(0, 8).toUpperCase()}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(reservation.status)}>{getStatusLabel(reservation.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* 利用期間 */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">利用期間</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(reservation.start_date), "MM/dd", { locale: ja })} 〜{" "}
                          {format(new Date(reservation.end_date), "MM/dd", { locale: ja })}
                        </p>
                      </div>
                    </div>

                    {/* 受取場所 */}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">受取場所</p>
                        <p className="text-sm text-muted-foreground">{reservation.pickup_location}</p>
                      </div>
                    </div>

                    {/* 料金 */}
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">料金</p>
                        <p className="text-sm text-muted-foreground">¥{reservation.total_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link href={`/reservations/${reservation.id}/confirmation`}>
                      <Button variant="outline" size="sm">
                        詳細を見る
                      </Button>
                    </Link>
                    {reservation.status === "pending" && <CancelReservationButton reservationId={reservation.id} />}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">まだ予約がありません</p>
                <Link href="/vehicles">
                  <Button>車両を探す</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
