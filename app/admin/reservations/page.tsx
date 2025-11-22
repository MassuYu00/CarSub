import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, User } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { redirect } from "next/navigation"

export default async function AdminReservationsPage() {
  const supabase = await createClient()

  // 管理者認証確認
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
        license_plate
      ),
      profiles (
        full_name
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reservations:", error)
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

  return (
    <div>
      <div className="flex flex-col gap-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">予約管理</h1>
              <p className="text-muted-foreground">予約の確認・変更・キャンセル</p>
            </div>
          </div>
        </div>

        {/* 予約一覧 */}
        <div className="space-y-4">
          {reservations && reservations.length > 0 ? (
            reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">予約番号: {reservation.id.slice(0, 8).toUpperCase()}</CardTitle>
                      <CardDescription>
                        {format(new Date(reservation.created_at), "yyyy年MM月dd日 HH:mm", { locale: ja })} に作成
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(reservation.status)}>{getStatusLabel(reservation.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* ユーザー情報 */}
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">ユーザー</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.profiles?.full_name ? decodeURIComponent(atob(reservation.profiles.full_name)) : "ユーザー名不明"}
                        </p>
                      </div>
                    </div>

                    {/* 車両情報 */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">車両</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.vehicles.make} {reservation.vehicles.model}
                        </p>
                      </div>
                    </div>

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
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-lg font-semibold">¥{reservation.total_amount.toLocaleString()}</p>
                      {reservation.notes && (
                        <p className="text-sm text-muted-foreground mt-1">備考: {reservation.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {reservation.status === "pending" && (
                        <>
                          <Button variant="outline" size="sm">
                            確定
                          </Button>
                          <Button variant="destructive" size="sm">
                            キャンセル
                          </Button>
                        </>
                      )}
                      <Link href={`/admin/reservations/${reservation.id}`}>
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">予約がありません</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}