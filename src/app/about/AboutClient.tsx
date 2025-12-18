'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AboutClient() {
  return (
    <main className="p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            MyCritters Kanban onboarding project
          </p>
          <Button onClick={() => console.log('clicked')}>
            Click me
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
