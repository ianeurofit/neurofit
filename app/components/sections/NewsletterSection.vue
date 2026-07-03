<script setup lang="ts">
const perks = [
  { icon: 'i-lucide-bell', title: 'Acceso anticipado', description: 'Sé de los primeros en probar nuestra plataforma y nuevas funcionalidades.' },
  { icon: 'i-lucide-gift', title: 'Contenido exclusivo', description: 'Recibe insights, investigaciones y guías prácticas para cuidar tu salud cerebral.' },
  { icon: 'i-lucide-users', title: 'Comunidad Neurofit', description: 'Únete a una comunidad global interesada en potenciar el cerebro y el bienestar.' },
  { icon: 'i-lucide-globe', title: 'Impacto global', description: 'Sé parte de un movimiento que transformará la salud cerebral en todo el mundo.' }
]

const badges = [
  { icon: 'i-lucide-flask-conical', title: 'Ciencia real', description: 'Basado en evidencia y neurociencia.' },
  { icon: 'i-lucide-shield-check', title: 'Confianza y ética', description: 'Privacidad, transparencia y seguridad de datos.' },
  { icon: 'i-lucide-globe', title: 'Disponible globalmente', description: 'Para todas las personas, en todos los países.' },
  { icon: 'i-lucide-heart', title: 'Un propósito', description: 'Mejorar vidas a través de la salud cerebral.' }
]

const form = reactive({ name: '', email: '', country: '', accepted: false })

const countries = ['Colombia', 'México', 'España', 'Estados Unidos', 'Argentina', 'Chile', 'Otro']
</script>

<template>
  <section class="relative overflow-hidden bg-ink-950 py-20 text-white lg:py-28">
    <div class="bg-radial-dots pointer-events-none absolute inset-0 text-white/5" />

    <UContainer class="relative">
      <UiSectionEyebrow label="Sé de los primeros en conocer" />
      <div class="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr_0.6fr] lg:items-start">
        <div>
          <h2 class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Sé de los primeros en conocer <span class="text-brand-400">Neurofit AI</span>
          </h2>
          <p class="mt-4 text-neutral-300">
            Únete a nuestra lista exclusiva y recibe novedades, acceso anticipado y contenido especial sobre
            salud cerebral, ciencia e innovación.
          </p>

          <div class="mt-8 space-y-5">
            <div v-for="perk in perks" :key="perk.title" class="flex items-start gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <UIcon :name="perk.icon" class="size-4.5 text-brand-400" />
              </div>
              <div>
                <p class="font-semibold">{{ perk.title }}</p>
                <p class="text-sm text-neutral-400">{{ perk.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <UCard :ui="{ root: 'bg-white text-neutral-900 dark:bg-white dark:text-neutral-900', body: 'p-7' }">
          <div class="flex flex-col items-center text-center">
            <div class="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <UIcon name="i-lucide-mail" class="size-6" />
            </div>
            <h3 class="mt-4 text-xl font-extrabold">
              Déjanos tu información y te avisaremos <span class="text-brand-600">muy pronto.</span>
            </h3>
            <p class="mt-2 text-sm text-neutral-500">
              Neurofit AI estará disponible en todo el mundo.<br>
              No te quedes fuera.
            </p>
          </div>

          <form class="mt-6 space-y-4" @submit.prevent>
            <div class="grid gap-4 sm:grid-cols-2">
              <UInput v-model="form.name" icon="i-lucide-user" placeholder="Nombre" size="lg" />
              <UInput v-model="form.email" type="email" icon="i-lucide-mail" placeholder="Correo electrónico" size="lg" />
            </div>
            <USelect
              v-model="form.country"
              :items="countries"
              icon="i-lucide-globe"
              placeholder="País"
              size="lg"
              class="w-full"
            />
            <UCheckbox
              v-model="form.accepted"
              label="Acepto recibir comunicaciones de Neurofit AI sobre novedades, lanzamientos y contenido relacionado con salud cerebral."
            />
            <UButton label="Quiero ser de los primeros" color="primary" block size="lg" class="rounded-full" />
            <p class="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
              <UIcon name="i-lucide-lock" class="size-3.5" />
              Tu información está segura y nunca será compartida.
            </p>
          </form>
        </UCard>

        <div class="flex flex-col items-center gap-4 lg:items-start">
          <div class="relative flex w-full max-w-[220px] flex-col items-center rounded-[2rem] border border-white/15 bg-white/5 p-6 text-center">
            <UIcon name="i-lucide-brain-circuit" class="size-16 text-brand-400" />
            <p class="mt-4 text-sm font-bold">Tu cerebro.<br>Tu mejor versión.</p>
            <p class="mt-2 text-xs text-neutral-400">
              Muy pronto podrás conocer tu Brain Score™ y transformar tu salud cerebral.
            </p>
            <UBadge color="primary" variant="soft" class="mt-4 rounded-full">Próximamente</UBadge>
          </div>
        </div>
      </div>

      <div class="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4">
        <div v-for="badge in badges" :key="badge.title" class="flex items-start gap-3">
          <UIcon :name="badge.icon" class="mt-0.5 size-5 shrink-0 text-brand-400" />
          <div>
            <p class="text-sm font-bold">{{ badge.title }}</p>
            <p class="text-xs text-neutral-400">{{ badge.description }}</p>
          </div>
        </div>
      </div>

      <UCard :ui="{ root: 'mt-10 bg-white/5 ring-white/10', body: 'p-8' }" class="text-center">
        <UIcon name="i-lucide-quote" class="mx-auto size-8 text-brand-400" />
        <p class="mt-3 text-lg font-medium">El futuro de la salud cerebral comienza hoy.</p>
        <p class="text-lg font-bold text-brand-400">Sé parte del cambio.</p>
      </UCard>
    </UContainer>
  </section>
</template>
