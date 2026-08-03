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

export function ClientProgramGrid({ initialData, currentSearch, currentStatus, currentSort }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentSearch || "");

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(window.location.search);
    
    if (newFilters.search !== undefined) {
      if (newFilters.search) params.set("search", newFilters.search);
      else params.delete("search");
    }
    
    if (newFilters.status !== undefined) {
      if (newFilters.status) params.set("status", newFilters.status);
      else params.delete("status");
    }
    
    if (newFilters.sort !== undefined) {
      if (newFilters.sort) params.set("sort", newFilters.sort);
      else params.delete("sort");
    }

    params.set("page", "1");
    router.push(`/admin/programs?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`/admin/programs?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search programs by name or code..."
              className="pl-9 pr-4 w-full bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" className="sr-only">Search</Button>
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select 
                value={currentStatus || "all"} 
                onValueChange={(val) => updateFilters({ status: val === "all" ? "" : val })}
              >
                <SelectTrigger className="w-full sm:w-[150px] bg-background">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select 
              value={currentSort || "newest"} 
              onValueChange={(val) => updateFilters({ sort: val })}
            >
              <SelectTrigger className="w-full sm:w-[150px] bg-background">
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
                <TableHead className="w-[300px]">PROGRAM</TableHead>
                <TableHead>CODE</TableHead>
                <TableHead>DEPARTMENT</TableHead>
                <TableHead>DURATION</TableHead>
                <TableHead className="text-center">COURSES</TableHead>
                <TableHead className="text-center">STUDENTS</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.records.length > 0 ? (
                initialData.records.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{program.name}</span>
                        <span className="text-xs text-muted-foreground">{program.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-background">
                        {program.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{program.department_name || '—'}</TableCell>
                    <TableCell>{program.duration ? `${program.duration} ${program.duration_unit || ''}` : '—'}</TableCell>
                    <TableCell className="text-center">{program.courses_count}</TableCell>
                    <TableCell className="text-center">{program.students_count}</TableCell>
                    <TableCell>
                      <Badge variant={program.is_active ? "outline" : "secondary"} className={!program.is_active ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300 border-transparent" : "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900"}>
                        {program.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="h-8 gap-1">
                        <Link href={`/admin/programs/${program.id}`}>
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
                    No programs found.
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
