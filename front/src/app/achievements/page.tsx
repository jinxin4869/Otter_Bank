'use client';

import { useEffect, useState } from 'react';
import { Achievement, AchievementResponse } from '@/types/achievement';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const categoryLabels: Record<string, string> = {
  savings: '貯金',
  streak: '連続記録',
  milestone: 'マイルストーン',
  special: '特別'
};

const tierColors: Record<string, string> = {
  bronze: 'bg-amber-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-400',
  platinum: 'bg-blue-400'
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [summary, setSummary] = useState<AchievementResponse['summary'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch('/api/v1/achievements');
        const data: AchievementResponse = await response.json();
        setAchievements(data.achievements);
        setSummary(data.summary);
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const filteredAchievements = activeCategory === 'all'
    ? achievements
    : achievements.filter(achievement => achievement.category === activeCategory);

  if (loading) {
    return <AchievementsSkeleton />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">実績一覧</h1>
      
      {summary && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>実績サマリー</CardTitle>
              <CardDescription>
                獲得済み: {summary.unlocked_achievements} / {summary.total_achievements}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary.progress_by_category).map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{categoryLabels[category]}</span>
                      <span>{data.unlocked} / {data.total}</span>
                    </div>
                    <Progress value={data.progress_percentage} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" onValueChange={setActiveCategory}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">すべて</TabsTrigger>
          {Object.keys(categoryLabels).map(category => (
            <TabsTrigger key={category} value={category}>
              {categoryLabels[category]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <Card className={`${achievement.unlocked ? 'border-2 border-green-500' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{achievement.title}</CardTitle>
          <Badge className={tierColors[achievement.tier]}>
            {achievement.tier}
          </Badge>
        </div>
        <CardDescription>{achievement.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>進捗状況</span>
            <span>{achievement.progress} / {achievement.progress_target}</span>
          </div>
          <Progress value={achievement.progress_percentage} />
          {achievement.unlocked && (
            <div className="text-sm text-green-600">
              獲得日: {new Date(achievement.unlocked_at!).toLocaleDateString()}
            </div>
          )}
          <div className="text-sm">
            <span className="font-medium">報酬:</span> {achievement.reward}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AchievementsSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 