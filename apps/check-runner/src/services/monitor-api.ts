import type { CheckResultInput } from '@tribus-monitor/core'

export async function sendChecksToMonitorApi(input: {
  monitorApiUrl: string
  token: string
  checks: CheckResultInput[]
}) {
  const response = await fetch(`${input.monitorApiUrl}/checks`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${input.token}`,
    },
    body: JSON.stringify({ checks: input.checks }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Monitor API ingest failed (${response.status}): ${text}`)
  }
}
