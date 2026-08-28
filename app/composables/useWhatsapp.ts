/** Número oficial de Neurofit en formato internacional, sin `+`. */
export const WHATSAPP_PHONE = '573105423860'

/** Construye un enlace de WhatsApp con el mensaje ya escrito. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}
