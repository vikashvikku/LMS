"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Eye, Building } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ClientSectionGrid({ 
  initialData, 
  programs,
  courses,
  semesters,
  currentSearch, 
  currentProgram,
  currentCourse,
  currentSemester,
  currentStatus, 
  currentSort 
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentSearch || "");
  const [selectedProgram, setSelectedProgram] = useState(currentProgram || "all");

  const filteredCourses = selectedProgram && selectedProgram !== "all" 
    ? courses.filter(c => c.program_id === selectedProgram)
    : courses;

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(window.location.search);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
      }
    });

    if (newFilters.programId && newFilters.programId !== currentProgram) {
      params.delete("courseId"); // Reset course if program changes
    }

    params.set("page", "1");
    router.push(`/admin/sections?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`/admin/sections?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full xl:max-w-sm flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sections by name or code..."
              className="pl-9 pr-4 w-full bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" className="sr-only">Search</Button>
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select 
                value={selectedProgram} 
                onValueChange={(val) => {
                  setSelectedProgram(val);
                  updateFilters({ programId: val });
                }}
              >
                <SelectTrigger className="w-[160px] bg-background">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select 
              value={currentCourse || "all"} 
              onValueChange={(val) => updateFilters({ courseId: val })}
              disabled={!selectedProgram || selectedProgram === "all"}
            >
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Course / Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {filteredCourses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={currentSemester || "all"} 
              onValueChange={(val) => updateFilters({ semesterId: val })}
            >
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Academic Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                {semesters.map(sem => (
                  <SelectItem key={sem.id} value={sem.id}>{sem.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={currentStatus || "all"} 
              onValueChange={(val) => updateFilters({ status: val })}
            >
              <SelectTrigger className="w-[120px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={currentSort || "newest"} 
              onValueChange={(val) => updateFilters({ sort: val })}
            >
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="most_students">Most Students</SelectItem>
                <SelectItem value="least_students">Least Students</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>SECTION</TableHead>
                <TableHead>PROGRAM</TableHead>
                <TableHead>COURSE / SUBJECT</TableHead>
                <TableHead>ACADEMIC PERIOD</TableHead>
                <TableHead className="text-center w-[160px]">CAPACITY</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.records.length > 0 ? (
                initialData.records.map((section) => {
                  const capacityPercent = (section.students_count / section.capacity) * 100;
                  const isFull = section.students_count >= section.capacity;
                  
                  return (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{section.name}</span>
                          {section.code && <span className="text-xs text-muted-foreground font-mono">{section.code}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{section.program_name}</TableCell>
                      <TableCell>{section.subject_name}</TableCell>
                      <TableCell>{section.semester_name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col gap-1.5 px-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>{section.students_count} / {section.capacity}</span>
                            <span className={isFull ? "text-destructive font-medium" : "text-muted-foreground"}>
                              {isFull ? "Full" : `${section.capacity - section.students_count} left`}
                            </span>
                          </div>
                          <Progress value={capacityPercent} className={isFull ? "[&>div]:bg-destructive" : ""} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={section.is_active ? "outline" : "secondary"} className={!section.is_active ? "bg-red-100 text-red-800 border-transparent dark:bg-red-900/50 dark:text-red-300" : "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900"}>
                          {section.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm" className="h-8 gap-1">
                          <Link href={`/admin/sections/${section.id}`}>
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Building className="h-8 w-8 mb-2 opacity-20" />
                      <p>No sections match your filters.</p>
                      <p className="text-sm mt-1">Create a section to organize students and academic delivery.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {initialData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(initialData.page - 1) * initialData.pageSize + 1}</span> to <span className="font-medium">{Math.min(initialData.page * initialData.pageSize, initialData.totalCount)}</span> of <span className="font-medium">{initialData.totalCount}</span> results
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(initialData.page - 1)}
              disabled={initialData.page <= 1}
            >
              Previous
            </Button>
            <div className="text-sm font-medium px-2">
              Page {initialData.page} of {initialData.totalPages}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(initialData.page + 1)}
              disabled={initialData.page >= initialData.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
