// RFC 9116. Prerendered at build; "Expires" is set one year after the build,
// so every deploy refreshes it. Redeploy at least yearly.
export default defineEventHandler((event) => {
  const siteUrl = siteUrlOf(event)
  const { securityContact } = useRuntimeConfig(event).public
  const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z')
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return [
    `Contact: ${securityContact}`,
    `Expires: ${expires}`,
    'Preferred-Languages: id, en',
    `Canonical: ${siteUrl}/.well-known/security.txt`,
    '',
  ].join('\n')
})
