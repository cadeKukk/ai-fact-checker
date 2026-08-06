'use client'

import { useRouter } from 'next/navigation'
import PracticeGame from '@/components/practice/PracticeGame'

export default function PracticeRoute() {
  const router = useRouter()
  return <PracticeGame onExit={() => router.push('/')} />
}
