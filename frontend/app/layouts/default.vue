<template>
  <div class="flex min-h-screen flex-col">
    <a href="#konten" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-gold-500 focus:px-4 focus:py-2">Lewati ke konten</a>
    <SiteHeader />
    <main id="konten" class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
