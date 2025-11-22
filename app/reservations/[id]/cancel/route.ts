import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

    // 予約をキャンセル状態に更新
    const { data, error } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("status", "pending") // pending状態の予約のみキャンセル可能
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "予約のキャンセルに失敗しました" }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: "キャンセル可能な予約が見つかりません" }, { status: 404 })
    }

    return NextResponse.json({ success: true, reservation: data })
  } catch (error) {
    console.error("Cancel reservation error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
