"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createAcademicYearAction, activateAcademicYearAction } from "@/actions/settings";
import { formatDate } from "@/lib/utils";

export function AcademicYearManager({ academicYears }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAdd(formData) {
    setIsSubmitting(true);
    await createAcademicYearAction(formData);
    setIsSubmitting(false);
    setIsAdding(false);
  }

  async function handleActivate(id) {
    await activateAcademicYearAction(id);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAdding(!isAdding)} variant="outline">
          {isAdding ? "Cancel" : "Add Academic Year"}
        </Button>
      </div>

      {isAdding && (
        <form action={handleAdd} className="border p-4 rounded-md space-y-4 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (e.g., 2026-2027)</Label>
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
            {isSubmitting ? "Adding..." : "Save Academic Year"}
          </Button>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {academicYears.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                No academic years found.
              </TableCell>
            </TableRow>
          ) : (
            academicYears.map((ay) => (
              <TableRow key={ay.id}>
                <TableCell className="font-medium">{ay.name}</TableCell>
                <TableCell>{formatDate(ay.start_date)}</TableCell>
                <TableCell>{formatDate(ay.end_date)}</TableCell>
                <TableCell>
                  {ay.is_active ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!ay.is_active && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleActivate(ay.id)}
                    >
                      Make Active
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
