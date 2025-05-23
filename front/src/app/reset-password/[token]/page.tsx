import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function NewPassword({ params }: { params: { token: string } }) {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">新しいパスワードを設定</CardTitle>
                    <CardDescription>
                        パスワードは8文字以上で、英字、数字、記号を含めるとより安全です。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="new-password" className="text-sm font-medium leading-none">
                                新しいパスワード
                            </label>
                            <Input
                                id="new-password"
                                type="password"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirm-password" className="text-sm font-medium leading-none">
                                パスワード（確認）
                            </label>
                            <Input
                                id="confirm-password"
                                type="password"
                                className="w-full"
                            />
                        </div>
                        <Button className="w-full">パスワードを変更</Button>
                        <div className="text-center text-sm">
                            <Link href="/login" className="text-primary hover:underline">
                                ログイン画面に戻る
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}