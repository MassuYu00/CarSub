import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, User, Car, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { redirect } from "next/navigation"
import { checkAdminAccess } from "@/lib/admin-auth"

export default async function AdminReservationDetailPage({ params }: { params: { id: string } }) {
    const { isAdmin, user } = await checkAdminAccess()

    if (!isAdmin || !user) {
        redirect("/dashboard")
    }

    const supabase = await createClient()
    const reservationId = params.id

    // 予約詳細情報を取得
    const { data: reservation, error } = await supabase
        .from("reservations")
        .select(
            `
      *,
      vehicles (
        *,
        id,
        make,
        model,
        year,
        color,
        license_plate,
        image_url
      ),
      profiles (
        *,
        id,
        full_name,
        email,
        phone
      )
    `,
        )
        .eq("id", reservationId)
        .single()

    if (error || !reservation) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">予約が見つかりません</h1>
                <Link href="/admin/reservations">
                    <Button>予約一覧に戻る</Button>
                </Link>
            </div>
        )
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
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/reservations">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">予約詳細</h1>
                    <p className="text-muted-foreground">予約ID: {reservation.id}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* メイン情報 */}
                <div className="md:col-span-2 space-y-6">
                    {/* ステータスカード */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>現在のステータス</span>
                                <Badge variant={getStatusVariant(reservation.status)} className="text-base px-3 py-1">
                                    {getStatusLabel(reservation.status)}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                {reservation.status === "pending" && (
                                    <>
                                        <form
                                            action={async () => {
                                                "use server"
                                                const supabase = await createClient()
                                                await supabase.from("reservations").update({ status: "confirmed" }).eq("id", reservationId)
                                                redirect(`/admin/reservations/${reservationId}`)
                                            }}
                                        >
                                            <Button className="bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                予約を確定する
                                            </Button>
                                        </form>
                                        <form
                                            action={async () => {
                                                "use server"
                                                const supabase = await createClient()
                                                await supabase.from("reservations").update({ status: "cancelled" }).eq("id", reservationId)
                                                redirect(`/admin/reservations/${reservationId}`)
                                            }}
                                        >
                                            <Button variant="destructive">
                                                <XCircle className="mr-2 h-4 w-4" />
                                                予約をキャンセル
                                            </Button>
                                        </form>
                                    </>
                                )}
                                {reservation.status === "confirmed" && (
                                    <form
                                        action={async () => {
                                            "use server"
                                            const supabase = await createClient()
                                            await supabase.from("reservations").update({ status: "active" }).eq("id", reservationId)
                                            redirect(`/admin/reservations/${reservationId}`)
                                        }}
                                    >
                                        <Button>
                                            <Car className="mr-2 h-4 w-4" />
                                            貸出開始（利用中へ）
                                        </Button>
                                    </form>
                                )}
                                {reservation.status === "active" && (
                                    <form
                                        action={async () => {
                                            "use server"
                                            const supabase = await createClient()
                                            await supabase.from("reservations").update({ status: "completed" }).eq("id", reservationId)
                                            redirect(`/admin/reservations/${reservationId}`)
                                        }}
                                    >
                                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            返却完了（完了へ）
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 予約詳細 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                予約内容
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">利用開始日時</p>
                                    <p className="text-lg font-medium">
                                        {format(new Date(reservation.start_date), "yyyy年MM月dd日 HH:mm", { locale: ja })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">利用終了日時</p>
                                    <p className="text-lg font-medium">
                                        {format(new Date(reservation.end_date), "yyyy年MM月dd日 HH:mm", { locale: ja })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">受取・返却場所</p>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{reservation.pickup_location}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">合計金額</p>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xl font-bold">¥{reservation.total_amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {reservation.notes && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm font-medium text-muted-foreground mb-2">備考</p>
                                    <p className="bg-muted p-3 rounded-md text-sm">{reservation.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* サイドバー情報 */}
                <div className="space-y-6">
                    {/* ユーザー情報 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="h-4 w-4" />
                                予約者情報
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">氏名</p>
                                <Link href={`/admin/users/${reservation.profiles?.id}`} className="font-medium hover:underline">
                                    {reservation.profiles?.full_name
                                        ? decodeURIComponent(atob(reservation.profiles.full_name))
                                        : "不明なユーザー"}
                                </Link>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">メールアドレス</p>
                                <p className="text-sm">{reservation.profiles?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">電話番号</p>
                                <p className="text-sm">{reservation.profiles?.phone || "未設定"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 車両情報 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Car className="h-4 w-4" />
                                車両情報
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={reservation.vehicles.image_url || "/placeholder.svg"}
                                    alt="車両画像"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-lg">
                                    {reservation.vehicles.make} {reservation.vehicles.model}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {reservation.vehicles.year}年式 • {reservation.vehicles.color}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">ナンバープレート</p>
                                <p className="font-mono">{reservation.vehicles.license_plate}</p>
                            </div>
                            <Link href={`/admin/vehicles/${reservation.vehicles.id}/edit`}>
                                <Button variant="outline" size="sm" className="w-full mt-2">
                                    車両詳細を見る
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* メタデータ */}
                    <Card>
                        <CardContent className="py-4 space-y-2 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                                <span>作成日時:</span>
                                <span>{format(new Date(reservation.created_at), "yyyy/MM/dd HH:mm", { locale: ja })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>更新日時:</span>
                                <span>{format(new Date(reservation.updated_at), "yyyy/MM/dd HH:mm", { locale: ja })}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
