import { getAdminSectionById, getAdminSections } from "@/lib/data/admin";
import { requireRole } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building, BookOpen, Clock, Users, GraduationCap, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { ClientEditSectionDialog } from "./ClientEditSectionDialog";
import { ClientSectionStatusToggle } from "./ClientSectionStatusToggle";
import { ClientAssignStudentDialog } from "./ClientAssignStudentDialog";
import { ClientStudentActions } from "./ClientStudentActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Section Details | Admin Portal",
};

export default async function AdminSectionDetailsPage(props) {
  const { id: sectionId } = await props.params;
  const profile = await requireRole(["university_admin", "super_admin"]);
  const section = await getAdminSectionById(sectionId);

  if (!section) {
    notFound();
  }

  // Find all active sections for the same course to allow moving students
  const siblingSectionsResponse = await getAdminSections({ courseId: section.subject?.id, pageSize: 100 });
  const siblingSections = siblingSectionsResponse.records?.filter(s => s.id !== section.id && s.is_active) || [];

  // Fetch active students in the organization
  const supabase = await createClient();
  const { data: eligibleStudentsData } = await supabase
    .from('profiles')
    .select(`
      id, first_name, last_name, avatar_url
    `)
    .eq('role', 'student')
    .eq('organization_id', profile.organization_id)
    .eq('is_active', true);

  // Exclude already enrolled students
  const enrolledStudentIds = new Set(section.enrollments.map(e => e.student.id));
  const eligibleStudents = eligibleStudentsData?.filter(s => !enrolledStudentIds.has(s.id)) || [];

  const capacityPercent = (section.stats.studentsCount / section.capacity) * 100;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/admin/sections" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Sections
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {section.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {section.code && <Badge variant="outline" className="font-mono text-sm">{section.code}</Badge>}
              <Badge variant={section.is_active ? "outline" : "secondary"} className={!section.is_active ? "bg-red-100 text-red-800 border-transparent" : "bg-emerald-50 text-emerald-700 border-emerald-200"}>
                {section.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" />
                {section.program?.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClientEditSectionDialog section={section} />
            <ClientSectionStatusToggle sectionId={section.id} isActive={section.is_active} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left Column: Details & Capacity */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                Section Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Course / Subject</p>
                <p className="font-medium text-foreground">{section.subject?.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{section.subject?.code}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Academic Period</p>
                <p className="font-medium text-foreground">{section.semester?.name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Assigned Faculty</p>
                {section.faculty.length > 0 ? (
                  <div className="flex flex-col gap-1 mt-1">
                    {section.faculty.map(f => (
                      <span key={f.id} className="font-medium text-foreground text-sm">
                        {f.first_name} {f.last_name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">None assigned</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-bold text-foreground">{section.stats.studentsCount}</span>
                    <span className="text-muted-foreground ml-1">/ {section.capacity}</span>
                  </div>
                  <span className={`text-sm font-medium ${section.stats.capacityFull ? 'text-destructive' : 'text-emerald-600'}`}>
                    {section.stats.capacityFull ? 'Full' : `${section.stats.seatsAvailable} available`}
                  </span>
                </div>
                <Progress value={capacityPercent} className={section.stats.capacityFull ? "[&>div]:bg-destructive" : ""} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Students */}
        <div className="md:col-span-3 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    Enrolled Students
                  </CardTitle>
                  <CardDescription>Students currently assigned to this section.</CardDescription>
                </div>
                <ClientAssignStudentDialog 
                  sectionId={section.id} 
                  eligibleStudents={eligibleStudents} 
                  isFull={section.stats.capacityFull}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {section.enrollments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>STUDENT</TableHead>
                        <TableHead>PROGRAM</TableHead>
                        <TableHead>JOINED</TableHead>
                        <TableHead className="text-right">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {section.enrollments.map(enroll => {
                        const stu = enroll.student;
                        return (
                          <TableRow key={enroll.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                {stu.avatar_url ? (
                                  <img src={stu.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                    {stu.first_name[0]}{stu.last_name[0]}
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span>{stu.first_name} {stu.last_name}</span>
                                  <span className="text-xs text-muted-foreground">{stu.id?.split('-')[0].toUpperCase()}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {section.program?.name}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(enroll.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <ClientStudentActions 
                                enrollmentId={enroll.id} 
                                sectionId={section.id} 
                                studentId={stu.id}
                                siblingSections={siblingSections}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium text-foreground">No students enrolled yet.</p>
                  <p className="text-sm mt-1">Assign students to fill the capacity.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
