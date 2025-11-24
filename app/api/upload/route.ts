import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "ファイルが提供されていません" }, { status: 400 })
    }

    // ファイルタイプの検証
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "画像ファイルのみアップロード可能です" }, { status: 400 })
    }

    // ファイルサイズの検証（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "ファイルサイズは5MB以下にしてください" }, { status: 400 })
    }

    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // ユニークなファイル名を生成
    const timestamp = Date.now()
    // ファイル名から日本語などを除外して安全にする
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const fileName = `${user.id}/${timestamp}-${safeName}`

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage.from("vehicles").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Supabase Storage upload error:", error)
      return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 })
    }

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from("vehicles").getPublicUrl(fileName)

    return NextResponse.json({
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("アップロードエラー:", error)
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 })
  }
}
