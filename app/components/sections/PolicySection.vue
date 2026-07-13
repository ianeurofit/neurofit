<script setup lang="ts">
/**
 * Página: Política de Privacidad y Tratamiento de Datos Personales
 * Proyecto: Neurofit IA
 *
 * Toda la información editable (razón social, contacto, plazos, etc.)
 * está centralizada en `companyInfo` para que sea fácil de actualizar,
 * siguiendo el mismo patrón usado en googleForm.config.ts.
 */

useSeoMeta({
  title: 'Política de Privacidad y Tratamiento de Datos Personales | Neurofit IA',
  description:
    'Conoce cómo Neurofit IA recopila, usa, almacena y protege tus datos personales.',
})

// -----------------------------
// Datos editables del responsable
// -----------------------------
const companyInfo = {
  razonSocial: 'Neurofit IA', // Añadir razón social legal si aplica
  identificacion: '[Número de identificación]',
  email: 'info@neurofitia.com',
  telefono: '+57 3105423860',
  direccion: 'Calle 10 # 35 -35 MEdellin, ANT',
  diasHabilesRespuesta: '15',
}

const lastUpdated = new Date('2026-07-13') // Actualizar cuando cambie la política
const lastUpdatedFormatted = computed(() =>
  new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(lastUpdated)
)

// -----------------------------
// Estructura de contenido
// -----------------------------
interface PolicySection {
  id: string
  icon: string
  title: string
}

const sections: PolicySection[] = [
  { id: 'responsable', icon: 'i-lucide-building-2', title: '1. Responsable del Tratamiento de la Información' },
  { id: 'informacion-recopilada', icon: 'i-lucide-clipboard-list', title: '2. Información que Recopilamos' },
  { id: 'datos-sensibles', icon: 'i-lucide-shield-alert', title: '3. Tratamiento de Datos Sensibles' },
  { id: 'finalidad', icon: 'i-lucide-target', title: '4. Finalidad del Tratamiento de los Datos' },
  { id: 'derechos', icon: 'i-lucide-scale', title: '5. Derechos de los Titulares de los Datos' },
  { id: 'seguridad', icon: 'i-lucide-lock', title: '6. Seguridad de la Información' },
  { id: 'consultas-reclamos', icon: 'i-lucide-mail-question', title: '7. Procedimiento para Consultas y Reclamos' },
  { id: 'vigencia', icon: 'i-lucide-calendar-clock', title: '8. Vigencia' },
]

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <UContainer class="py-10 md:py-16">
    <!-- Encabezado -->
    <div class="mb-10 space-y-3">
      <UBadge color="primary" variant="subtle" size="lg" icon="i-lucide-shield-check">
        Protección de Datos
      </UBadge>
      <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-highlighted">
        Política de Privacidad y Tratamiento de Datos Personales
      </h1>
      <p class="text-lg text-muted">
        Proyecto: <span class="font-medium text-highlighted">{{ companyInfo.razonSocial }}</span>
      </p>
      <p class="text-sm text-dimmed">
        Fecha de última actualización: {{ lastUpdatedFormatted }}
      </p>
      <p class="text-base text-toned leading-relaxed max-w-3xl">
        En Neurofit IA, estamos comprometidos con la protección y el respeto de la privacidad de
        nuestros usuarios. Esta política describe cómo recopilamos, usamos, almacenamos y
        protegemos los datos personales obtenidos a través de nuestros formularios de contacto,
        suscripción a boletines (email marketing) y registro de interés en nuestros servicios
        enfocados en la evaluación, tratamiento y mejoramiento de la calidad de vida de personas
        con Alzheimer y sus familias.
      </p>
    </div>

    <USeparator class="mb-10" />

    <div class="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
      <!-- Tabla de contenido -->
      <aside class="hidden lg:block">
        <nav class="sticky top-24 space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed mb-3">
            Contenido
          </p>
          <UButton
            v-for="section in sections"
            :key="section.id"
            :label="section.title"
            :icon="section.icon"
            variant="ghost"
            color="neutral"
            size="sm"
            block
            class="justify-start text-left"
            @click="scrollToSection(section.id)"
          />
        </nav>
      </aside>

      <!-- Contenido principal -->
      <div class="space-y-8">
        <!-- 1. Responsable -->
        <UCard :id="sections[0].id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon :name="sections[0].icon" class="size-5 text-primary" />
              <h2 class="text-xl font-semibold text-highlighted">{{ sections[0].title }}</h2>
            </div>
          </template>
          <dl class="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt class="text-dimmed">Razón Social / Nombre del Proyecto</dt>
              <dd class="text-toned font-medium">{{ companyInfo.razonSocial }}</dd>
            </div>
            <div>
              <dt class="text-dimmed">Identificación (NIT / RUT / Documento)</dt>
              <dd class="text-toned font-medium">{{ companyInfo.identificacion }}</dd>
            </div>
            <div>
              <dt class="text-dimmed">Correo Electrónico de Contacto</dt>
              <dd class="text-toned font-medium">
                <ULink :to="`mailto:${companyInfo.email}`" class="text-primary">
                  {{ companyInfo.email }}
                </ULink>
              </dd>
            </div>
            <div>
              <dt class="text-dimmed">Teléfono</dt>
              <dd class="text-toned font-medium">{{ companyInfo.telefono }}</dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-dimmed">Dirección</dt>
              <dd class="text-toned font-medium">{{ companyInfo.direccion }}</dd>
            </div>
          </dl>
        </UCard>

        <!-- 2. Información recopilada -->
        <UCard :id="sections[1].id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon :name="sections[1].icon" class="size-5 text-primary" />
              <h2 class="text-xl font-semibold text-highlighted">{{ sections[1].title }}</h2>
            </div>
          </template>
          <p class="text-toned mb-3">
            A través de nuestros formularios, podemos solicitar los siguientes datos:
          </p>
          <ul class="space-y-2 text-toned">
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Nombres y apellidos.
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Dirección de correo electrónico.
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Número de teléfono (opcional).
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Información general sobre su interés en el proyecto Neurofit IA.
            </li>
          </ul>
        </UCard>

        <!-- 3. Datos sensibles -->
        <UCard :id="sections[2].id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon :name="sections[2].icon" class="size-5 text-primary" />
              <h2 class="text-xl font-semibold text-highlighted">{{ sections[2].title }}</h2>
            </div>
          </template>
          <UAlert
            color="warning"
            variant="subtle"
            icon="i-lucide-heart-pulse"
            title="Información de salud"
            class="mb-4"
          >
            <template #description>
              Debido a la naturaleza de nuestro proyecto (enfocado en el Alzheimer), es posible
              que los usuarios compartan de manera voluntaria información relacionada con su
              estado de salud o el de un familiar. Estos datos son considerados sensibles.
            </template>
          </UAlert>
          <ul class="space-y-2 text-toned">
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Neurofit IA garantiza que el suministro de datos sensibles por parte del usuario es
              estrictamente facultativo y voluntario.
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Dicha información se utilizará única y exclusivamente para entender mejor las
              necesidades del usuario y orientar adecuadamente la información sobre nuestros
              servicios.
            </li>
          </ul>
        </UCard>

        <!-- 4. Finalidad -->
        <UCard :id="sections[3].id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon :name="sections[3].icon" class="size-5 text-primary" />
              <h2 class="text-xl font-semibold text-highlighted">{{ sections[3].title }}</h2>
            </div>
          </template>
          <p class="text-toned mb-3">
            Los datos personales recolectados serán utilizados para los siguientes propósitos:
          </p>
          <ul class="space-y-2 text-toned">
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Enviar boletines informativos (newsletters) y campañas de email marketing con
              novedades, avances y noticias sobre Neurofit IA.
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Contactar a las personas interesadas para brindarles asesoría o información
              detallada sobre nuestros servicios de evaluación y tratamiento.
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Realizar análisis estadísticos internos para mejorar nuestros servicios y la
              experiencia del usuario.
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Gestionar solicitudes, quejas o reclamos.
            </li>
          </ul>
        </UCard>

        <!-- 5. Derechos -->
        <UCard :id="sections[4].id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon :name="sections[4].icon" class="size-5 text-primary" />
              <h2 class="text-xl font-semibold text-highlighted">{{ sections[4].title }}</h2>
            </div>
          </template>
          <p class="text-toned mb-3">Como titular de la información, tienes derecho a:</p>
          <ul class="space-y-2 text-toned">
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Conocer, actualizar y rectificar tus datos personales frente a Neurofit IA.
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Solicitar prueba de la autorización otorgada para el tratamiento de tus datos.
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Ser informado sobre el uso que se le ha dado a tus datos personales.
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Revocar la autorización y/o solicitar la supresión del dato en cualquier momento,
              especialmente si no deseas recibir más comunicaciones de email marketing.
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 mt-1 text-primary shrink-0" />
              Acceder en forma gratuita a tus datos personales que hayan sido objeto de
              tratamiento.
            </li>
          </ul>
        </UCard>

        <!-- 6. Seguridad -->
        <UCard :id="sections[5].id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon :name="sections[5].icon" class="size-5 text-primary" />
              <h2 class="text-xl font-semibold text-highlighted">{{ sections[5].title }}</h2>
            </div>
          </template>
          <p class="text-toned leading-relaxed">
            En Neurofit IA implementamos las medidas técnicas, humanas y administrativas
            necesarias para otorgar seguridad a los registros, evitando su adulteración,
            pérdida, consulta, uso o acceso no autorizado o fraudulento. La información se
            almacena en plataformas seguras de gestión de correos electrónicos y bases de datos
            con acceso restringido.
          </p>
        </UCard>

        <!-- 7. Consultas y reclamos -->
        <UCard :id="sections[6].id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon :name="sections[6].icon" class="size-5 text-primary" />
              <h2 class="text-xl font-semibold text-highlighted">{{ sections[6].title }}</h2>
            </div>
          </template>
          <p class="text-toned leading-relaxed mb-4">
            Para ejercer tus derechos (conocer, actualizar, rectificar o eliminar tus datos),
            puedes enviar una solicitud formal al correo electrónico
            <ULink :to="`mailto:${companyInfo.email}`" class="text-primary font-medium">
              {{ companyInfo.email }}
            </ULink>.
            Tu solicitud será atendida en un plazo máximo de
            <span class="font-medium text-highlighted">{{ companyInfo.diasHabilesRespuesta }}</span>
            días hábiles.
          </p>
          <UAlert
            color="primary"
            variant="subtle"
            icon="i-lucide-mail-x"
            title="Cancelar suscripción"
          >
            <template #description>
              Si deseas darte de baja de nuestra lista de email marketing, también puedes
              hacerlo en cualquier momento haciendo clic en el enlace de "Cancelar suscripción"
              ubicado en la parte inferior de nuestros correos.
            </template>
          </UAlert>
        </UCard>

        <!-- 8. Vigencia -->
        <UCard :id="sections[7].id">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon :name="sections[7].icon" class="size-5 text-primary" />
              <h2 class="text-xl font-semibold text-highlighted">{{ sections[7].title }}</h2>
            </div>
          </template>
          <p class="text-toned leading-relaxed">
            La presente política rige a partir de su publicación. Las bases de datos en las que
            se registrarán los datos personales tendrán una vigencia igual al tiempo en que se
            mantenga y utilice la información para las finalidades descritas, o hasta que el
            titular solicite su eliminación.
          </p>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>