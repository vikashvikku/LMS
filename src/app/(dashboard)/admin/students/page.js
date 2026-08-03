import { getAdminStudents, getStudentStatistics } from "@/lib/data/admin";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, ChevronLeft, ChevronRight, Eye, UserCheck, UserMinus, Clock } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata = {
  title: "Student Management | Admin Portal",
};

export default async function AdminStudentsPage(props) {
  const searchParams = await props.searchParams;
  const profile = await requireRole(["university_admin", "super_admin"]);
  
  const page = parseInt(searchParams?.page) || 1;
  const search = searchParams?.q || "";
  const status = searchParams?.status || "";
  const sort = searchParams?.sort || "newest";
  
  const [stats, { records, totalCount, totalPages }] = await Promise.all([
    getStudentStatistics(profile),
    getAdminStudents({ page, pageSize: 10, search, status, sort })
  ]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-8 w-8" />
            Student Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage student accounts, enrollment information, and academic access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/admin/students/new">
              <Users className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
            <UserMinus className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Added</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentlyAdded}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">Student List <Badge variant="secondary" className="font-normal">{totalCount}</Badge></CardTitle>
            
            <form className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto" method="GET" action="/admin/students">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  name="q" 
                  defaultValue={search} 
                  placeholder="Search by name..." 
                  className="pl-9 h-9" 
                />
              </div>
              <select 
                name="status" 
                defaultValue={status} 
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="completed">Completed</option>
                <option value="unenrolled">Unenrolled</option>
              </select>
              <select 
                name="sort" 
                defaultValue={sort} 
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
              </select>
              <Button type="submit" size="sm" variant="secondary">Filter</Button>
            </form>
          </div>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Program</th>
                <th className="px-6 py-4 font-semibold">Section</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.length > 0 ? (
                records.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={student.avatar_url || ''} />
                          <AvatarFallback>{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{student.first_name} {student.last_name}</span>
                          <span className="text-xs text-muted-foreground max-w-[200px] truncate">{student.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {student.program_name || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {student.course_code ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{student.course_code}</span>
                          <span className="text-xs">{student.section_name}</span>
                        </div>
                      ) : 'Not assigned'}
                    </td>
                    <td className="px-6 py-4">
                      {student.is_active ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(student.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/students/${student.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="font-medium text-foreground">No students found.</p>
                    <p className="text-sm">Student accounts for this organization will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page <= 1}
                asChild={page > 1}
              >
                {page > 1 ? (
                  <Link href={`/admin/students?page=${page - 1}${search ? `&q=${encodeURIComponent(search)}` : ''}${status ? `&status=${encodeURIComponent(status)}` : ''}`}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Link>
                ) : (
                  <><ChevronLeft className="h-4 w-4 mr-1" /> Previous</>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page >= totalPages}
                asChild={page < totalPages}
              >
                {page < totalPages ? (
                  <Link href={`/admin/students?page=${page + 1}${search ? `&q=${encodeURIComponent(search)}` : ''}${status ? `&status=${encodeURIComponent(status)}` : ''}`}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                ) : (
                  <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
