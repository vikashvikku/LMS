"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateAnnouncementDialog } from "./CreateAnnouncementDialog";

export function ClientAnnouncementList({ initialData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const currentSearch = searchParams.get("search") || "";
  const currentAudience = searchParams.get("audience") || "all";
  const currentStatus = searchParams.get("status") || "all";
  const [sortOrder, setSortOrder] = useState("newest");

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/announcements?${params.toString()}`);
  };

  const sortedData = [...initialData].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "published": return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Published</Badge>;
      case "scheduled": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Scheduled</Badge>;
      case "draft": return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Draft</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAudienceBadge = (announcement) => {
    const { audience_type, program, section } = announcement;
    if (audience_type === 'everyone') return <Badge variant="secondary">Everyone</Badge>;
    if (audience_type === 'role') return <Badge variant="secondary">Specific Roles</Badge>; // Fallback if ever used
    if (audience_type === 'students') return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Students</Badge>;
    if (audience_type === 'faculty') return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Faculty</Badge>;
    if (audience_type === 'specific_program' && program) return <Badge variant="secondary">{program.name}</Badge>;
    if (audience_type === 'specific_section' && section) return <Badge variant="secondary">{section.name}</Badge>;
    return <Badge variant="outline" className="capitalize">{audience_type}</Badge>;
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <CardTitle className="text-xl">Announcements</CardTitle>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Announcement
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              defaultValue={currentSearch}
              className="pl-9 bg-background"
              onChange={(e) => {
                const val = e.target.value;
                const timeout = setTimeout(() => updateFilters("search", val), 500);
                return () => clearTimeout(timeout);
              }}
            />
          </div>
          <Select value={currentAudience} onValueChange={(val) => updateFilters("audience", val)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="All Audiences" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Audiences</SelectItem>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="students">Students</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
              <SelectItem value="specific_program">Specific Program</SelectItem>
              <SelectItem value="specific_section">Specific Section</SelectItem>
            </SelectContent>
          </Select>
          <Select value={currentStatus} onValueChange={(val) => updateFilters("status", val)}>
            <SelectTrigger className="w-full sm:w-[150px] bg-background">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full sm:w-[150px] bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {sortedData.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>TITLE</TableHead>
                  <TableHead>AUDIENCE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>PUBLISH DATE</TableHead>
                  <TableHead>CREATED BY</TableHead>
                  <TableHead>CREATED</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={item.title}>
                      {item.title}
                    </TableCell>
                    <TableCell>
                      {getAudienceBadge(item)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {item.published_at 
                        ? format(new Date(item.published_at), "dd MMM yyyy, p") 
                        : item.scheduled_at 
                          ? format(new Date(item.scheduled_at), "dd MMM yyyy, p")
                          : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {item.author?.first_name} {item.author?.last_name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(item.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/announcements/${item.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No announcements found</h3>
            <p className="text-muted-foreground mt-1 mb-6 max-w-sm">
              There are no announcements matching your current filters. Create a new one to get started.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Announcement
            </Button>
          </div>
        )}
      </CardContent>

      <CreateAnnouncementDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </Card>
  );
}
