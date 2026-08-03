"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSemesterAction, activateSemesterAction } from "@/actions/settings";
import { formatDate } from "@/lib/utils";

export function SemesterManager({ semesters, academicYears }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAy, setSelectedAy] = useState("");

  async function handleAdd(formData) {
    if (!selectedAy) return alert("Please select an academic year");
    formData.append("academicYearId", selectedAy);
    setIsSubmitting(true);
    await createSemesterAction(formData);
    setIsSubmitting(false);
    setIsAdding(false);
    setSelectedAy("");
  }

  async function handleActivate(id) {
    await activateSemesterAction(id);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAdding(!isAdding)} variant="outline">
          {isAdding ? "Cancel" : "Add Semester"}
        </Button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="border p-4 rounded-md space-y-4 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={selectedAy} onValueChange={setSelectedAy} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((ay) => (
                    <SelectItem key={ay.id} value={ay.id}>{ay.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Semester Name (e.g., Fall 2026)</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Save Semester"}
          </Button>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Semester</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {semesters.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                No semesters found.
              </TableCell>
            </TableRow>
          ) : (
            semesters.map((sem) => {
              const ay = academicYears.find(a => a.id === sem.academic_year_id);
              return (
                <TableRow key={sem.id}>
                  <TableCell className="font-medium">{sem.name}</TableCell>
                  <TableCell>{ay?.name}</TableCell>
                  <TableCell>{formatDate(sem.start_date)}</TableCell>
                  <TableCell>{formatDate(sem.end_date)}</TableCell>
                  <TableCell>
                    {sem.is_active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!sem.is_active && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleActivate(sem.id)}
                      >
                        Make Active
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
