"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createDepartmentAction, updateDepartmentAction, deleteDepartmentAction } from "@/actions/settings";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export function DepartmentManager({ departments }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  function openCreate() {
    setEditingId(null);
    setName("");
    setCode("");
    setDescription("");
    setIsActive(true);
    setIsOpen(true);
  }

  function openEdit(dept) {
    setEditingId(dept.id);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description || "");
    setIsActive(dept.is_active);
    setIsOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("code", code);
    formData.append("description", description);
    formData.append("isActive", isActive);

    let res;
    if (editingId) {
      res = await updateDepartmentAction(editingId, formData);
    } else {
      res = await createDepartmentAction(formData);
    }

    if (res.error) {
      alert(res.error);
    } else {
      setIsOpen(false);
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id) {
    if (confirm("Are you sure you want to delete this department? This action cannot be undone.")) {
      const res = await deleteDepartmentAction(id);
      if (res.error) alert(res.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Add Department</Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Department Code</Label>
              <Input id="code" value={code} onChange={e => setCode(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="isActive">Active Status</Label>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Department"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Head</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                No departments found.
              </TableCell>
            </TableRow>
          ) : (
            departments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.code}</TableCell>
                <TableCell>{dept.name}</TableCell>
                <TableCell>
                  {dept.profiles ? `${dept.profiles.first_name} ${dept.profiles.last_name}` : <span className="text-muted-foreground text-xs">Unassigned</span>}
                </TableCell>
                <TableCell>
                  {dept.is_active ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(dept)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(dept.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
