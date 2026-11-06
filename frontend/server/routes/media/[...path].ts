// Uploaded images (WebP) are served by the backend from the private bucket.
export default defineEventHandler((event) => {
  const { apiInternalUrl } = useRuntimeConfig(event)
  return proxyRequest(event, apiInternalUrl + event.path)
})
