// Prerendered at build time. AI/answer-engine crawlers are allowed on
// purpose (GEO) — see docs/PRD.md K-6 if the client wants to opt out.
export default defineEventHandler((event) => {
  const siteUrl = siteUrlOf(event)
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /dashboard',
    'Disallow: /api/',
    'Disallow: /_internal/',
    '',
    '# Answer engines & AI assistants are welcome to read public content.',
    ...['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'].flatMap((ua) => [
      `User-agent: ${ua}`,
      'Allow: /',
      'Disallow: /dashboard',
      'Disallow: /api/',
      '',
    ]),
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
})
