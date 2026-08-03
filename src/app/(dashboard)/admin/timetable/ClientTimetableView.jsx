"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, CalendarDays, List, SlidersHorizontal, MapPin, Trash2, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientAddScheduleDialog } from "./ClientAddScheduleDialog";
import { ClientEditScheduleDialog } from "./ClientEditScheduleDialog";
import { deleteTimetableAction } from "@/actions/timetable";
import { useTransition } from "react";

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ClientTimetableView({ 
  initialData, 
  programs,
  courses,
  sections,
  rooms,
  currentSearch, 
  currentProgram,
  currentCourse,
  currentSection,
  currentDay,
  allFaculty
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(currentSearch || "");
  const [selectedProgram, setSelectedProgram] = useState(currentProgram || "all");
  const [selectedCourse, setSelectedCourse] = useState(currentCourse || "all");
  const [viewMode, setViewMode] = useState("weekly");

  const filteredCourses = selectedProgram && selectedProgram !== "all" 
    ? courses.filter(c => c.program_id === selectedProgram)
    : courses;

  const filteredSections = selectedCourse && selectedCourse !== "all"
    ? sections.filter(s => s.subject_name === courses.find(c => c.id === selectedCourse)?.title)
    : sections;

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
      params.delete("courseId");
      params.delete("sectionId");
      setSelectedCourse("all");
    }
    if (newFilters.courseId && newFilters.courseId !== currentCourse) {
      params.delete("sectionId");
    }

    router.push(`/admin/timetable?${params.toString()}`);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this scheduled class?")) {
      startTransition(async () => {
        await deleteTimetableAction(id);
      });
    }
  };

  // Build weekly grid
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
  const daysToShow = [1, 2, 3, 4, 5, 6]; // Monday to Saturday

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full xl:max-w-xs flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search faculty, course, room..."
              className="pl-9 pr-4 w-full bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" className="sr-only">Search</Button>
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto flex-1 justify-end">
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

            <Select 
              value={selectedCourse} 
              onValueChange={(val) => {
                setSelectedCourse(val);
                updateFilters({ courseId: val });
              }}
              disabled={!selectedProgram || selectedProgram === "all"}
            >
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {filteredCourses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={currentSection || "all"} 
              onValueChange={(val) => updateFilters({ sectionId: val })}
              disabled={!selectedCourse || selectedCourse === "all"}
            >
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {filteredSections.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={currentDay || "all"} 
              onValueChange={(val) => updateFilters({ day: val })}
            >
              <SelectTrigger className="w-[120px] bg-background">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {daysToShow.map(d => (
                  <SelectItem key={d} value={d.toString()}>{DAYS_OF_WEEK[d]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ClientAddScheduleDialog 
              programs={programs}
              courses={courses}
              sections={sections}
              rooms={rooms}
              allFaculty={allFaculty}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
        <div className="flex justify-end mb-4">
          <TabsList>
            <TabsTrigger value="weekly" className="gap-2">
              <CalendarDays className="h-4 w-4" /> Weekly Timetable
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" /> Schedule List
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="weekly" className="m-0">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[1000px] grid grid-cols-7 border-b border-border bg-muted/50">
                <div className="p-3 text-sm font-medium text-muted-foreground text-center border-r border-border">Time</div>
                {daysToShow.map(day => (
                  <div key={day} className="p-3 text-sm font-medium text-center border-r border-border last:border-r-0">
                    {DAYS_OF_WEEK[day]}
                  </div>
                ))}
              </div>
              
              <div className="min-w-[1000px] flex flex-col">
                {hours.map(hour => {
                  const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
                  return (
                    <div key={hour} className="grid grid-cols-7 border-b border-border last:border-b-0 min-h-[120px]">
                      <div className="p-3 text-xs text-muted-foreground text-center border-r border-border bg-muted/10 flex items-center justify-center">
                        {hour > 12 ? `${hour-12}:00 PM` : `${hour}:00 AM`}
                      </div>
                      
                      {daysToShow.map(day => {
                        // Find classes that start within this hour
                        const classesInSlot = initialData.filter(t => {
                          if (t.day_of_week !== day) return false;
                          const startHour = parseInt(t.start_time.split(':')[0], 10);
                          return startHour === hour;
                        });

                        return (
                          <div key={day} className="p-2 border-r border-border last:border-r-0 relative flex flex-col gap-2">
                            {classesInSlot.map(cls => (
                              <div key={cls.id} className="bg-primary/5 border border-primary/20 rounded-md p-2 text-xs flex flex-col gap-1 hover:bg-primary/10 transition-colors group cursor-pointer">
                                <div className="font-semibold text-primary line-clamp-1" title={cls.subject?.title}>
                                  {cls.subject?.title}
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                  <span>{cls.subject?.code}</span>
                                  <Badge variant="outline" className="text-[10px] h-4 px-1">{cls.section?.name}</Badge>
                                </div>
                                <div className="text-muted-foreground flex justify-between items-center mt-1">
                                  <span className="truncate">{cls.faculty?.first_name} {cls.faculty?.last_name}</span>
                                </div>
                                <div className="text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{cls.room?.name}</span>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background rounded-md shadow-sm border border-border flex">
                                  <ClientEditScheduleDialog 
                                    schedule={cls}
                                    programs={programs}
                                    courses={courses}
                                    sections={sections}
                                    rooms={rooms}
                                    allFaculty={allFaculty}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="m-0">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>COURSE</TableHead>
                    <TableHead>SECTION</TableHead>
                    <TableHead>FACULTY</TableHead>
                    <TableHead>DAY & TIME</TableHead>
                    <TableHead>ROOM</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialData.length > 0 ? (
                    initialData.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{cls.subject?.title}</span>
                            <span className="text-xs text-muted-foreground font-mono">{cls.subject?.code}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{cls.section?.name}</Badge>
                        </TableCell>
                        <TableCell>
                          {cls.faculty?.first_name} {cls.faculty?.last_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{DAYS_OF_WEEK[cls.day_of_week]}</span>
                            <span className="text-xs text-muted-foreground">
                              {cls.start_time.substring(0, 5)} - {cls.end_time.substring(0, 5)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {cls.room?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={cls.is_active ? "outline" : "secondary"} className={!cls.is_active ? "bg-red-100 text-red-800" : "bg-emerald-50 text-emerald-700 border-emerald-200"}>
                            {cls.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <ClientEditScheduleDialog 
                              schedule={cls}
                              programs={programs}
                              courses={courses}
                              sections={sections}
                              rooms={rooms}
                              allFaculty={allFaculty}
                              isList={true}
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(cls.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <CalendarDays className="h-8 w-8 mb-2 opacity-20" />
                          <p>No scheduled classes match your filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
