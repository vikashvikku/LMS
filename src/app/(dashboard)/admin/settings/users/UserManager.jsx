"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUserRoleAction, toggleUserStatusAction } from "@/actions/settings";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function UserManager({ users, currentUserId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredUsers = users.filter(u => 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleRoleChange(userId, newRole) {
    setIsUpdating(true);
    const res = await updateUserRoleAction(userId, newRole);
    if (res.error) alert(res.error);
    setIsUpdating(false);
  }

  async function handleStatusChange(userId, isActive) {
    if (confirm(`Are you sure you want to ${isActive ? 'enable' : 'disable'} this user?`)) {
      setIsUpdating(true);
      const res = await toggleUserStatusAction(userId, isActive);
      if (res.error) alert(res.error);
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Search users..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name}
                    {user.id === currentUserId && <Badge variant="outline" className="ml-2">You</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Select 
                      disabled={isUpdating || user.id === currentUserId}
                      defaultValue={user.role}
                      onValueChange={(val) => handleRoleChange(user.id, val)}
                    >
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="department_head">Department Head</SelectItem>
                        <SelectItem value="university_admin">Admin</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="librarian">Librarian</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.id !== currentUserId && (
                      <Button 
                        variant={user.is_active ? "destructive" : "default"} 
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(user.id, !user.is_active)}
                      >
                        {user.is_active ? "Disable" : "Enable"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
