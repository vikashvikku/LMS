"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Eye } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

export function ClientCourseGrid({ 
  initialData, 
  programs,
  currentSearch, 
  currentProgram,
  currentSemester,
  currentStatus, 
  currentType,
  currentSort 
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentSearch || "");

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

    params.set("page", "1");
    router.push(`/admin/courses?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`/admin/courses?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full xl:max-w-sm flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
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
                value={currentProgram || "all"} 
                onValueChange={(val) => updateFilters({ programId: val })}
              >
                <SelectTrigger className="w-full sm:w-[160px] bg-background">
                  <SelectValue placeholder="All Programs" />
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
              value={currentSemester || "all"} 
              onValueChange={(val) => updateFilters({ semester: val })}
            >
              <SelectTrigger className="w-[120px] bg-background">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={currentType || "all"} 
              onValueChange={(val) => updateFilters({ type: val })}
            >
              <SelectTrigger className="w-[120px] bg-background">
                <SelectValue placeholder="Course Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Core">Core</SelectItem>
                <SelectItem value="Elective">Elective</SelectItem>
                <SelectItem value="Lab">Lab</SelectItem>
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
              <SelectTrigger className="w-[130px] bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
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
                <TableHead className="w-[250px]">COURSE</TableHead>
                <TableHead>CODE</TableHead>
                <TableHead>PROGRAM</TableHead>
                <TableHead>SEMESTER</TableHead>
                <TableHead className="text-center">CREDITS</TableHead>
                <TableHead>FACULTY</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.records.length > 0 ? (
                initialData.records.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{course.title}</span>
                        <span className="text-xs text-muted-foreground">{course.type || 'Core'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-background">
                        {course.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{course.program_name}</TableCell>
                    <TableCell>Semester {course.semester || 1}</TableCell>
                    <TableCell className="text-center">{course.credits || 3}</TableCell>
                    <TableCell>
                      {course.faculty_list.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {course.faculty_list.map((f, i) => (
                            <span key={i} className="text-sm">{f}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.is_active ? "outline" : "secondary"} className={!course.is_active ? "bg-red-100 text-red-800 border-transparent dark:bg-red-900/50 dark:text-red-300" : "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900"}>
                        {course.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="h-8 gap-1">
                        <Link href={`/admin/courses/${course.id}`}>
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No courses found.
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
