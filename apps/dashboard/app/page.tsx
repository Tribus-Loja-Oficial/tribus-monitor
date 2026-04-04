import { fetchDashboardData } from '../lib/monitor-api'
import { DashboardClient } from '../components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const initialData = await fetchDashboardData()
  return <DashboardClient initialData={initialData} />
}
