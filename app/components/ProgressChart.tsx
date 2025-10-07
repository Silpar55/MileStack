"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ProgressData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

interface ProgressChartProps {
  type: "bar" | "line" | "doughnut";
  data: ProgressData;
  title?: string;
  className?: string;
}

export function ProgressChart({
  type,
  data,
  title,
  className,
}: ProgressChartProps) {
  const chartRef = useRef<any>(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales:
      type !== "doughnut"
        ? {
            y: {
              beginAtZero: true,
              max: 100,
            },
          }
        : undefined,
  };

  const renderChart = () => {
    switch (type) {
      case "bar":
        return <Bar ref={chartRef} data={data} options={options} />;
      case "line":
        return <Line ref={chartRef} data={data} options={options} />;
      case "doughnut":
        return <Doughnut ref={chartRef} data={data} options={options} />;
      default:
        return <Bar ref={chartRef} data={data} options={options} />;
    }
  };

  return <div className={`w-full h-64 ${className}`}>{renderChart()}</div>;
}

// Predefined chart configurations for common use cases
export const createProgressChart = (
  type: "progress" | "performance" | "completion"
) => {
  switch (type) {
    case "progress":
      return {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
          {
            label: "Progress %",
            data: [25, 45, 70, 85],
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
          },
        ],
      };
    case "performance":
      return {
        labels: ["Concept Explanation", "Skill Assessment", "Code Review"],
        datasets: [
          {
            label: "Score %",
            data: [85, 92, 78],
            backgroundColor: [
              "rgba(34, 197, 94, 0.5)",
              "rgba(34, 197, 94, 0.5)",
              "rgba(239, 68, 68, 0.5)",
            ],
            borderColor: [
              "rgba(34, 197, 94, 1)",
              "rgba(34, 197, 94, 1)",
              "rgba(239, 68, 68, 1)",
            ],
            borderWidth: 2,
          },
        ],
      };
    case "completion":
      return {
        labels: ["Completed", "In Progress", "Not Started"],
        datasets: [
          {
            label: "Pathways",
            data: [3, 2, 5],
            backgroundColor: [
              "rgba(34, 197, 94, 0.8)",
              "rgba(59, 130, 246, 0.8)",
              "rgba(156, 163, 175, 0.8)",
            ],
            borderColor: [
              "rgba(34, 197, 94, 1)",
              "rgba(59, 130, 246, 1)",
              "rgba(156, 163, 175, 1)",
            ],
            borderWidth: 2,
          },
        ],
      };
    default:
      return {
        labels: [],
        datasets: [],
      };
  }
};

// Learning pathway progress visualization
export function LearningPathwayProgressChart({
  pathwayData,
}: {
  pathwayData: any;
}) {
  const progressData = {
    labels: pathwayData.checkpoints.map(
      (c: any, index: number) => `Checkpoint ${index + 1}`
    ),
    datasets: [
      {
        label: "Completion %",
        data: pathwayData.checkpoints.map((c: any) =>
          c.isCompleted ? 100 : 0
        ),
        backgroundColor: pathwayData.checkpoints.map((c: any) =>
          c.isCompleted ? "rgba(34, 197, 94, 0.8)" : "rgba(156, 163, 175, 0.8)"
        ),
        borderColor: pathwayData.checkpoints.map((c: any) =>
          c.isCompleted ? "rgba(34, 197, 94, 1)" : "rgba(156, 163, 175, 1)"
        ),
        borderWidth: 2,
      },
    ],
  };

  return (
    <ProgressChart
      type="bar"
      data={progressData}
      title="Checkpoint Progress"
      className="h-48"
    />
  );
}

// Competency assessment performance chart
export function CompetencyPerformanceChart({
  assessmentData,
}: {
  assessmentData: any[];
}) {
  const performanceData = {
    labels: assessmentData.map((a) => a.assessmentType.replace("-", " ")),
    datasets: [
      {
        label: "Comprehension Score",
        data: assessmentData.map((a) => a.comprehensionScore),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
      },
      {
        label: "Accuracy Score",
        data: assessmentData.map((a) => a.accuracyScore),
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <ProgressChart
      type="line"
      data={performanceData}
      title="Assessment Performance Over Time"
      className="h-64"
    />
  );
}

// Learning pathway category distribution
export function PathwayCategoryChart({ pathways }: { pathways: any[] }) {
  const categories = pathways.reduce((acc, pathway) => {
    acc[pathway.category] = (acc[pathway.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = {
    labels: Object.keys(categories).map((cat) => cat.replace("-", " ")),
    datasets: [
      {
        label: "Pathways",
        data: Object.values(categories) as number[],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(6, 182, 212, 0.8)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(6, 182, 212, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <ProgressChart
      type="doughnut"
      data={categoryData}
      title="Pathway Categories"
      className="h-64"
    />
  );
}
