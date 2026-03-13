import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Check } from "lucide-react";

export default function ResetPasswordConfirm() {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <Check className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">メールを送信しました</CardTitle>
                    <CardDescription className="text-center">
                        パスワードリセット用のリンクを記載したメールを送信しました。メールに記載されている手順に従ってパスワードをリセットしてください。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button asChild className="w-full">
                            <Link href="/login">ログイン画面に戻る</Link>
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            メールが届かない場合は、迷惑メールフォルダをご確認いただくか、
                            <Link href="/reset-password" className="text-primary hover:underline">
                                再試行
                            </Link>
                            してください。
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}