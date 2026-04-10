'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type MonitorConfirmOptions = {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}

export type MonitorAlertOptions = {
  title?: string
  okLabel?: string
}

type MonitorDialogsContextValue = {
  confirm: (options: MonitorConfirmOptions | string) => Promise<boolean>
  alert: (message: string, options?: MonitorAlertOptions) => Promise<void>
}

const MonitorDialogsContext = createContext<MonitorDialogsContextValue | null>(null)

type OpenConfirm = Omit<MonitorConfirmOptions, 'message'> & { message: string }

type DialogOpen =
  | { kind: 'confirm'; payload: OpenConfirm }
  | { kind: 'alert'; title?: string; message: string; okLabel: string }

function toOpenConfirm(o: MonitorConfirmOptions): OpenConfirm {
  const payload: OpenConfirm = { message: o.message }
  if (o.title !== undefined) payload.title = o.title
  if (o.confirmLabel !== undefined) payload.confirmLabel = o.confirmLabel
  if (o.cancelLabel !== undefined) payload.cancelLabel = o.cancelLabel
  if (o.variant !== undefined) payload.variant = o.variant
  return payload
}

export function MonitorDialogsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<DialogOpen | null>(null)
  const pendingConfirmRef = useRef<((value: boolean) => void) | null>(null)
  const pendingAlertRef = useRef<(() => void) | null>(null)
  const titleId = useId()
  const descId = useId()

  const confirm = useCallback((options: MonitorConfirmOptions | string) => {
    const o: MonitorConfirmOptions = typeof options === 'string' ? { message: options } : options
    return new Promise<boolean>((resolve) => {
      pendingConfirmRef.current = resolve
      setOpen({
        kind: 'confirm',
        payload: toOpenConfirm(o),
      })
    })
  }, [])

  const alert = useCallback((message: string, options?: MonitorAlertOptions) => {
    return new Promise<void>((resolve) => {
      pendingAlertRef.current = resolve
      setOpen({
        kind: 'alert',
        message,
        okLabel: options?.okLabel ?? 'Entendi',
        ...(options?.title !== undefined ? { title: options.title } : {}),
      })
    })
  }, [])

  const closeConfirm = useCallback((value: boolean) => {
    pendingConfirmRef.current?.(value)
    pendingConfirmRef.current = null
    setOpen(null)
  }, [])

  const closeAlert = useCallback(() => {
    pendingAlertRef.current?.()
    pendingAlertRef.current = null
    setOpen(null)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const kind = open.kind
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (kind === 'confirm') closeConfirm(false)
        else closeAlert()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closeConfirm, closeAlert])

  const value: MonitorDialogsContextValue = { confirm, alert }

  return (
    <MonitorDialogsContext.Provider value={value}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] transition-opacity"
            onClick={() => (open.kind === 'confirm' ? closeConfirm(false) : closeAlert())}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="relative z-[1] w-full max-w-[420px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_80px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5"
          >
            {open.kind === 'confirm' ? (
              <ConfirmBody
                titleId={titleId}
                descId={descId}
                payload={open.payload}
                onCancel={() => closeConfirm(false)}
                onConfirm={() => closeConfirm(true)}
              />
            ) : (
              <AlertBody
                titleId={titleId}
                descId={descId}
                {...(open.title !== undefined ? { title: open.title } : {})}
                message={open.message}
                okLabel={open.okLabel}
                onOk={closeAlert}
              />
            )}
          </div>
        </div>
      )}
    </MonitorDialogsContext.Provider>
  )
}

function ConfirmBody({
  titleId,
  descId,
  payload,
  onCancel,
  onConfirm,
}: {
  titleId: string
  descId: string
  payload: OpenConfirm
  onCancel: () => void
  onConfirm: () => void
}) {
  const variant = payload.variant ?? 'default'
  const isDanger = variant === 'danger'
  const title = payload.title ?? (isDanger ? 'Confirmar ação' : 'Confirmação')
  const confirmLabel = payload.confirmLabel ?? (isDanger ? 'Confirmar' : 'OK')
  const cancelLabel = payload.cancelLabel ?? 'Cancelar'

  return (
    <div className="p-6 sm:p-7">
      <div className="flex gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isDanger ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
          }`}
          aria-hidden
        >
          {isDanger ? <TrashDialogIcon /> : <QuestionIcon />}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 id={titleId} className="text-base font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          <p id={descId} className="mt-2 text-sm leading-relaxed text-slate-600">
            {payload.message}
          </p>
        </div>
      </div>
      <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <button
          type="button"
          autoFocus={isDanger}
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          autoFocus={!isDanger}
          onClick={onConfirm}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            isDanger
              ? 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500'
              : 'bg-slate-900 hover:bg-slate-800 focus-visible:ring-slate-900'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  )
}

function AlertBody({
  titleId,
  descId,
  title,
  message,
  okLabel,
  onOk,
}: {
  titleId: string
  descId: string
  title?: string
  message: string
  okLabel: string
  onOk: () => void
}) {
  const heading = title ?? 'Aviso'
  return (
    <div className="p-6 sm:p-7">
      <div className="flex gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"
          aria-hidden
        >
          <InfoIcon />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 id={titleId} className="text-base font-semibold tracking-tight text-slate-900">
            {heading}
          </h2>
          <p id={descId} className="mt-2 text-sm leading-relaxed text-slate-600">
            {message}
          </p>
        </div>
      </div>
      <div className="mt-7 flex justify-end">
        <button
          type="button"
          autoFocus
          onClick={onOk}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          {okLabel}
        </button>
      </div>
    </div>
  )
}

function TrashDialogIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}

function QuestionIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

export function useMonitorDialogs(): MonitorDialogsContextValue {
  const ctx = useContext(MonitorDialogsContext)
  if (!ctx) {
    throw new Error('useMonitorDialogs must be used within MonitorDialogsProvider')
  }
  return ctx
}
