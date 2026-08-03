import { getAdminProgramById } from "@/lib/data/admin";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building, Layers, GraduationCap, BookOpen, Clock, Users, UserCheck } from "lucide-react";
import Link from "next/link";
import { ClientEditProgramDialog } from "./ClientEditProgramDialog";
import { ClientProgramActivationToggle } from "./ClientProgramActivationToggle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = {
  title: "Program Details | Admin Portal",
};

export default async function AdminProgramDetailsPage(props) {
  const { id: programId } = await props.params;
  const program = await getAdminProgramById(programId);

  if (!program) {
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

  // Fetch courses belonging to this program (cohorts) and their subjects
  // Wait, "Courses" in the DB are cohorts. The user expects actual atomic subjects as well, 
  // but let's just display the `subjects` directly grouped or listed.
  // The user says: "Display all courses belonging to the selected program... Course Code, Course Name, Credits, Semester"
  // Let's fetch subjects via courses
  const { data: programCourses } = await supabase
    .from('courses')
    .select(`
      id, title, code, credits,
      subjects (
        id, title, code
      )
    `)
    .eq('program_id', programId);

  const flatSubjects = [];
  (programCourses || []).forEach(c => {
    (c.subjects || []).forEach(s => {
      flatSubjects.push({
        id: s.id,
        code: s.code,
        title: s.title,
        credits: c.credits, // Fallback to cohort credits if subjects don't have credits
        cohortName: c.title,
        status: 'Active'
      });
    });
  });

  // Unique subjects just in case
  const uniqueSubjects = Array.from(new Map(flatSubjects.map(item => [item.id, item])).values());

  // Fetch enrolled students
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select(`
      id, status,
      profiles (
        id, first_name, last_name, is_active
      ),
      sections (
        name
      )
    `)
    .eq('program_id', programId);
    
  const students = enrollments || [];

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/admin/programs" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
          &larr; Back to Programs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {program.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="font-mono text-sm">{program.code}</Badge>
              <Badge variant={program.is_active ? "outline" : "secondary"} className={!program.is_active ? "bg-red-100 text-red-800 border-transparent" : "bg-emerald-50 text-emerald-700 border-emerald-200"}>
                {program.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Building className="h-4 w-4" />
                {program.departments?.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClientEditProgramDialog program={program} departments={departments || []} />
            <ClientProgramActivationToggle 
              programId={program.id} 
              isActive={program.is_active} 
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left Column: Details & Stats */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-muted-foreground" />
                Program Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Program Type</p>
                <p className="font-medium text-foreground">{program.type}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Duration</p>
                <p className="font-medium text-foreground">{program.duration ? `${program.duration} ${program.duration_unit || ''}` : '—'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Created On</p>
                <p className="font-medium text-foreground">{new Date(program.created_at).toLocaleDateString()}</p>
              </div>
              {program.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground">{program.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Students</span>
                <span className="font-bold">{program.stats.studentsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><BookOpen className="h-4 w-4" /> Courses</span>
                <span className="font-bold">{program.stats.coursesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><UserCheck className="h-4 w-4" /> Faculty</span>
                <span className="font-bold">{program.stats.facultyCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Layers className="h-4 w-4" /> Sections</span>
                <span className="font-bold">{program.stats.sectionsCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Courses and Students */}
        <div className="md:col-span-3 space-y-6">
          {/* Courses Section */}
          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    Courses
                  </CardTitle>
                  <CardDescription>Academic courses/subjects belonging to this program.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {uniqueSubjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>CODE</TableHead>
                        <TableHead>COURSE NAME</TableHead>
                        <TableHead>COHORT</TableHead>
                        <TableHead>CREDITS</TableHead>
                        <TableHead>STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uniqueSubjects.map(sub => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-mono text-sm">{sub.code}</TableCell>
                          <TableCell className="font-medium">{sub.title}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{sub.cohortName}</TableCell>
                          <TableCell>{sub.credits || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium text-foreground">No courses have been added to this program yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enrolled Students Section */}
          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    Enrolled Students
                  </CardTitle>
                  <CardDescription>Students currently enrolled in this program.</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/students?search=${program.code}`}>View All Students</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>STUDENT NAME</TableHead>
                        <TableHead>SECTION</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead className="text-right">ACTION</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map(enroll => {
                        const prof = enroll.profiles;
                        const sec = enroll.sections;
                        return (
                          <TableRow key={enroll.id}>
                            <TableCell className="font-medium">
                              {prof?.first_name} {prof?.last_name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {sec?.name || 'Unassigned'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={enroll.status === 'active' ? "outline" : "secondary"} className={enroll.status === 'active' ? "border-emerald-200 text-emerald-700 bg-emerald-50" : ""}>
                                {enroll.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="ghost" size="sm" className="h-8 text-blue-600">
                                <Link href={`/admin/students/${prof?.id}`}>Profile</Link>
                              </Button>
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
                  <p className="font-medium text-foreground">No students are currently enrolled in this program.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
