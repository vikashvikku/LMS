import { getStudentLibraryData } from "@/lib/data/student";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Library, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function StudentLibrary() {
  const loans = await getStudentLibraryData();

  const active = loans.filter(l => l.status === 'active' || l.status === 'overdue');
  const history = loans.filter(l => l.status === 'returned');

  const renderLoanList = (list, emptyMessage) => {
    if (list.length === 0) {
      return (
        <Card className="flex flex-col items-center justify-center py-12 text-center  mt-4">
          <Book className="h-12 w-12 text-slate-200 mb-4" />
          <p className="text-muted-foreground max-w-sm">{emptyMessage}</p>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {list.map((loan) => {
          const book = loan.book_copies?.books;
          const isOverdue = loan.status === 'overdue' || (loan.status === 'active' && new Date(loan.due_at) < new Date());
          const fines = loan.library_fines || [];
          const totalFine = fines.reduce((sum, f) => sum + Number(f.amount), 0);

          return (
            <Card key={loan.id} className="flex flex-col ">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-muted/50 truncate max-w-[120px]">
                    {book?.isbn || 'No ISBN'}
                  </Badge>
                  {isOverdue && loan.status !== 'returned' ? (
                    <Badge variant="destructive">Overdue</Badge>
                  ) : loan.status === 'returned' ? (
                    <Badge className="bg-slate-600">Returned</Badge>
                  ) : (
                    <Badge className="bg-blue-600">Active</Badge>
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-2">{book?.title}</CardTitle>
                <CardDescription className="line-clamp-1">{book?.author}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 pb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Library className="h-4 w-4" />
                  <span>Accession: {loan.book_copies?.accession_number || 'N/A'}</span>
                </div>
                <div className="text-sm">
                  {loan.status === 'returned' ? (
                    <p className="text-muted-foreground">Returned on: {formatDate(loan.returned_at)}</p>
                  ) : (
                    <p className={isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}>
                      Due on: {formatDate(loan.due_at)}
                    </p>
                  )}
                </div>
                {totalFine > 0 && (
                  <div className="flex items-center gap-2 text-sm font-medium text-red-700 bg-red-50 p-2 rounded">
                    <AlertCircle className="h-4 w-4" />
                    <span>Fine: {formatCurrency(totalFine)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Library</h1>
        <p className="text-muted-foreground">Manage your borrowed books and library fines.</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[300px]">
          <TabsTrigger value="active">Active Loans</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {renderLoanList(active, "You do not have any active book loans.")}
        </TabsContent>
        <TabsContent value="history">
          {renderLoanList(history, "You have no previously borrowed books.")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
