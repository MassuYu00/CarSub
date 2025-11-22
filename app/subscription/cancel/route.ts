import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()

  try {
    // ユーザー認証確認
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // アクティブなサブスクリプションをキャンセル状態に更新
    const { data, error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "cancelled",
        end_date: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("status", "active")
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "サブスクリプションのキャンセルに失敗しました" }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: "キャンセル可能なサブスクリプションが見つかりません" }, { status: 404 })
    }

    return NextResponse.json({ success: true, subscription: data })
  } catch (error) {
    console.error("Cancel subscription error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
