'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signup } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { User, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [pending, setPending] = useState(false)
  const [role, setRole] = useState('student')

  async function onSubmit(formData) {
    setPending(true)
    setError(null)
    setMessage(null)
    
    if (formData.get('password') !== formData.get('confirmPassword')) {
      setError('Passwords do not match.')
      setPending(false)
      return
    }

    // append role explicitely since it's controlled by state
    formData.append('role', role)

    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setMessage(result.message)
    }
    
    setPending(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Enter your details to join CampusOS.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label>Register as</Label>
              <RadioGroup defaultValue="student" onValueChange={setRole} className="grid grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="student" id="student" className="peer sr-only" disabled={pending} />
                  <Label
                    htmlFor="student"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                  >
                    <User className="mb-2 h-6 w-6" />
                    <span className="font-semibold text-sm">Student</span>
                    <span className="text-[11px] text-muted-foreground mt-1 font-normal leading-tight">Access courses, attendance & grades</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="faculty" id="faculty" className="peer sr-only" disabled={pending} />
                  <Label
                    htmlFor="faculty"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                  >
                    <BookOpen className="mb-2 h-6 w-6" />
                    <span className="font-semibold text-sm">Faculty</span>
                    <span className="text-[11px] text-muted-foreground mt-1 font-normal leading-tight">Manage courses, assignments & grading</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" required disabled={pending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" required disabled={pending} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required disabled={pending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} disabled={pending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required disabled={pending} />
            </div>
            
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
            {message && <p className="text-sm text-primary font-medium">{message}</p>}
            
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6 pb-2 mt-2">
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign In</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
