"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'paid': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>;
    case 'partial': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Partially Paid</Badge>;
    case 'overdue': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>;
    case 'pending':
    default: return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Unpaid</Badge>;
  }
};

export function ClientFeeList({ 
  initialData, 
  programs,
  semesters,
  currentSearch, 
  currentProgram,
  currentSemester,
  currentStatus
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentSearch || "");

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

    router.push(`/admin/fees?${params.toString()}`);
  };

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b border-border flex flex-col xl:flex-row gap-4 justify-between bg-muted/10">
          <form onSubmit={handleSearch} className="relative w-full xl:max-w-xs flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student..."
              className="pl-9 pr-4 w-full bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" className="sr-only">Search</Button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={currentProgram || "all"} onValueChange={(val) => updateFilters({ programId: val })}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={currentSemester || "all"} onValueChange={(val) => updateFilters({ semesterId: val })}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={currentStatus || "all"} onValueChange={(val) => updateFilters({ status: val })}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Unpaid</SelectItem>
                <SelectItem value="partial">Partially Paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>STUDENT</TableHead>
                <TableHead>PROGRAM</TableHead>
                <TableHead>SEMESTER</TableHead>
                <TableHead>TOTAL FEE</TableHead>
                <TableHead>PAID</TableHead>
                <TableHead>BALANCE</TableHead>
                <TableHead>DUE DATE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.length > 0 ? (
                initialData.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <div className="font-medium">{fee.student?.first_name} {fee.student?.last_name}</div>
                      <div className="text-xs text-muted-foreground">{fee.student?.id?.split('-')[0].toUpperCase()}</div>
                    </TableCell>
                    <TableCell>{fee.fee_structure?.name || fee.fee_structure?.program_id}</TableCell>
                    <TableCell>{fee.semester?.name}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(fee.total_amount)}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">{formatCurrency(fee.paid)}</TableCell>
                    <TableCell className="text-amber-600 font-medium">{formatCurrency(fee.balance)}</TableCell>
                    <TableCell>
                      {fee.due_date ? format(new Date(fee.due_date), "dd MMM yyyy") : "N/A"}
                    </TableCell>
                    <TableCell>{getStatusBadge(fee.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/fees/${fee.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" /> View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="h-8 w-8 mb-2 opacity-20" />
                      <p>No fee records found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
