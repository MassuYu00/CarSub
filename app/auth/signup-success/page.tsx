import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">アカウント作成完了</CardTitle>
              <CardDescription>メールを確認してください</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                アカウントの作成が完了しました。メールに送信された確認リンクをクリックして、アカウントを有効化してください。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
