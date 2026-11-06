// Same-origin proxy to the Go backend, so the dashboard's httpOnly session
// cookie works without CORS. In production nginx may route /api/ straight to
// the backend instead (docs/architecture.md) — both setups behave the same.
export default defineEventHandler((event) => {
  const { apiInternalUrl } = useRuntimeConfig(event)
  return proxyRequest(event, apiInternalUrl + event.path)
})
