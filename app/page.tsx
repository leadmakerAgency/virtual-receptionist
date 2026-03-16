import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Virtual Receptionist Platform
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          AI-powered virtual receptionists powered by ElevenLabs
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>For Visitors</CardTitle>
              <CardDescription>
                Access a virtual receptionist using their unique slug
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Example: /john, /tammy
              </p>
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  Admin Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Admins</CardTitle>
              <CardDescription>
                Manage virtual receptionists and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full">Go to Admin Portal</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
