import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AccountPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch the actual profile to display safe details
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role, organization_id')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col items-center p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-2xl mt-12">
        <h1 className="text-3xl font-bold mb-8">Account Verification</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Authenticated Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground font-medium">Email</span>
              <span className="col-span-2">{user.email}</span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground font-medium">Name</span>
              <span className="col-span-2">{profile?.first_name} {profile?.last_name}</span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground font-medium">Role</span>
              <span className="col-span-2 capitalize">{profile?.role || 'Pending...'}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-muted-foreground font-medium">Organization</span>
              <span className="col-span-2 text-xs font-mono bg-muted p-1 rounded">
                {profile?.organization_id || 'Unassigned'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <form action={signout}>
          <Button variant="destructive" type="submit">Sign Out</Button>
        </form>
      </main>
    </div>
  )
}
