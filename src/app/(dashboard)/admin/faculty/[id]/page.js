import { getAdminFacultyById } from "@/lib/data/admin";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, GraduationCap, Building, Calendar, BookOpen, Clock, ShieldAlert, Phone, Briefcase } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClientActivationToggle } from "./ClientActivationToggle";
import { ClientEditFacultyDialog } from "./ClientEditFacultyDialog";
import { ClientAssignCourseDialog } from "./ClientAssignCourseDialog";
import { ClientAssignmentManager } from "./ClientAssignmentManager";

export const metadata = {
  title: "Faculty Details | Admin Portal",
};

export default async function AdminFacultyDetailsPage(props) {
  const { id: facultyId } = await props.params;
  const faculty = await getAdminFacultyById(facultyId);

  if (!faculty) {
    notFound();
  }

  const profile = await requireRole(["university_admin", "super_admin"]);
  const supabase = await createClient();

  // Fetch departments for the edit dialog
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name, code')
    .eq('organization_id', profile.organization_id)
    .order('name');

  // Fetch programs and subjects for the assign course dialog
  const { data: programs } = await supabase
    .from('programs')
    .select(`
      id, name, code,
      departments!inner(organization_id),
      courses (
        subjects (
          id, title, code
        )
      )
    `)
    .eq('departments.organization_id', profile.organization_id);

  const programsData = (programs || []).map(p => {
    // Flatten subjects from all courses inside the program
    const allSubjects = p.courses?.flatMap(c => c.subjects) || [];
    
    // Deduplicate subjects by id (in case they appear multiple times somehow, though unlikely)
    const uniqueSubjectsMap = new Map();
    allSubjects.forEach(s => {
      if (s) uniqueSubjectsMap.set(s.id, s);
    });

    return {
      id: p.id,
      name: p.name,
      code: p.code,
      subjects: Array.from(uniqueSubjectsMap.values())
    };
  }).filter(p => p.subjects.length > 0);

  const facProfile = faculty.faculty_profiles?.[0] || {};
  
  // Faculty assignments now join with subjects directly
  const { data: assignmentsData } = await supabase
    .from('faculty_assignments')
    .select(`
      id, created_at,
      subjects (
        id, title, code,
        courses (
          programs ( name )
        )
      )
    `)
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false });
    
  const assignments = assignmentsData || [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/admin/faculty" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Faculty
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className={`h-16 w-16 border ${faculty.is_active ? 'border-primary/20' : 'border-border opacity-60'}`}>
              <AvatarImage src={faculty.avatar_url || ''} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {faculty.first_name[0]}{faculty.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {faculty.first_name} {faculty.last_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={faculty.is_active ? "outline" : "secondary"} className={!faculty.is_active ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300 border-transparent" : ""}>
                  {faculty.is_active ? 'Active Account' : 'Suspended Account'}
                </Badge>
                {facProfile.employee_id && (
                  <Badge variant="secondary" className="font-mono">{facProfile.employee_id}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClientEditFacultyDialog faculty={faculty} departments={departments || []} />
            <ClientActivationToggle 
              facultyId={faculty.id} 
              isActive={faculty.is_active} 
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
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name</p>
                <p className="font-medium text-foreground">{faculty.first_name} {faculty.last_name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email Address</p>
                <p className="font-medium text-foreground truncate">Linked to Auth</p>
              </div>
              {facProfile.phone && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</p>
                    <p className="font-medium text-foreground">{facProfile.phone}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> Department</p>
                <p className="font-medium text-foreground">{facProfile.departments?.name || 'Not assigned'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Designation</p>
                <p className="font-medium text-foreground">{facProfile.designation || 'Not assigned'}</p>
              </div>
              {facProfile.specialization && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Specialization</p>
                    <p className="font-medium text-foreground">{facProfile.specialization}</p>
                  </div>
                </>
              )}
              {facProfile.joining_date && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Joined</p>
                    <p className="font-medium text-foreground">{new Date(facProfile.joining_date).toLocaleDateString()}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {!faculty.is_active && (
            <Card className="shadow-sm border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-400">
                    <p className="font-medium mb-1">Account Suspended</p>
                    <p className="text-red-700/80 dark:text-red-500/80">This faculty member cannot log into the system. Historical academic records are preserved.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Academic Assignments */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    Teaching Assignments
                  </CardTitle>
                  <CardDescription>Courses currently assigned.</CardDescription>
                </div>
                <ClientAssignCourseDialog 
                  facultyId={faculty.id} 
                  programs={programsData} 
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {assignments.length > 0 ? (
                <div className="divide-y divide-border">
                  {assignments.map((assignment) => {
                    const subject = assignment.subjects;
                    const course = subject?.courses;
                    const program = course?.programs;
                    
                    return (
                      <div key={assignment.id} className="p-6 hover:bg-muted/10 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="secondary" className="font-normal">{subject?.code || 'Unknown'}</Badge>
                                <ClientAssignmentManager assignmentId={assignment.id} />
                              </div>
                              <h3 className="text-lg font-bold text-foreground">
                                {subject?.title || 'Unknown Course'}
                              </h3>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Building className="h-4 w-4 shrink-0" />
                                <span className="truncate">Program: {program?.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4 shrink-0" />
                                <span className="truncate">Assigned {new Date(assignment.created_at).toLocaleDateString()}</span>
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
                  <p className="font-medium text-foreground">No teaching assignments.</p>
                  <p className="text-sm">This faculty member is not assigned to any courses.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
