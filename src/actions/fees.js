"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createFeeStructureAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const name = formData.get("name");
    const programId = formData.get("program_id");
    const semesterId = formData.get("semester_id");
    const isActive = formData.get("is_active") === "true";
    const dueDate = formData.get("due_date");
    
    // Components is passed as a JSON string from the client
    const componentsStr = formData.get("components") || "[]";
    const components = JSON.parse(componentsStr);
    
    const baseAmount = components.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    const { error } = await supabase
      .from('fee_structures')
      .insert({
        organization_id: profile.organization_id,
        name,
        program_id: programId,
        semester_id: semesterId,
        is_active: isActive,
        due_date: dueDate || null,
        components,
        base_amount: baseAmount
      });

    if (error) {
      console.error("Error creating fee structure:", error);
      return { error: "Failed to create fee structure." };
    }

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}

export async function updateFeeStructureAction(id, formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const name = formData.get("name");
    const isActive = formData.get("is_active") === "true";
    const dueDate = formData.get("due_date");
    
    const componentsStr = formData.get("components") || "[]";
    const components = JSON.parse(componentsStr);
    const baseAmount = components.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    // Ensure it belongs to the org
    const { data: existing } = await supabase
      .from('fee_structures')
      .select('organization_id')
      .eq('id', id)
      .single();

    if (!existing || existing.organization_id !== profile.organization_id) {
      return { error: "Unauthorized." };
    }

    const { error } = await supabase
      .from('fee_structures')
      .update({
        name,
        is_active: isActive,
        due_date: dueDate || null,
        components,
        base_amount: baseAmount
      })
      .eq('id', id);

    if (error) return { error: "Failed to update fee structure." };

    revalidatePath("/admin/fees");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}

export async function assignFeesToStudentsAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const feeStructureId = formData.get("fee_structure_id");
    const targetType = formData.get("target_type"); // 'all' or 'individual'
    const studentId = formData.get("student_id"); // Used if individual
    
    // Fetch fee structure to get details
    const { data: feeStructure, error: fsError } = await supabase
      .from('fee_structures')
      .select('base_amount, program_id, semester_id, due_date, organization_id')
      .eq('id', feeStructureId)
      .single();

    if (fsError || feeStructure.organization_id !== profile.organization_id) {
      return { error: "Invalid fee structure." };
    }

    let studentsToAssign = [];

    if (targetType === 'individual') {
      if (!studentId) return { error: "Student ID required." };
      studentsToAssign.push(studentId);
    } else if (targetType === 'all') {
      // Fetch all students in the program and semester via student_enrollments
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select(`
          student_id,
          sections!inner(
            semester_id,
            subjects!inner(
              courses!inner(program_id)
            )
          )
        `)
        .eq('sections.semester_id', feeStructure.semester_id)
        .eq('sections.subjects.courses.program_id', feeStructure.program_id);

      if (enrollments && enrollments.length > 0) {
        // Unique student IDs
        const ids = [...new Set(enrollments.map(e => e.student_id))];
        
        // Ensure they belong to the org
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .in('id', ids)
          .eq('organization_id', profile.organization_id);
          
        studentsToAssign = profiles.map(p => p.id);
      }
    }

    if (studentsToAssign.length === 0) {
      return { error: "No eligible students found." };
    }

    // Filter out existing assignments for this fee_structure and student
    const { data: existingAssignments } = await supabase
      .from('student_fees')
      .select('student_id')
      .eq('fee_structure_id', feeStructureId)
      .in('student_id', studentsToAssign);

    const existingIds = new Set(existingAssignments?.map(e => e.student_id) || []);
    const newAssignments = studentsToAssign.filter(id => !existingIds.has(id));

    if (newAssignments.length === 0) {
      return { error: "Fees already assigned to selected students." };
    }

    const payload = newAssignments.map(id => ({
      student_id: id,
      fee_structure_id: feeStructureId,
      semester_id: feeStructure.semester_id,
      total_amount: feeStructure.base_amount,
      discount_amount: 0,
      due_date: feeStructure.due_date,
      status: 'pending'
    }));

    const { error: insertError } = await supabase
      .from('student_fees')
      .insert(payload);

    if (insertError) {
      console.error(insertError);
      return { error: "Failed to assign fees." };
    }

    revalidatePath("/admin/fees");
    return { success: true, count: newAssignments.length };
  } catch (error) {
    console.error(error);
    return { error: "An unexpected error occurred." };
  }
}

export async function recordPaymentAction(formData) {
  try {
    const profile = await requireRole(["university_admin", "super_admin"]);
    const supabase = await createClient();

    const studentFeeId = formData.get("student_fee_id");
    const amountPaid = Number(formData.get("amount_paid"));
    const paymentMethod = formData.get("payment_method");
    const referenceNumber = formData.get("reference_number") || null;
    const paymentDate = formData.get("payment_date");
    const notes = formData.get("notes") || "";

    if (!amountPaid || amountPaid <= 0) return { error: "Invalid amount." };

    // Get the student fee
    const { data: sf, error: sfError } = await supabase
      .from('student_fees')
      .select('id, total_amount, due_date, student:profiles!inner(organization_id)')
      .eq('id', studentFeeId)
      .single();

    if (sfError || sf.student.organization_id !== profile.organization_id) {
      return { error: "Unauthorized or fee not found." };
    }

    // Get current payments to check balance
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('amount_paid')
      .eq('student_fee_id', studentFeeId);

    const totalPaidSoFar = existingPayments?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;
    const balance = Number(sf.total_amount) - totalPaidSoFar;

    if (amountPaid > balance) {
      return { error: `Amount exceeds outstanding balance of ₹${balance}` };
    }

    // Generate unique receipt number (e.g. CAMPUS-2026-000001)
    // For concurrency safety, using a simple timestamp + random string or sequence. 
    // We'll use CAMPUS-YYYY-MMDDHHMMSS for unique simplicity without sequence collisions.
    const now = new Date();
    const tsStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14); 
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const receiptNum = `CAMPUS-${now.getFullYear()}-${tsStr.slice(8)}${rand}`;

    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        student_fee_id: studentFeeId,
        amount_paid: amountPaid,
        payment_method: paymentMethod,
        reference_number: referenceNumber || receiptNum,
        paid_at: paymentDate,
        notes
      });

    if (insertError) return { error: "Failed to record payment." };

    // Update student_fee status
    const newTotalPaid = totalPaidSoFar + amountPaid;
    let newStatus = 'pending';
    
    if (newTotalPaid >= Number(sf.total_amount)) {
      newStatus = 'paid';
    } else {
      if (sf.due_date && new Date(sf.due_date) < new Date()) {
        newStatus = 'overdue';
      } else if (newTotalPaid > 0) {
        newStatus = 'partial';
      }
    }

    await supabase
      .from('student_fees')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', studentFeeId);

    revalidatePath("/admin/fees");
    revalidatePath(`/admin/fees/${studentFeeId}`);
    
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
}
