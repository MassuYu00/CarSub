import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, User, Mail, Phone, MapPin, Calendar, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // ユーザープロファイルを取得
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // ユーザーの現在のサブスクリプションを取得
  const { data: currentSubscription } = await supabase
    .from("user_subscriptions")
    .select(
      `
      *,
      subscription_plans (
        name,
        monthly_price,
        description
      )
    `,
    )
    .eq("user_id", data.user.id)
    .eq("status", "active")
    .single()

  // 予約履歴を取得
  const { data: reservations } = await supabase
    .from("reservations")
    .select(
      `
      *,
      vehicles (make, model, year)
    `,
    )
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(5)

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
      pending: "審査中",
      confirmed: "確定",
      active: "利用中",
      completed: "完了",
      cancelled: "キャンセル",
    }
    return statuses[status] || status
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ダッシュボード
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">プロファイル</h1>
              <p className="text-muted-foreground">アカウント情報の確認・編集</p>
            </div>
          </div>
          <Link href="/profile/edit">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* プロファイル情報 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  基本情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <User className="h-4 w-4" />
                      氏名
                    </div>
                    <p className="font-medium">{profile?.full_name ? decodeURIComponent(atob(profile.full_name)) : "未設定"}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Mail className="h-4 w-4" />
                      メールアドレス
                    </div>
                    <p className="font-medium">{data.user.email}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Phone className="h-4 w-4" />
                      電話番号
                    </div>
                    <p className="font-medium">{profile?.phone || "未設定"}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      生年月日
                    </div>
                    <p className="font-medium">
                      {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString("ja-JP") : "未設定"}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                    住所
                  </div>
                  <p className="font-medium">{profile?.address || "未設定"}</p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                        </Badge>
                        本人確認ステータス
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            profile?.verification_status === 'verified' ? 'default' :
                              profile?.verification_status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {profile?.verification_status === 'verified' ? '確認済み' :
                            profile?.verification_status === 'pending' ? '審査中' :
                              profile?.verification_status === 'rejected' ? '却下' : '未提出'}
                        </Badge>
                      </div>
                    </div>
                    {profile?.verification_status !== 'verified' && profile?.verification_status !== 'pending' && (
                      <Link href="/profile/verify">
                        <Button size="sm">
                          本人確認を行う
                        </Button>
                      </Link>
                    )}
                    {profile?.verification_status === 'rejected' && (
                      <Link href="/profile/verify">
                        <Button size="sm" variant="destructive">
                          再提出する
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 最近の予約履歴 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>最近の予約履歴</CardTitle>
                  <Link href="/reservations">
                    <Button variant="outline" size="sm">
                      すべて見る
                    </Button>
                  </Link>
                </div>
                <CardDescription>最新の予約状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reservations && reservations.length > 0 ? (
                    reservations.map((reservation) => (
                      <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {reservation.vehicles.make} {reservation.vehicles.model} ({reservation.vehicles.year})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(reservation.start_date).toLocaleDateString("ja-JP")} -{" "}
                            {new Date(reservation.end_date).toLocaleDateString("ja-JP")}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusVariant(reservation.status)}>
                            {getStatusLabel(reservation.status)}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            ¥{reservation.total_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">予約履歴がありません</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* サブスクリプション情報 */}
            <Card>
              <CardHeader>
                <CardTitle>サブスクリプション</CardTitle>
              </CardHeader>
              <CardContent>
                {currentSubscription ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{currentSubscription.subscription_plans.name}</p>
                        <Badge variant="default">アクティブ</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        月額 ¥{currentSubscription.subscription_plans.monthly_price.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {currentSubscription.subscription_plans.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">開始日:</span>{" "}
                        {new Date(currentSubscription.start_date).toLocaleDateString("ja-JP")}
                      </p>
                      {currentSubscription.end_date && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">終了日:</span>{" "}
                          {new Date(currentSubscription.end_date).toLocaleDateString("ja-JP")}
                        </p>
                      )}
                    </div>
                    <Link href="/subscription">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        プラン管理
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">現在サブスクリプションプランに加入していません</p>
                    <Link href="/subscription">
                      <Button size="sm" className="w-full">
                        プランを選択
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* アカウント設定 */}
            <Card>
              <CardHeader>
                <CardTitle>アカウント設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Edit className="h-4 w-4 mr-2" />
                    プロファイル編集
                  </Button>
                </Link>
                <Link href="/profile/password">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    パスワード変更
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}