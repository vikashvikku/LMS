"use client";
import { formatDate } from "@/lib/utils";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg shadow-sm p-4 text-sm text-foreground">
        <p className="font-semibold text-lg mb-1">{data.tooltipName}</p>
        <p className="text-muted-foreground font-medium mb-2">{data.courseName}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-muted-foreground">Score:</span>
          <span className="font-medium">{data.marks_obtained} / {data.max_marks}</span>
          
          <span className="text-muted-foreground">Percentage:</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">{data.percentage}%</span>
          
          <span className="text-muted-foreground">Graded:</span>
          <span className="font-medium">{formatDate(data.graded_at)}</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function GradesChart({ data }) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!data || data.length === 0 || !mounted) return null;

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  const gridStroke = isDark ? "#334155" : "#e2e8f0";
  const axisStroke = isDark ? "#94a3b8" : "#64748b";
  const lineStroke = isDark ? "#60a5fa" : "#2563eb";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
        <XAxis 
          dataKey="name" 
          stroke={axisStroke}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis 
          stroke={axisStroke} 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: axisStroke, strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Line 
          type="monotone" 
          dataKey="percentage" 
          stroke={lineStroke} 
          strokeWidth={3}
          activeDot={{ r: 6, fill: lineStroke, stroke: 'var(--background)', strokeWidth: 2 }} 
          dot={{ r: 4, fill: 'var(--background)', stroke: lineStroke, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
