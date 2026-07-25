"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, UserCheck, XCircle, Clock, FileWarning } from "lucide-react";
import { saveAttendanceAction } from "@/actions/faculty";

export function MarkAttendanceForm({ session, sectionId, enrollments, existingRecords }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Initialize state with existing records or default to empty
  const [attendance, setAttendance] = useState(() => {
    const initialState = {};
    enrollments.forEach(e => {
      const record = existingRecords.find(r => r.student_id === e.student_id);
      if (record) {
        initialState[e.student_id] = record.status;
      }
    });
    return initialState;
  });

  const handleMarkAll = (status) => {
    const newState = { ...attendance };
    enrollments.forEach(e => {
      // Only mark if not already marked something else, or if forcing all
      newState[e.student_id] = status;
    });
    setAttendance(newState);
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setError("");
    setSuccess(false);

    // Format data for server action
    const attendanceData = Object.entries(attendance).map(([student_id, status]) => ({
      student_id,
      status
    }));

    if (attendanceData.length === 0) {
      setError("Please mark attendance for at least one student before saving.");
      setIsPending(false);
      return;
    }

    const result = await saveAttendanceAction(session.id, sectionId, attendanceData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    
    setIsPending(false);
  };

  const markedCount = Object.keys(attendance).length;
  const totalCount = enrollments.length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted border rounded-lg">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Progress</span>
          <span className="text-2xl font-bold text-foreground">
            {markedCount} <span className="text-lg font-normal text-muted-foreground">/ {totalCount}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => handleMarkAll('present')} className="bg-white">
            <UserCheck className="mr-2 h-4 w-4 text-green-600" />
            Mark All Present
          </Button>
          <Button type="button" variant="outline" onClick={() => handleMarkAll('absent')} className="bg-white">
            <XCircle className="mr-2 h-4 w-4 text-red-600" />
            Mark All Absent
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
          Attendance records saved successfully.
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="text-left font-medium text-muted-foreground p-4">Student</th>
              <th className="text-center font-medium text-muted-foreground p-4">Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {enrollments.map((enrollment) => {
              const student = enrollment.profiles;
              const currentStatus = attendance[enrollment.student_id];
              
              return (
                <tr key={enrollment.student_id} className="hover:bg-muted">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-xs">
                        {student.first_name?.[0]}{student.last_name?.[0]}
                      </div>
                      <span className="font-medium text-foreground">
                        {student.first_name} {student.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <Button
                        type="button"
                        variant={currentStatus === 'present' ? 'default' : 'outline'}
                        className={currentStatus === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => handleStatusChange(enrollment.student_id, 'present')}
                        size="sm"
                      >
                        <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                        Present
                      </Button>
                      <Button
                        type="button"
                        variant={currentStatus === 'absent' ? 'default' : 'outline'}
                        className={currentStatus === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                        onClick={() => handleStatusChange(enrollment.student_id, 'absent')}
                        size="sm"
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Absent
                      </Button>
                      <Button
                        type="button"
                        variant={currentStatus === 'late' ? 'default' : 'outline'}
                        className={currentStatus === 'late' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                        onClick={() => handleStatusChange(enrollment.student_id, 'late')}
                        size="sm"
                      >
                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                        Late
                      </Button>
                      <Button
                        type="button"
                        variant={currentStatus === 'excused' ? 'default' : 'outline'}
                        className={currentStatus === 'excused' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}
                        onClick={() => handleStatusChange(enrollment.student_id, 'excused')}
                        size="sm"
                      >
                        <FileWarning className="mr-1.5 h-3.5 w-3.5" />
                        Excused
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-4 border-t pt-6">
        <Button 
          type="submit" 
          size="lg" 
          disabled={isPending || markedCount === 0}
          className="min-w-[200px]"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Save className="mr-2 h-5 w-5" />
          )}
          Save Attendance
        </Button>
      </div>
    </form>
  );
}
