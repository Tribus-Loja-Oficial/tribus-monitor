import { NextResponse } from 'next/server'

function monitorBaseUrl(): string {
  return (process.env.MONITOR_API_URL ?? 'http://localhost:8787').replace(/\/$/, '')
}

export async function DELETE(_request: Request, context: { params: Promise<{ runId: string }> }) {
  const { runId } = await context.params
  const token = process.env.MONITOR_E2E_TOKEN
  if (!token?.trim()) {
    return NextResponse.json(
      { error: 'MONITOR_E2E_TOKEN não está configurado no servidor do dashboard.' },
      { status: 503 }
    )
  }

  const url = `${monitorBaseUrl()}/e2e-results/${encodeURIComponent(runId)}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = (await res.json()) as { error?: { message?: string } }
      if (body.error?.message) message = body.error.message
    } catch {
      try {
        const text = await res.text()
        if (text) message = text.slice(0, 200)
      } catch {
        /* ignore */
      }
    }
    return NextResponse.json({ error: message }, { status: res.status })
  }

  return NextResponse.json({ deleted: true })
}
