"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  Star,
  Trophy,
  Zap,
  Coffee,
  BookOpen,
  Headphones,
  ShoppingBag,
} from "lucide-react";

export default function RewardsPage() {
  const rewards = [
    {
      id: 1,
      title: "Coffee Shop Gift Card",
      description: "$10 gift card to your favorite coffee shop",
      points: 500,
      category: "Lifestyle",
      icon: Coffee,
      available: true,
    },
    {
      id: 2,
      title: "Premium Course Access",
      description: "Unlock advanced courses for 30 days",
      points: 1000,
      category: "Learning",
      icon: BookOpen,
      available: true,
    },
    {
      id: 3,
      title: "Noise-Canceling Headphones",
      description: "High-quality headphones for focused learning",
      points: 2500,
      category: "Electronics",
      icon: Headphones,
      available: true,
    },
    {
      id: 4,
      title: "Milestack Merchandise",
      description: "Official Milestack t-shirt and stickers",
      points: 300,
      category: "Merchandise",
      icon: ShoppingBag,
      available: true,
    },
    {
      id: 5,
      title: "1-on-1 Mentoring Session",
      description: "30-minute session with a senior developer",
      points: 1500,
      category: "Learning",
      icon: Star,
      available: false,
    },
    {
      id: 6,
      title: "Conference Ticket",
      description: "Free ticket to a tech conference",
      points: 5000,
      category: "Events",
      icon: Trophy,
      available: false,
    },
  ];

  const userPoints = 8420;
  const redeemedRewards = [
    { id: 1, title: "Coffee Shop Gift Card", date: "2024-01-10", points: 500 },
    { id: 2, title: "Milestack Merchandise", date: "2024-01-05", points: 300 },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Lifestyle":
        return "bg-pink-100 text-pink-800";
      case "Learning":
        return "bg-blue-100 text-blue-800";
      case "Electronics":
        return "bg-purple-100 text-purple-800";
      case "Merchandise":
        return "bg-green-100 text-green-800";
      case "Events":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRedeem = (rewardId: number) => {
    console.log("Redeeming reward:", rewardId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Rewards Shop</h1>
          <p className="text-muted-foreground">
            Redeem your points for amazing rewards and experiences
          </p>
        </div>

        {/* Points Balance */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Your Points Balance
                </h3>
                <div className="flex items-center">
                  <Zap className="w-6 h-6 text-yellow-500 mr-2" />
                  <span className="text-3xl font-bold text-primary">
                    {userPoints.toLocaleString()}
                  </span>
                  <span className="text-lg text-muted-foreground ml-2">
                    points
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Available for redemption
                </p>
                <p className="text-sm text-green-600 font-medium">
                  {rewards.filter((r) => r.available).length} rewards available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {rewards.map((reward) => {
            const Icon = reward.icon;
            const canAfford = userPoints >= reward.points;

            return (
              <Card
                key={reward.id}
                className={`${
                  !reward.available ? "opacity-50" : ""
                } hover:shadow-lg transition-shadow`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {reward.title}
                        </CardTitle>
                        <Badge className={getCategoryColor(reward.category)}>
                          {reward.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reward.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-semibold">
                        {reward.points.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">
                        points
                      </span>
                    </div>
                    {!reward.available && (
                      <Badge variant="outline" className="text-red-600">
                        Coming Soon
                      </Badge>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    disabled={!reward.available || !canAfford}
                    onClick={() => handleRedeem(reward.id)}
                    variant={
                      canAfford && reward.available ? "default" : "outline"
                    }
                  >
                    {!reward.available
                      ? "Coming Soon"
                      : !canAfford
                      ? "Not Enough Points"
                      : "Redeem Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Redeemed Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="w-5 h-5 mr-2" />
              Your Redeemed Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {redeemedRewards.length > 0 ? (
              <div className="space-y-3">
                {redeemedRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{reward.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Redeemed on {new Date(reward.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        -{reward.points} points
                      </p>
                      <Badge variant="outline" className="text-green-600">
                        Redeemed
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  You haven&apos;t redeemed any rewards yet. Start earning
                  points to unlock amazing rewards!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
