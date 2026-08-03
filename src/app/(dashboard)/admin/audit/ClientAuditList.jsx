"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye, Activity } from "lucide-react";


function getHumanDescription(item) {
  const { action, entity_type, metadata } = item;
  
  let verb = "Modified";
  if (action === "INSERT") verb = "Created";
  if (action === "DELETE") verb = "Deleted";

  const entityNames = {
    profiles: "User Profile",
    programs: "Program",
    courses: "Course",
    subjects: "Subject",
    sections: "Section",
    announcements: "Announcement",
    payments: "Payment",
    student_enrollments: "Enrollment",
    faculty_assignments: "Faculty Assignment",
    timetable_entries: "Timetable Entry",
    fee_structures: "Fee Structure",
  };
  let moduleName = entityNames[entity_type] || entity_type;

  let specific = "";
  if (metadata) {
    if (metadata.title) specific = `"${metadata.title}"`;
    else if (metadata.name) specific = `"${metadata.name}"`;
    else if (metadata.first_name) specific = `for ${metadata.first_name} ${metadata.last_name || ''}`;
    else if (metadata.amount) specific = `amount ₹${metadata.amount}`;
  }

  return `${verb} ${moduleName} ${specific}`.trim();
}

function getActionBadge(action) {
  switch (action) {
    case 'INSERT': return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Created</Badge>;
    case 'UPDATE': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Updated</Badge>;
    case 'DELETE': return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200">Deleted</Badge>;
    default: return <Badge variant="outline">{action}</Badge>;
  }
}

export function ClientAuditList({ initialData, totalCount, currentPage, hasAnyRecords }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedLog, setSelectedLog] = useState(null);

  const currentModule = searchParams.get("module") || "all";
  const currentAction = searchParams.get("action") || "all";
  const currentSort = searchParams.get("sort") || "newest";

  const totalPages = Math.ceil(totalCount / 20);

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") {
      params.set("page", "1"); // Reset to page 1 on filter change
    }
    router.push(`/admin/audit?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateFilters("page", newPage.toString());
  };

  return (
    <>
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <CardTitle className="text-xl">Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row gap-4">
            
            <Select value={currentModule} onValueChange={(val) => updateFilters("module", val)}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="announcements">Announcements</SelectItem>
                <SelectItem value="profiles">Users & Profiles</SelectItem>
                <SelectItem value="programs">Programs</SelectItem>
                <SelectItem value="courses">Courses</SelectItem>
                <SelectItem value="subjects">Subjects</SelectItem>
                <SelectItem value="sections">Sections</SelectItem>
                <SelectItem value="student_enrollments">Enrollments</SelectItem>
                <SelectItem value="faculty_assignments">Faculty Assignments</SelectItem>
                <SelectItem value="timetable_entries">Timetable</SelectItem>
                <SelectItem value="fee_structures">Fee Structures</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
              </SelectContent>
            </Select>

            <Select value={currentAction} onValueChange={(val) => updateFilters("action", val)}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="INSERT">Creates</SelectItem>
                <SelectItem value="UPDATE">Updates</SelectItem>
                <SelectItem value="DELETE">Deletions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={currentSort} onValueChange={(val) => updateFilters("sort", val)}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {initialData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>USER</TableHead>
                    <TableHead>ACTION</TableHead>
                    <TableHead>DETAILS</TableHead>
                    <TableHead>DATE & TIME</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.actor ? `${item.actor.first_name} ${item.actor.last_name}` : "System / Unknown"}
                        {item.actor && <div className="text-xs text-muted-foreground capitalize">{item.actor.role.replace('_', ' ')}</div>}
                      </TableCell>
                      <TableCell>
                        {getActionBadge(item.action)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{item.entity_type}</span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {getHumanDescription(item)}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                        {format(new Date(item.created_at), "dd MMM yyyy")}
                        <div className="text-xs mt-0.5">{format(new Date(item.created_at), "p")}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(item)}>
                          <Eye className="h-4 w-4 mr-2" /> View
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
                <Activity className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {!hasAnyRecords ? "No activity recorded yet" : "No activities match your current filters"}
              </h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                {!hasAnyRecords 
                  ? "There are no audit logs recorded in your organization. Perform an administrative action to see it here."
                  : "Try adjusting your module or action filters to find what you're looking for."}
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
            <DialogDescription>
              Complete audit log entry information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Performed By</h4>
                  <div className="text-sm font-medium">
                    {selectedLog.actor ? `${selectedLog.actor.first_name} ${selectedLog.actor.last_name}` : "Unknown"}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Action</h4>
                  <div>{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Module / Entity</h4>
                  <div className="text-sm font-medium">{selectedLog.entity_type}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Date & Time</h4>
                  <div className="text-sm">{format(new Date(selectedLog.created_at), "dd MMM yyyy, p")}</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <div className="text-sm p-3 bg-muted rounded-md">
                  {getHumanDescription(selectedLog)}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Entity ID</h4>
                <div className="text-xs font-mono p-2 bg-muted/50 rounded-md truncate">
                  {selectedLog.entity_id}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Metadata Snapshot</h4>
                <div className="h-[200px] w-full rounded-md border border-border bg-muted/30 p-4 overflow-y-auto">
                  <pre className="text-xs font-mono">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
