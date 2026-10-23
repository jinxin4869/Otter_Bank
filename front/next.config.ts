import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

// API の origin（src/lib/api-client.ts の getApiUrl() と同じ環境変数から決める）。未設定なら connect-src に足さない
const apiUrl = isDev ? process.env.NEXT_PUBLIC_DEV_URL : process.env.NEXT_PUBLIC_API_URL;
const apiOrigin = apiUrl ? new URL(apiUrl).origin : null;

// nonce を使うと全ページが動的レンダリングになるため、Next.js のガイドの「nonce なし」の構成にする。
// script-src の 'unsafe-inline' は Next.js のインラインスクリプトのために必要。
// 外部のスクリプト読み込み・埋め込み・フォーム送信先は制限できる
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // http の API（ローカルで next start するとき）への通信を https に書き換えて失敗させないよう、API が https のときだけ付ける
  ...(apiOrigin?.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // パスワードリセットなどのトークンを URL に載せるので、外部へはオリジンだけを送る
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../"),
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig
