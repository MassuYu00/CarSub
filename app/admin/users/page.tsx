import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Calendar } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { redirect } from "next/navigation"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // 管理者認証確認
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // ユーザー一覧を取得
  const { data: users, error } = await supabase
    .from("profiles")
    .select(
      `
      *,
      user_subscriptions!inner (
        status,
        subscription_plans (
          name,
          monthly_price
        )
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">ユーザー管理</h2>
            <p className="text-muted-foreground">ユーザー情報・サブスクリプション管理・本人確認</p>
          </div>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="grid gap-4">
        {users && users.length > 0 ? (
          users.map((userProfile) => (
            <Card key={userProfile.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">
                        {userProfile.full_name ? decodeURIComponent(atob(userProfile.full_name)) : "名前未設定"}
                      </CardTitle>
                      <CardDescription>{userProfile.id}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {userProfile.verification_status && (
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
                      >
                        {userProfile.verification_status === "verified"
                          ? "本人確認済み"
                          : userProfile.verification_status === "pending"
                            ? "確認待ち"
                            : userProfile.verification_status === "rejected"
                              ? "却下"
                              : "未提出"}
                      </Badge>
                    )}
                    {userProfile.user_subscriptions?.[0] && (
                      <Badge variant={userProfile.user_subscriptions[0].status === "active" ? "default" : "secondary"}>
                        {userProfile.user_subscriptions[0].status === "active" ? "アクティブ" : "非アクティブ"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* 基本情報 */}
                  <div>
                    <h4 className="font-semibold mb-2">基本情報</h4>
                    <div className="space-y-1 text-sm">
                      {userProfile.phone && <p className="text-muted-foreground">電話: {userProfile.phone}</p>}
                      {userProfile.address && <p className="text-muted-foreground">住所: {userProfile.address}</p>}
                      {userProfile.driver_license_number && (
                        <p className="text-muted-foreground">免許証番号: {userProfile.driver_license_number}</p>
                      )}
                    </div>
                  </div>

                  {/* サブスクリプション情報 */}
                  <div>
                    <h4 className="font-semibold mb-2">サブスクリプション</h4>
                    {userProfile.user_subscriptions?.[0] ? (
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{userProfile.user_subscriptions[0].subscription_plans?.name}</p>
                        <p className="text-muted-foreground">
                          月額 ¥{userProfile.user_subscriptions[0].subscription_plans?.monthly_price.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">未加入</p>
                    )}
                  </div>

                  {/* 本人確認書類 */}
                  <div>
                    <h4 className="font-semibold mb-2">本人確認書類</h4>
                    {userProfile.driver_license_image_url ? (
                      <div className="space-y-2">
                        <a
                          href={userProfile.driver_license_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline block"
                        >
                          免許証画像を確認
                        </a>
                        {userProfile.verification_status === "pending" && (
                          <div className="flex gap-2">
                            <form
                              action={async () => {
                                "use server"
                                const supabase = await createClient()
                                await supabase
                                  .from("profiles")
                                  .update({ verification_status: "verified" })
                                  .eq("id", userProfile.id)
                                redirect("/admin/users")
                              }}
                            >
                              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                                承認
                              </Button>
                            </form>
                            <form
                              action={async () => {
                                "use server"
                                const supabase = await createClient()
                                await supabase
                                  .from("profiles")
                                  .update({ verification_status: "rejected" })
                                  .eq("id", userProfile.id)
                                redirect("/admin/users")
                              }}
                            >
                              <Button size="sm" variant="destructive">
                                却下
                              </Button>
                            </form>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">画像未提出</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Link href={`/admin/users/${userProfile.id}`}>
                    <Button variant="outline" size="sm">
                      詳細を見る
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    編集
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">ユーザーがいません</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}