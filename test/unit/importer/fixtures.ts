import type { Scale } from '../../../shared/types/assessment'

const scale = (code: string, labels: Array<[string, string, number | null]>): Scale => ({
  code,
  name: { es: code, en: code },
  options: labels.map(([value, es, score], index) => ({ value, label: { es, en: es }, score, position: index + 1 })),
})

export const scales: Scale[] = [
  scale('F5', [['never', 'Nunca', 0], ['rarely', 'Rara vez', 1], ['sometimes', 'A veces', 2], ['often', 'A menudo', 3], ['always', 'Siempre', 4]]),
  scale('IND', [['independent', 'Independiente', 0], ['needs_help', 'Necesita ayuda', 1]]),
  scale('SNN', [['yes', 'Sí', null], ['no', 'No', null], ['unknown', 'No lo sé', null]]),
  scale('FC', [['never', 'Nunca', 0], ['days_1_2', '1–2 días/semana', 1], ['days_3_5', '3–5 días/semana', 2], ['daily', 'Todos los días', 3]]),
]

/** Two modules and five rows, in the format of docs/test-1.md. */
export const twoModules = [
  '# Test de prueba', //                                                    1
  '', //                                                                    2
  '## Módulo 1 · Memoria (`MEM`) — F5', //                                  3
  '', //                                                                    4
  '| ID | Ref | Pregunta | Tipo | Opciones / escala |', //                   5
  '|---|---|---|---|---|', //                                               6
  '| MEM_001 | P4 | ¿Olvidas conversaciones recientes? | F5 | |', //        7
  '| MEM_002 | P5 | ¿Cuántas veces al día? | NUM (veces) | |', //           8
  '| MEM_003 | — | ¿Usas notas? ⚑ | OM | Agenda · Alarmas † · **Ninguna** (excluyente) |', // 9
  '', //                                                                    10
  '## Módulo 2 · Sueño (`SLP`)', //                                         11
  '', //                                                                    12
  '| ID | Ref | Pregunta | Tipo |', //                                      13
  '|---|---|---|---|', //                                                   14
  '| SLP_001 | P54 | ¿Roncas? | SN |', //                                   15
  '| SLP_002 | — | ¿Algo más sobre tu sueño? *(opc.)* | OPEN |', //         16
].join('\n')
