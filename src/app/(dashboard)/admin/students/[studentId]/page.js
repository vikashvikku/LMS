import { getAdminStudentById } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, GraduationCap, Building, Calendar, BookOpen, Clock, AlertCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ClientActivationToggle } from "./ClientActivationToggle";
import { ClientEnrollmentManager } from "./ClientEnrollmentManager";
import { ClientEditAssignmentDialog } from "./ClientEditAssignmentDialog";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Student Details | Admin Portal",
};

export default async function AdminStudentDetailsPage(props) {
  const { studentId } = await props.params;
  const student = await getAdminStudentById(studentId);

  if (!student) {
    notFound();
  }

  // Fetch programs for editing academic assignment
  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();
  const { data: programs } = await supabase
    .from('programs')
    .select(`
      id, name, code,
      departments!inner(organization_id),
      courses (
        title, code,
        subjects (
          code,
          sections (
            id, name, capacity,
            semesters!inner(academic_years!inner(is_active))
          )
        )
      )
    `)
    .eq('departments.organization_id', profile.organization_id)
    .eq('courses.subjects.sections.semesters.academic_years.is_active', true);

  const programsWithSections = (programs || []).map(p => ({
    id: p.id,
    name: p.name,
    code: p.code,
    courses: p.courses?.map(c => ({
      title: c.title,
      code: c.code,
      subjects: c.subjects?.map(s => ({
        code: s.code,
        sections: s.sections?.filter(sec => sec.semesters)
      })).filter(s => s.sections && s.sections.length > 0)
    })).filter(c => c.subjects && c.subjects.length > 0)
  })).filter(p => p.courses && p.courses.length > 0);


  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/admin/students" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Students
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center border ${student.is_active ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {student.first_name} {student.last_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={student.is_active ? "outline" : "secondary"} className={!student.is_active ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300 border-transparent" : ""}>
                  {student.is_active ? 'Active Account' : 'Suspended Account'}
                </Badge>
                <span className="text-sm text-muted-foreground">Joined {new Date(student.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button disabled variant="outline" className="opacity-50 cursor-not-allowed">
              Edit Student
            </Button>
            <ClientActivationToggle 
              studentId={student.id} 
              isActive={student.is_active} 
              studentName={`${student.first_name} ${student.last_name}`} 
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Personal/System Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name</p>
                <p className="font-medium text-foreground">{student.first_name} {student.last_name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Contact (System)</p>
                <p className="font-medium text-foreground">Auth linked (Email derived from Auth if extended)</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> System ID</p>
                <p className="text-xs font-mono text-muted-foreground break-all">{student.id}</p>
              </div>
            </CardContent>
          </Card>

          {!student.is_active && (
            <Card className="shadow-sm border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-400">
                    <p className="font-medium mb-1">Account Suspended</p>
                    <p className="text-red-700/80 dark:text-red-500/80">This student cannot log into the system. Their academic records are preserved.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Academic Enrollments */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    Academic Enrollments
                  </CardTitle>
                  <CardDescription>Current and past section enrollments.</CardDescription>
                </div>
                <ClientEditAssignmentDialog 
                  studentId={student.id} 
                  programsWithSections={programsWithSections} 
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {student.student_enrollments && student.student_enrollments.length > 0 ? (
                <div className="divide-y divide-border">
                  {student.student_enrollments.map((enrollment) => {
                    const section = enrollment.sections;
                    const subject = section?.subjects;
                    const course = subject?.courses;
                    const program = course?.programs;
                    const department = program?.departments;
                    const semester = section?.semesters;
                    
                    return (
                      <div key={enrollment.id} className="p-6 hover:bg-muted/10 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <ClientEnrollmentManager enrollmentId={enrollment.id} currentStatus={enrollment.status} />
                                <span className="text-xs text-muted-foreground ml-3">Enrolled {new Date(enrollment.created_at).toLocaleDateString()}</span>
                              </div>
                              <h3 className="text-lg font-bold text-foreground">
                                {course?.title || 'Unknown Course'} <span className="text-muted-foreground font-normal">({course?.code})</span>
                              </h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Building className="h-4 w-4 shrink-0" />
                                <span className="truncate">Section {section?.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <BookOpen className="h-4 w-4 shrink-0" />
                                <span className="truncate">{program?.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span className="truncate">{semester?.name} ({semester?.academic_years?.name})</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <GraduationCap className="h-4 w-4 shrink-0" />
                                <span className="truncate">{department?.name}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium text-foreground">No enrollments found.</p>
                  <p className="text-sm">This student is not assigned to any sections.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
