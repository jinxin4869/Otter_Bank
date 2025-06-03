import { useState, useCallback } from 'react';
import { toast } from 'sonner';
// import { type Achievement as FrontendAchievement } from '@/app/collection/page'; // collection/page.tsx から型をインポート

// バックエンドAPIのレスポンス型 (collection/page.tsx と同じものを再定義または共有)
// もし型定義を共通化したい場合は、types/index.ts のようなファイルに移動することを検討してください。
type ApiAchievementResponse = {
  id: number; // DB上の achievement.id
  original_achievement_id: number;
  title: string;
  description: string;
  category: string;
  unlocked: boolean;
  progress: number;
  image_url: string | null;
  reward: string | null;
  tier: number | null;
  // created_at, updated_at など、APIが返す他のフィールドも必要に応じて追加
};

/*
// APIレスポンスをフロントエンドの型に変換するヘルパー関数
const mapApiToFrontend = (apiAch: ApiAchievementResponse): FrontendAchievement => {
  return {
    id: apiAch.original_achievement_id,
    dbId: apiAch.id,
    title: apiAch.title,
    description: apiAch.description,
    category: apiAch.category,
    isUnlocked: apiAch.unlocked,
    progress: apiAch.progress,
    imageUrl: apiAch.image_url || `/placeholder.svg?height=120&width=120&text=${encodeURIComponent(apiAch.title.substring(0,10))}`,
    reward: apiAch.reward || undefined,
    tier: apiAch.tier || undefined,
  };
};

type UseAchievementsReturn = {
  updateAchievement: (
    achievementOriginalId: number,
    newProgress: number,
    isNowUnlocked: boolean
  ) => Promise<FrontendAchievement | null>;
  isLoading: boolean;
  error: string | null;
};

export const useAchievements = (): UseAchievementsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAchievement = useCallback(
    async (
      achievementOriginalId: number,
      newProgress: number,
      isNowUnlocked: boolean
    ): Promise<FrontendAchievement | null> => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        const msg = '認証情報がありません。実績を更新できませんでした。';
        console.error(msg);
        toast.error(msg);
        setError(msg);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/achievements/${achievementOriginalId}`,
          {
            method: 'PUT', // または 'PATCH'
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              progress: newProgress,
              unlocked: isNowUnlocked,
            }),
          }
        );

        if (!response.ok) {
          let errorMsg = `実績の更新に失敗しました (Status: ${response.status})`;
          try {
            const errorData = await response.json();
            errorMsg = `実績の更新に失敗しました: ${errorData.errors?.join(', ') || errorData.error || response.statusText}`;
          } catch (e) {
            // JSONパースに失敗した場合
            console.warn("Failed to parse error response as JSON");
          }
          console.error(errorMsg, { status: response.status, statusText: response.statusText });
          toast.error(errorMsg);
          setError(errorMsg);
          return null;
        }

        const updatedApiAchievement: ApiAchievementResponse = await response.json();
        toast.success(`実績「${updatedApiAchievement.title}」を更新しました！`);
        
        const frontendAchievement = mapApiToFrontend(updatedApiAchievement);
        return frontendAchievement;

      } catch (err) {
        const catchMsg = '実績の更新中に予期せぬエラーが発生しました。';
        console.error(catchMsg, err);
        toast.error(catchMsg);
        setError(catchMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [] // 依存配列は空でOK (localStorage, process.env は外部依存)
  );

  return { updateAchievement, isLoading, error };
};
*/