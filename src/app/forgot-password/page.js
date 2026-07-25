'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(formData) {
    setPending(true)
    setError(null)
    setMessage(null)
    
    const email = formData.get('email')
    
    if (!email) {
      setError('Please provide an email address.')
      setPending(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    
    if (error) {
      // Safe messaging: do not reveal if email exists, just say check email.
      setMessage('If an account exists with this email, a password reset link has been sent.')
    } else {
      setMessage('If an account exists with this email, a password reset link has been sent.')
    }
    
    setPending(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required disabled={pending} />
            </div>
            
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
            {message && <p className="text-sm text-primary font-medium">{message}</p>}
            
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Remember your password? <Link href="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
