import type { Config } from "jest"
import nextJest from "next/jest.js"

// next/jest が next.config と .env を読み込んだ Jest 設定を生成する
const createJestConfig = nextJest({
  dir: "./",
})

const config: Config = {
  // jest-dom のカスタムマッチャー等をテスト実行前に読み込む
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  // tsconfig の paths エイリアス（@/*）を Jest でも解決する
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // テストは src 配下の __tests__ に配置する
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}"],
}

export default createJestConfig(config)
