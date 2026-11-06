<script setup lang="ts">
import { navigation, site } from '~/data/site'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-navy-950 text-navy-200">
    <div class="container-page grid gap-10 py-14 md:grid-cols-3">
      <div>
        <p class="font-display text-2xl text-white">{{ site.name }}</p>
        <p class="mt-2 text-[15px]">{{ site.jobTitle }}</p>
      </div>
      <nav aria-label="Navigasi footer">
        <ul class="grid grid-cols-2 gap-x-6 gap-y-2 text-[15px]">
          <li v-for="item in navigation" :key="item.to">
            <NuxtLink :to="item.to" class="hover:text-white">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="text-[15px]">
        <p>
          <a :href="`mailto:${site.contact.email}`" class="hover:text-white">{{ site.contact.email }}</a>
        </p>
        <p class="mt-1">{{ site.contact.office.street }}, {{ site.contact.office.locality }}, {{ site.contact.office.city }}</p>
        <ul class="mt-3 flex gap-4">
          <li v-for="s in site.social.filter((x) => x.url)" :key="s.key">
            <a :href="s.url" rel="me noopener" target="_blank" class="hover:text-white">{{ s.label }}</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="border-t border-navy-800">
      <p class="container-page py-5 text-sm">© {{ year }} {{ site.fullName }}</p>
    </div>
  </footer>
</template>
