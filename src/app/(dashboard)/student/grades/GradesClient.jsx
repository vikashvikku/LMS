"use client";
import { formatDate } from "@/lib/utils";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, TrendingUp, BookOpen, Target, Award } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GradesChart from "./GradesChart";

export default function GradesClient({ initialGrades }) {
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Derive unique courses and types for filters
  const courses = useMemo(() => [...new Set(initialGrades.map(g => g.course_code))], [initialGrades]);
  
  // Try to infer type from title (Assignment, Quiz, Mid Term, etc.)
  const inferType = (title) => {
    const t = title.toLowerCase();
    if (t.includes('assignment')) return 'Assignment';
    if (t.includes('quiz')) return 'Quiz';
    if (t.includes('mid term') || t.includes('midterm')) return 'Mid Term';
    if (t.includes('project')) return 'Project';
    return 'Other';
  };
  
  const types = useMemo(() => [...new Set(initialGrades.map(g => inferType(g.assignment_title)))], [initialGrades]);

  // Filter and sort logic
  const filteredAndSortedGrades = useMemo(() => {
    let result = [...initialGrades];

    // Apply Course Filter
    if (courseFilter !== "all") {
      result = result.filter(g => g.course_code === courseFilter);
    }

    // Apply Type Filter
    if (typeFilter !== "all") {
      result = result.filter(g => inferType(g.assignment_title) === typeFilter);
    }

    // Apply Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.graded_at).getTime();
      const dateB = new Date(b.graded_at).getTime();
      const pctA = (a.marks_obtained / a.max_marks) * 100;
      const pctB = (b.marks_obtained / b.max_marks) * 100;

      switch (sortBy) {
        case "newest": return dateB - dateA;
        case "oldest": return dateA - dateB;
        case "highest": return pctB - pctA;
        case "lowest": return pctA - pctB;
        default: return 0;
      }
    });

    return result;
  }, [initialGrades, courseFilter, typeFilter, sortBy]);

  // Summary Calculations
  const summary = useMemo(() => {
    if (initialGrades.length === 0) return null;
    
    let totalPct = 0;
    let highestPct = 0;
    const uniqueCourses = new Set();

    initialGrades.forEach(g => {
      const pct = (g.marks_obtained / g.max_marks) * 100;
      totalPct += pct;
      if (pct > highestPct) highestPct = pct;
      uniqueCourses.add(g.course_code);
    });

    return {
      average: (totalPct / initialGrades.length).toFixed(1),
      totalGraded: initialGrades.length,
      highestScore: highestPct.toFixed(1),
      coursesCount: uniqueCourses.size
    };
  }, [initialGrades]);

  // Format data for Recharts (always chronologically sorted for the chart regardless of table sort)
  const chartData = useMemo(() => {
    const chronoSorted = [...filteredAndSortedGrades].sort((a, b) => new Date(a.graded_at).getTime() - new Date(b.graded_at).getTime());
    return chronoSorted.map((g, index) => ({
      name: `A${index + 1}`,
      tooltipName: g.assignment_title,
      courseName: g.course_title,
      percentage: parseFloat(((g.marks_obtained / g.max_marks) * 100).toFixed(1)),
      marks_obtained: g.marks_obtained,
      max_marks: g.max_marks,
      graded_at: g.graded_at
    }));
  }, [filteredAndSortedGrades]);

  if (initialGrades.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 text-center mt-8">
        <GraduationCap className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-foreground">No Grades Available</h2>
        <p className="text-muted-foreground max-w-sm mt-2">
          You do not have any released grades yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-8 mt-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Overall Average</p>
              <p className="text-2xl font-bold">{summary.average}%</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Highest Score</p>
              <p className="text-2xl font-bold">{summary.highestScore}%</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Assessments</p>
              <p className="text-2xl font-bold">{summary.totalGraded}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-full">
              <Target className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Courses</p>
              <p className="text-2xl font-bold">{summary.coursesCount}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-full">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Your chronological scores across assessments as a percentage.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <GradesChart data={chartData} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No data available for the selected filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters & Results */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Detailed Results</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[140px] sm:w-[160px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] sm:w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] sm:w-[160px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Score</SelectItem>
                <SelectItem value="lowest">Lowest Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredAndSortedGrades.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border rounded-lg bg-muted/20">
            No assessments match your filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedGrades.map((grade) => {
              const percentage = ((grade.marks_obtained / grade.max_marks) * 100).toFixed(1);
              const numPct = Number(percentage);
              
              let badgeColor = "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
              if (numPct < 60) badgeColor = "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
              else if (numPct < 80) badgeColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";

              return (
                <Card key={grade.id} className="flex flex-col transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <Badge variant="outline" className="bg-background max-w-[150px] truncate">{grade.course_code}</Badge>
                      <Badge className={badgeColor + " border-transparent font-semibold shadow-none"}>{percentage}%</Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight line-clamp-2">{grade.assignment_title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <CardDescription className="line-clamp-1 flex-1">{grade.course_title}</CardDescription>
                      <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded text-muted-foreground capitalize">
                        {inferType(grade.assignment_title)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4 flex flex-col justify-end">
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-3xl font-bold text-foreground">{grade.marks_obtained}</span>
                      <span className="text-sm font-medium text-muted-foreground">/ {grade.max_marks}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      Graded on {formatDate(grade.graded_at)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
