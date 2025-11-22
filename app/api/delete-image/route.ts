import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URLが提供されていません" }, { status: 400 })
    }

    // Vercel Blobから削除
    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("削除エラー:", error)
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 })
  }
}
