"use client";
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react';

function LoginForms() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const prefillEmail = searchParams.get('email') || '';
  const intent = searchParams.get('intent') === 'track' ? 'register' : 'login';

  const [loading, setLoading] = useState(false);

  return (
    <Tabs defaultValue={intent} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Create Account</TabsTrigger>
      </TabsList>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-100">
          {error}
        </div>
      )}

      <TabsContent value="login">
        <form className="grid gap-4" action={login} onSubmit={() => setLoading(true)}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required defaultValue={prefillEmail} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </TabsContent>
      
      <TabsContent value="register">
        <form className="grid gap-4" action={signup} onSubmit={() => setLoading(true)}>
          <div className="grid gap-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" name="email" type="email" required defaultValue={prefillEmail} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reg-password">Choose a Password</Label>
            <Input id="reg-password" name="password" type="password" required minLength={6} />
            <p className="text-xs text-muted-foreground">Must be at least 6 characters long.</p>
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Customer Account</CardTitle>
          <CardDescription>
            Manage your orders and track your shipments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <LoginForms />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
