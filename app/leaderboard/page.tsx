"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";

export default function LeaderboardPage() {
  const leaderboard = [
    {
      rank: 1,
      name: "Alex Chen",
      university: "MIT",
      points: 2450,
      change: "up",
      changeAmount: 120,
    },
    {
      rank: 2,
      name: "Maria Silva",
      university: "Stanford",
      points: 2380,
      change: "up",
      changeAmount: 85,
    },
    {
      rank: 3,
      name: "James Park",
      university: "Berkeley",
      points: 2290,
      change: "down",
      changeAmount: 15,
    },
    {
      rank: 4,
      name: "Sarah Johnson",
      university: "Harvard",
      points: 2150,
      change: "up",
      changeAmount: 200,
    },
    {
      rank: 5,
      name: "David Kim",
      university: "CMU",
      points: 2080,
      change: "up",
      changeAmount: 150,
    },
    {
      rank: 6,
      name: "Emma Wilson",
      university: "Princeton",
      points: 1950,
      change: "down",
      changeAmount: 30,
    },
    {
      rank: 7,
      name: "Michael Brown",
      university: "Yale",
      points: 1820,
      change: "up",
      changeAmount: 90,
    },
    {
      rank: 8,
      name: "Lisa Zhang",
      university: "Columbia",
      points: 1750,
      change: "up",
      changeAmount: 75,
    },
    {
      rank: 9,
      name: "Ryan Davis",
      university: "UCLA",
      points: 1680,
      change: "down",
      changeAmount: 25,
    },
    {
      rank: 10,
      name: "Anna Garcia",
      university: "NYU",
      points: 1620,
      change: "up",
      changeAmount: 110,
    },
    {
      rank: 342,
      name: "John Doe",
      university: "Stanford University",
      points: 420,
      change: "up",
      changeAmount: 45,
    },
  ];

  const getChangeIcon = (change: string) => {
    return change === "up" ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getChangeColor = (change: string) => {
    return change === "up" ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Global Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank against students worldwide
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {leaderboard.slice(0, 3).map((player, index) => (
          <Card
            key={player.rank}
            className={`${
              index === 0
                ? "md:order-2"
                : index === 1
                ? "md:order-1"
                : "md:order-3"
            } ${index === 0 ? "ring-2 ring-yellow-400" : ""}`}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-800"
                      : index === 1
                      ? "bg-gray-100 text-gray-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </div>
              </div>
              <CardTitle className="text-xl">{player.name}</CardTitle>
              <p className="text-muted-foreground">{player.university}</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {player.points.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">points</p>
              <div className="flex items-center justify-center mt-2">
                {getChangeIcon(player.change)}
                <span
                  className={`text-sm ml-1 ${getChangeColor(player.change)}`}
                >
                  {player.changeAmount} this week
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((player, index) => (
              <div
                key={player.rank}
                className={`p-4 rounded-lg flex items-center justify-between ${
                  player.rank === 342
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold w-8 text-lg">
                      #{player.rank}
                    </span>
                    {player.rank <= 3 && (
                      <span className="text-lg">
                        {player.rank === 1
                          ? "🥇"
                          : player.rank === 2
                          ? "🥈"
                          : "🥉"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {player.university}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {player.points.toLocaleString()} pts
                    </p>
                    <div className="flex items-center justify-end">
                      {getChangeIcon(player.change)}
                      <span
                        className={`text-sm ml-1 ${getChangeColor(
                          player.change
                        )}`}
                      >
                        {player.changeAmount}
                      </span>
                    </div>
                  </div>
                  {player.rank <= 10 && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700"
                    >
                      Top 10
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-sm text-muted-foreground">Total Participants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">342</div>
            <p className="text-sm text-muted-foreground">Your Current Rank</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold">45</div>
            <p className="text-sm text-muted-foreground">
              Points Gained This Week
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
