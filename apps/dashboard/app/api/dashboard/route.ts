import { NextResponse } from 'next/server'
import { fetchDashboardData } from '../../../lib/monitor-api'

export async function GET() {
  const data = await fetchDashboardData()
  return NextResponse.json(data)
}
