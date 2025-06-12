'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AchievementDetailResponse } from '@/types/achievement';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const tierColors: Record<string, string> = {
  bronze: 'bg-amber-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-400',
  platinum: 'bg-blue-400'
};

export default function AchievementDetailPage() {
  const params = useParams();
  const [data, setData] = useState<AchievementDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        const response = await fetch(`/api/v1/achievements/${params.id}`);
        const achievementData: AchievementDetailResponse = await response.json();
        setData(achievementData);
      } catch (error) {
        console.error('Failed to fetch achievement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievement();
  }, [params.id]);

  if (loading) {
    return <AchievementDetailSkeleton />;
  }

  if (!data) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">実績が見つかりません</h1>
          <Link href="/achievements">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              実績一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { achievement, related_achievements } = data;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link href="/achievements">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            実績一覧に戻る
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className={`${achievement.unlocked ? 'border-2 border-green-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{achievement.title}</CardTitle>
                <Badge className={tierColors[achievement.tier]}>
                  {achievement.tier}
                </Badge>
              </div>
              <CardDescription className="text-lg">{achievement.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">進捗状況</h3>
                  <div className="flex justify-between text-sm mb-2">
                    <span>現在の進捗</span>
                    <span>{achievement.progress} / {achievement.progress_target}</span>
                  </div>
                  <Progress value={achievement.progress_percentage} className="h-4" />
                </div>

                {achievement.unlocked && (
                  <div className="text-green-600">
                    <h3 className="text-lg font-medium mb-2">獲得情報</h3>
                    <p>獲得日: {new Date(achievement.unlocked_at!).toLocaleDateString()}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium mb-2">報酬</h3>
                  <p>{achievement.reward}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>関連する実績</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {related_achievements.map(related => (
                  <Link
                    key={related.id}
                    href={`/achievements/${related.id}`}
                    className="block"
                  >
                    <Card className="hover:bg-accent transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{related.title}</h4>
                          {related.unlocked && (
                            <Badge variant="outline" className="bg-green-100">
                              獲得済み
                            </Badge>
                          )}
                        </div>
                        <Progress value={related.progress_percentage} />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AchievementDetailSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-10 w-32 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 