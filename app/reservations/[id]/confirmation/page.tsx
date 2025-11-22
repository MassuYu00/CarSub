import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, MapPin, Car } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { notFound, redirect } from "next/navigation"

interface ReservationConfirmationPageProps {
  params: Promise<{ id: string }>
}

export default async function ReservationConfirmationPage({ params }: ReservationConfirmationPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // ユーザー認証確認
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // 予約情報を取得
  const { data: reservation, error } = await supabase
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
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !reservation) {
    notFound()
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
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* 成功メッセージ */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-green-900">予約が完了しました</h1>
                  <p className="text-green-700">予約番号: {reservation.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 予約詳細 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>予約詳細</CardTitle>
                <Badge variant={getStatusVariant(reservation.status)}>{getStatusLabel(reservation.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 車両情報 */}
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Car className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">
                      {reservation.vehicles.make} {reservation.vehicles.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {reservation.vehicles.year}年 • {reservation.vehicles.color}
                    </p>
                  </div>
                </div>

                {/* 利用期間 */}
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">利用期間</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(reservation.start_date), "yyyy年MM月dd日", { locale: ja })} 〜{" "}
                      {format(new Date(reservation.end_date), "yyyy年MM月dd日", { locale: ja })}
                    </p>
                  </div>
                </div>

                {/* 場所情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">受取場所</h3>
                      <p className="text-sm text-muted-foreground">{reservation.pickup_location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">返却場所</h3>
                      <p className="text-sm text-muted-foreground">{reservation.return_location}</p>
                    </div>
                  </div>
                </div>

                {/* 備考 */}
                {reservation.notes && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">備考・要望</h3>
                    <p className="text-sm text-muted-foreground">{reservation.notes}</p>
                  </div>
                )}

                {/* 料金 */}
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-2">料金</h3>
                  <div className="flex justify-between items-center">
                    <span>合計金額</span>
                    <span className="text-2xl font-bold">¥{reservation.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 次のステップ */}
          <Card>
            <CardHeader>
              <CardTitle>次のステップ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  予約が確認され次第、メールでご連絡いたします。ご不明な点がございましたら、お気軽にお問い合わせください。
                </p>
                <div className="flex gap-4">
                  <Link href="/reservations">
                    <Button variant="outline">予約一覧を見る</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button>ダッシュボードに戻る</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
