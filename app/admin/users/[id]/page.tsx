import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Calendar, Mail, Phone, MapPin, CreditCard, ShieldCheck, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { redirect } from "next/navigation"
import { checkAdminAccess } from "@/lib/admin-auth"

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
    const { isAdmin, user } = await checkAdminAccess()

    if (!isAdmin || !user) {
        redirect("/dashboard")
    }

    const supabase = await createClient()
    const userId = params.id

    // ユーザー詳細情報を取得
    const { data: userProfile, error } = await supabase
        .from("profiles")
        .select(
            `
      *,
      user_subscriptions (
        *,
        subscription_plans (*)
      ),
      reservations (
        *,
        vehicles (make, model, license_plate)
      )
    `,
        )
        .eq("id", userId)
        .single()

    if (error || !userProfile) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">ユーザーが見つかりません</h1>
                <Link href="/admin/users">
                    <Button>ユーザー一覧に戻る</Button>
                </Link>
            </div>
        )
    }

    // 予約履歴を日付順にソート
    const sortedReservations = userProfile.reservations?.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

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
                <Link href="/admin/users">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">ユーザー詳細</h1>
                    <p className="text-muted-foreground">ID: {userProfile.id}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 基本情報 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            基本情報
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 font-medium text-muted-foreground">名前</div>
                            <div className="col-span-2 font-medium text-lg">
                                {userProfile.full_name ? decodeURIComponent(atob(userProfile.full_name)) : "未設定"}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 font-medium text-muted-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4" /> Email
                            </div>
                            <div className="col-span-2">{userProfile.email || "不明"}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 font-medium text-muted-foreground flex items-center gap-2">
                                <Phone className="h-4 w-4" /> 電話番号
                            </div>
                            <div className="col-span-2">{userProfile.phone || "未設定"}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 font-medium text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> 住所
                            </div>
                            <div className="col-span-2">{userProfile.address || "未設定"}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 font-medium text-muted-foreground">登録日</div>
                            <div className="col-span-2">
                                {format(new Date(userProfile.created_at), "yyyy年MM月dd日 HH:mm", { locale: ja })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 本人確認ステータス */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            本人確認
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">ステータス</span>
                            <Badge
                                variant={
                                    userProfile.verification_status === "verified"
                                        ? "default"
                                        : userProfile.verification_status === "pending"
                                            ? "secondary"
                                            : userProfile.verification_status === "rejected"
                                                ? "destructive"
                                                : "outline"
                                }
                                className="text-base px-3 py-1"
                            >
                                {userProfile.verification_status === "verified"
                                    ? "確認済み"
                                    : userProfile.verification_status === "pending"
                                        ? "確認待ち"
                                        : userProfile.verification_status === "rejected"
                                            ? "却下"
                                            : "未提出"}
                            </Badge>
                        </div>

                        {userProfile.driver_license_image_url ? (
                            <div className="space-y-4">
                                <div className="border rounded-lg p-4 bg-muted/20">
                                    <p className="text-sm font-medium mb-2">免許証番号</p>
                                    <p className="font-mono text-lg">{userProfile.driver_license_number || "未登録"}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="aspect-video relative bg-muted rounded-lg overflow-hidden border">
                                        <p className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded z-10">表面</p>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={userProfile.driver_license_image_url || "/placeholder.svg"}
                                            alt="免許証画像(表)"
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    {userProfile.driver_license_back_image_url ? (
                                        <div className="aspect-video relative bg-muted rounded-lg overflow-hidden border">
                                            <p className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded z-10">裏面</p>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={userProfile.driver_license_back_image_url}
                                                alt="免許証画像(裏)"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-video relative bg-muted rounded-lg overflow-hidden border flex items-center justify-center">
                                            <p className="text-muted-foreground text-sm">裏面画像なし</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <a
                                        href={userProfile.driver_license_image_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1"
                                    >
                                        <Button variant="outline" className="w-full">
                                            表面を拡大
                                        </Button>
                                    </a>
                                    {userProfile.driver_license_back_image_url && (
                                        <a
                                            href={userProfile.driver_license_back_image_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1"
                                        >
                                            <Button variant="outline" className="w-full">
                                                裏面を拡大
                                            </Button>
                                        </a>
                                    )}
                                </div>

                                {userProfile.verification_status === "pending" && (
                                    <div className="flex gap-2 pt-4 border-t">
                                        <form
                                            action={async () => {
                                                "use server"
                                                const supabase = await createClient()
                                                await supabase
                                                    .from("profiles")
                                                    .update({ verification_status: "verified" })
                                                    .eq("id", userId)
                                                redirect(`/admin/users/${userId}`)
                                            }}
                                            className="flex-1"
                                        >
                                            <Button className="w-full bg-green-600 hover:bg-green-700">承認する</Button>
                                        </form>
                                        <form
                                            action={async () => {
                                                "use server"
                                                const supabase = await createClient()
                                                await supabase
                                                    .from("profiles")
                                                    .update({ verification_status: "rejected" })
                                                    .eq("id", userId)
                                                redirect(`/admin/users/${userId}`)
                                            }}
                                            className="flex-1"
                                        >
                                            <Button variant="destructive" className="w-full">
                                                却下する
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                <ShieldAlert className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>本人確認書類が提出されていません</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* サブスクリプション情報 */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            サブスクリプション契約
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {userProfile.user_subscriptions && userProfile.user_subscriptions.length > 0 ? (
                            <div className="space-y-4">
                                {userProfile.user_subscriptions.map((sub: any) => (
                                    <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg">{sub.subscription_plans?.name}</h3>
                                                <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                                                    {sub.status === "active" ? "有効" : "無効"}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground">
                                                開始日: {format(new Date(sub.start_date), "yyyy/MM/dd", { locale: ja })}
                                                {sub.end_date && ` 〜 終了日: ${format(new Date(sub.end_date), "yyyy/MM/dd", { locale: ja })}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold">¥{sub.subscription_plans?.monthly_price.toLocaleString()}</p>
                                            <p className="text-sm text-muted-foreground">/月</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">契約中のサブスクリプションはありません</div>
                        )}
                    </CardContent>
                </Card>

                {/* 予約履歴 */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            予約履歴
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sortedReservations && sortedReservations.length > 0 ? (
                            <div className="space-y-4">
                                {sortedReservations.map((reservation: any) => (
                                    <Link key={reservation.id} href={`/admin/reservations/${reservation.id}`}>
                                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                                                    <Calendar className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {reservation.vehicles.make} {reservation.vehicles.model}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(reservation.start_date), "yyyy/MM/dd", { locale: ja })} 〜{" "}
                                                        {format(new Date(reservation.end_date), "yyyy/MM/dd", { locale: ja })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={getStatusVariant(reservation.status)} className="mb-1">
                                                    {getStatusLabel(reservation.status)}
                                                </Badge>
                                                <p className="font-medium">¥{reservation.total_amount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">予約履歴はありません</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
