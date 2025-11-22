import { createClient } from "@/lib/supabase/server"

export async function checkAdminAccess() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { isAdmin: false, user: null }
  }

  // プロファイルから管理者権限をチェック
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // 管理者権限をチェック（roleが'admin'または特定のメールアドレス）
  const isAdmin =
    profile?.role === "admin" || user.email === "admin@carsubsc.com" || user.email?.endsWith("@carsubsc.com") || user.email === "y.workac53@gmail.com"

  return { isAdmin, user, profile }
}