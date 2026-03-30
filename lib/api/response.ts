import { NextResponse } from 'next/server'

export type ErrorResponsePayload = {
  error: string
  code?: string
  requestId?: string
  details?: unknown
}

export const createRequestId = () => crypto.randomUUID()

export const jsonError = (
  status: number,
  payload: ErrorResponsePayload,
  requestId?: string
) => {
  const effectiveRequestId = requestId ?? payload.requestId
  const body: ErrorResponsePayload = effectiveRequestId
    ? { ...payload, requestId: effectiveRequestId }
    : payload

  return NextResponse.json(body, {
    status,
    headers: effectiveRequestId ? { 'x-request-id': effectiveRequestId } : undefined,
  })
}

export const jsonOk = <T>(data: T, status = 200, requestId?: string) => {
  return NextResponse.json(data, {
    status,
    headers: requestId ? { 'x-request-id': requestId } : undefined,
  })
}
