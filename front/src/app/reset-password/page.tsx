import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ResetPassword() {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">パスワードをリセット</CardTitle>
                    <CardDescription>
                        登録時に使用したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                メールアドレス
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@example.com"
                                className="w-full"
                            />
                        </div>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600">パスワードリセットリンクを送信</Button>
                        <div className="text-center text-sm">
                            <Link href="/login" className="text-primary hover:underline flex items-center justify-center gap-1">
                                <ArrowLeft className="h-4 w-4" />
                                ログイン画面に戻る
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}