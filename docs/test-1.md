# Test 1 — Evaluación inicial de salud cognitiva (V1.0)

Fuente: `EVALUACIÓN NEUROLÓGICA-NeurofitIA.md`. Este archivo es la **fuente única** para el seed del Test 1 (HU-30) y para las specs futuras. Estructura: 13 módulos → 124 preguntas (las 80 numeradas del documento base + variables sin numerar).

## Convenciones

| Tipo | `question_type` (plan §4) | Valor |
|---|---|---|
| **F5** Frecuencia | `multiple_choice` única con `score` | Nunca 0 · Rara vez 1 · A veces 2 · A menudo 3 · Siempre 4 |
| **IND** Autonomía | `multiple_choice` única con `score` | Independiente 0 · Necesita ayuda 1 |
| **SN** Sí/No | `true_false` | boolean |
| **SNN** Sí/No/No lo sé | `multiple_choice` única | opción |
| **OU** / **OM** | `multiple_choice` única / varias (`allow_multiple`) | opción(es) |
| **NUM** | `numeric_free` | número (unidad en `config.unit`) |
| **OPEN** | `open_text` | texto |

- **Ref**: número de la pregunta en el documento base (P1–P80); `—` = variable sin numerar del documento.
- **Dirección por defecto:** mayor puntuación = mayor señal (`higher_is_risk`), salvo que el módulo indique otra. Pesos: `null`, "pendiente de validación clínica".
- **Código de sección:** `DAT`, `ANT` (módulo 2, con preguntas `HIS`/`GEN`/`MED`/`SUB`), `MEM`, `ATT`, `EXEC`, `LANG`, `ORI`, `FUNC`, `EMO`, `SLP`, `PHY`, `NUT`, `SOCCOG` (módulo 13, con preguntas `COG`/`SOC`/`GLO`). El código de cada pregunta es único en todo el test.
- **†** opciones propuestas por no figurar en el documento; **⚑** redacción corregida (ver "Redacción a revisar"). **Ambas aprobadas** (queda pendiente solo el Módulo 9, borrador).
- Si una pregunta es obligatoria o no: todas `required = true` salvo las marcadas *(opc.)*; las sensibles admiten "Prefiero no responder".

---

## Módulo 1 · Datos básicos y contexto (`DAT`)

| ID | Ref | Pregunta | Tipo | Opciones / escala |
|---|---|---|---|---|
| DAT_001 | — | Edad | NUM | años |
| DAT_002 | — | Sexo | OU | Femenino · Masculino · Otro · Prefiero no decir † |
| DAT_003 | — | Nivel educativo | OU | Primaria · Secundaria · Técnica · Universitaria · Posgrado |
| DAT_004 | — | Ocupación actual | OPEN | |
| DAT_005 | — | Ocupación anterior | OPEN | |
| DAT_006 | — | País / ciudad | OU | selección |
| DAT_007 | — | Idioma principal | OU | selección |
| DAT_008 | — | Dominio manual | OU | Diestro · Zurdo · Ambidiestro † |
| DAT_009 | — | ¿Vives solo/a? | SN | |
| DAT_010 | — | ¿Quién te acompaña? (si no vives solo/a) | OU | Familia · Pareja · Cuidador · Otro |
| DAT_011 | — | ¿Quién está realizando la evaluación? | OU | La propia persona · Un familiar · Un cuidador |
| DAT_012 | P1 | ¿Cuál es el motivo principal por el que quieres hacer esta evaluación? | OU | Quiero saber cómo está mi memoria · Noté cambios en mi memoria · Mi familia ha notado cambios · Tengo dificultad para concentrarme · Tengo dificultades para organizarme · Me preocupa el Alzheimer o la demencia · Tengo antecedentes familiares · Quiero conocer la salud de mi cerebro · Quiero prevenir el deterioro cognitivo · Otro |
| DAT_013 | P2 | ¿Desde cuándo notaste estos cambios? | OU | Menos de 3 meses · 3–6 meses · 6–12 meses · 1–2 años · Más de 2 años · No he notado cambios |
| DAT_014 | P3 | ¿Cómo han sido estos cambios? ⚑ | OU | Se han mantenido estables · Han mejorado · Han empeorado lentamente · **Han empeorado rápidamente (alerta)** · No estoy seguro/a |

Condicional: DAT_010 solo si DAT_009 = No; DAT_014 se omite si DAT_013 = "No he notado cambios".

## Módulo 2 · Antecedentes y factores de riesgo (`HIS`, `GEN`, `MED`, `SUB`)

| ID | Ref | Pregunta | Tipo | Opciones / escala |
|---|---|---|---|---|
| HIS_001 | — | ¿Te han diagnosticado alguna de estas afecciones? | OM | Hipertensión · Diabetes · Colesterol alto · Enfermedad cardiovascular · Accidente cerebrovascular · Lesión cerebral traumática · Epilepsia · Enfermedad neurológica · Enfermedad tiroidea · Depresión · Ansiedad · Apnea del sueño ⚑ · Problemas de audición · Problemas de visión · Otro · **Ninguna** (excluyente) |
| GEN_001 | P50 | ¿Algún familiar tuyo ha tenido Alzheimer, demencia u otra enfermedad neurodegenerativa? | SNN | Sí · No · No lo sé |
| GEN_002 | P51 | ¿Qué parentesco tiene? ⚑ | OM | Madre · Padre · Hermano/a · Abuelo/a · Otro |
| GEN_003 | P52 | ¿A qué edad aproximada comenzaron sus síntomas? | NUM | años |
| MED_001 | P53 | ¿Tomas medicamentos de forma regular? | SN | |
| MED_002 | — | ¿Cuáles? | OPEN (lista) | un medicamento por ítem; se cruza luego con base farmacológica (HU-39) |
| SUB_001 | P75 | ¿Fumas actualmente? | SN | |
| SUB_002 | P76 | ¿Has fumado alguna vez? | SN | |
| SUB_003 | P77 | ¿Consumes bebidas alcohólicas? | SN | |
| SUB_004 | P78 | ¿Con qué frecuencia? | OU | Diario · Varias veces por semana · Una vez por semana · Ocasionalmente · Casi nunca † |
| SUB_005 | P79 | ¿Consumes actualmente alguna sustancia psicoactiva? | SN | |

Condicional: GEN_002/003 si GEN_001 = Sí; MED_002 si MED_001 = Sí; SUB_002 si SUB_001 = No; SUB_004 si SUB_003 = Sí. Todas las de SUB admiten "Prefiero no responder". Dirección: GEN/HIS/SUB = riesgo.

## Módulo 3 · Memoria (`MEM`) — F5

| ID | Ref | Pregunta | Tipo |
|---|---|---|---|
| MEM_001 | P4 | ¿Olvidas las conversaciones que tuviste recientemente? | F5 |
| MEM_002 | P5 | ¿Necesitas repetir la información que acabas de recibir? | F5 |
| MEM_003 | P6 | ¿Olvidas compromisos importantes? ⚑ | F5 |
| MEM_004 | P7 | ¿Sueles olvidar objetos que usas habitualmente? | F5 |
| MEM_005 | P8 | ¿Te cuesta recordar los nombres de personas famosas? | F5 |
| MEM_006 | P9 | ¿Entras en una habitación y olvidas lo que ibas a hacer? ⚑ | F5 |
| MEM_007 | P10 | ¿Te cuesta recordar acontecimientos recientes? | F5 |
| MEM_008 | P11 | ¿Has empezado a usar notas o alarmas del teléfono para recordar cosas que antes recordabas sin ayuda? ⚑ | F5 |
| MEM_009 | P12 | ¿Cuentas la misma historia o haces la misma pregunta varias veces? ⚑ | F5 |
| MEM_010 | P13 | ¿Las personas que te rodean han notado cambios en tu memoria? ⚑ | F5 |
| MEM_011 | P14 | En comparación con hace cinco años, ¿cómo valoras tu memoria actualmente? | OU: Mucho mejor 0 · Un poco mejor 1 · Igual 2 · Un poco peor 3 · Mucho peor 4 |

MEM_011 se conserva para el seguimiento longitudinal (HU-26).

## Módulo 4 · Atención y concentración (`ATT`) — F5

| ID | Ref | Pregunta | Tipo |
|---|---|---|---|
| ATT_001 | P15 | ¿Te resulta difícil concentrarte durante una conversación? | F5 |
| ATT_002 | P16 | ¿Te distraes fácilmente mientras realizas alguna actividad? | F5 |
| ATT_003 | P17 | ¿Te cuesta terminar una tarea porque pierdes el hilo de lo que hacías? ⚑ | F5 |
| ATT_004 | P18 | ¿Te resulta difícil seguir una película, un programa o la lectura de un libro? ⚑ | F5 |
| ATT_005 | P19 | ¿Te cuesta prestar atención cuando varias personas hablan a la vez? | F5 |
| ATT_006 | P20 | ¿Necesitas más tiempo que antes para realizar tus tareas habituales? | F5 |
| ATT_007 | P21 | ¿Te resulta difícil hacer dos cosas al mismo tiempo? ⚑ | F5 |

## Módulo 5 · Funciones ejecutivas (`EXEC`) — F5

| ID | Ref | Pregunta | Tipo |
|---|---|---|---|
| EXEC_001 | P22 | ¿Te resulta difícil organizar las actividades de tu día? | F5 |
| EXEC_002 | P23 | ¿Te resulta difícil planificar una actividad que tiene varios pasos? ⚑ | F5 |
| EXEC_003 | P24 | ¿Te resulta difícil resolver problemas cotidianos que antes solucionabas con facilidad? | F5 |
| EXEC_004 | P25 | ¿Te resulta difícil tomar decisiones que antes tomabas con facilidad? | F5 |
| EXEC_005 | P26 | ¿Te resulta difícil aprender a usar nuevos dispositivos o aplicaciones? | F5 |
| EXEC_006 | P27 | ¿Te resulta difícil cambiar de una actividad a otra? | F5 |
| EXEC_007 | P28 | ¿Te resulta difícil administrar tu dinero? | F5 |
| EXEC_008 | P29 | ¿Has cometido errores recientemente al pagar, hacer transferencias o gestionar cuentas? | F5 |

## Módulo 6 · Idioma (`LANG`) — F5

| ID | Ref | Pregunta | Tipo |
|---|---|---|---|
| LANG_001 | P30 | ¿Tienes dificultades para encontrar palabras conocidas? | F5 |
| LANG_002 | P31 | ¿Usas expresiones como "esa cosa" porque no recuerdas el nombre de algo? | F5 |
| LANG_003 | P32 | ¿Te quedas en blanco o te detienes a mitad de una conversación? ⚑ | F5 |
| LANG_004 | P33 | ¿Tienes dificultades para comprender instrucciones? | F5 |
| LANG_005 | P34 | ¿Te cuesta expresar una idea que antes explicabas con facilidad? ⚑ | F5 |
| LANG_006 | P35 | ¿Tienes dificultades para escribir mensajes o textos? | F5 |

## Módulo 7 · Orientación y habilidades visoespaciales (`ORI`) — F5

| ID | Ref | Pregunta | Tipo |
|---|---|---|---|
| ORI_001 | P36 | ¿Últimamente te has confundido con el día, el mes o el año? ⚑ | F5 |
| ORI_002 | P37 | ¿Te has sentido desorientado/a en un lugar que conoces? | F5 |
| ORI_003 | P38 | ¿Te ha resultado difícil encontrar la ruta en lugares habituales? | F5 |
| ORI_004 | P39 | ¿Has tenido algún problema reciente para estacionar? ⚑ | F5 |
| ORI_005 | P40 | ¿Te resulta difícil calcular distancias o ubicarte en un espacio? | F5 |

## Módulo 8 · Actividades de la vida diaria (`FUNC`) — peso alto (fundamental)

| ID | Ref | Actividad / pregunta | Tipo |
|---|---|---|---|
| FUNC_001 | P41 | Administrar tus medicamentos | IND |
| FUNC_002 | P42 | Gestionar tu dinero | IND |
| FUNC_003 | P42 | Pagar facturas | IND |
| FUNC_004 | P43 | Realizar compras | IND |
| FUNC_005 | P44 | Preparar la comida | IND |
| FUNC_006 | P45 | Usar el teléfono | IND |
| FUNC_007 | P46 | Organizar tus citas | IND |
| FUNC_008 | — | Usar el transporte | IND |
| FUNC_009 | P47 | Moverte por lugares concurridos | IND |
| FUNC_010 | — | Realizar actividades laborales | IND |
| FUNC_011 | P48 | ¿Alguna de estas dificultades es nueva y se ha producido durante el último año? | SN |
| FUNC_012 | P49 | ¿Con qué actividad te gustaría recibir ayuda? | OPEN |
| FUNC_013 | — | ¿Desde cuándo necesitas ayuda y qué actividades han cambiado? | OPEN *(opc.)* |

Condicional: FUNC_011 y FUNC_013 si alguna FUNC_001–010 = "Necesita ayuda"; FUNC_012 si FUNC_011 = Sí.

## Módulo 9 · Estado emocional (`EMO`) — BORRADOR

> El documento base indica usar **instrumentos psicológicos validados** y no crear estas preguntas desde cero. Los ítems siguientes son **marcadores de posición** (uno por tema listado en el documento) para que el módulo exista en el seed; psicología debe reemplazarlos por el instrumento elegido (ej. PHQ-9, GAD-7, sujetos a licencia). No se publican con peso hasta validarlos.

| ID | Ref | Pregunta (borrador) | Tipo |
|---|---|---|---|
| EMO_001 | — | En las últimas dos semanas, ¿con qué frecuencia te has sentido triste o decaído/a? | F5 |
| EMO_002 | — | ¿Con qué frecuencia has perdido interés en cosas que antes disfrutabas? | F5 |
| EMO_003 | — | ¿Con qué frecuencia te has sentido ansioso/a o muy preocupado/a? | F5 |
| EMO_004 | — | ¿Con qué frecuencia te has sentido irritable? | F5 |
| EMO_005 | — | ¿Con qué frecuencia te has sentido bajo mucho estrés? | F5 |
| EMO_006 | — | ¿Con qué frecuencia has sentido ganas de aislarte de los demás? | F5 |
| EMO_007 | — | ¿Con qué frecuencia sientes que has perdido capacidades que tenías? | F5 |
| EMO_008 | — | ¿Con qué frecuencia te cuesta encontrar motivación para hacer cosas? | F5 |
| EMO_009 | — | ¿Has notado cambios emocionales importantes en los últimos meses? | SN |

Todas admiten "Prefiero no responder". Señales de crisis se manejan con HU-19, no con este módulo.

## Módulo 10 · Sueño (`SLP`)

| ID | Ref | Pregunta | Tipo |
|---|---|---|---|
| SLP_001 | P54 | ¿Cuántas horas duermes habitualmente por noche? ⚑ | NUM (horas) |
| SLP_002 | P55 | ¿Tienes dificultad para conciliar el sueño? | F5 |
| SLP_003 | P56 | ¿Te despiertas con frecuencia durante la noche? | F5 |
| SLP_004 | P57 | ¿Te despiertas sintiéndote descansado/a? | F5 (dirección: mayor = protector) |
| SLP_005 | P58 | ¿Sientes somnolencia durante el día? ⚑ | F5 |
| SLP_006 | P59 | ¿Roncas con frecuencia? | F5 |
| SLP_007 | P60 | ¿Alguien te ha dicho que dejas de respirar mientras duermes? ⚑ | SN |

El algoritmo separa **cantidad** (SLP_001) de **calidad** (SLP_002–005).

## Módulo 11 · Actividad física (`PHY`)

| ID | Ref | Pregunta | Tipo | Opciones |
|---|---|---|---|---|
| PHY_001 | P61 | ¿Cuántos días a la semana realizas actividad física? | NUM (0–7) | |
| PHY_002 | P62 | ¿Cuánto tiempo le dedicas cada vez? | NUM (minutos) | |
| PHY_003 | P63 | ¿Qué tipo de actividad realizas? | OM | Caminar · Correr · Bicicleta · Nadar · Entrenamiento de fuerza · Deporte · Yoga/Pilates · Otro · **Ninguna** (excluyente) |
| PHY_004 | — | ¿Practicas entrenamiento de fuerza? | SN | |
| PHY_005 | P64 | ¿Cuántas horas pasas sentado/a al día? | NUM (horas) | |
| PHY_006 | — | ¿Has reducido tu actividad física últimamente? | SN | |

Dirección: PHY_001–004 = protector; PHY_005–006 = riesgo.

## Módulo 12 · Nutrición y salud metabólica (`NUT`)

Frecuencia de consumo (escala **FC** †): Nunca · 1–2 días/semana · 3–5 días/semana · Todos los días. Pregunta común: "¿Con qué frecuencia consumes…?"

| ID | Ref | Ítem | Tipo | Dirección |
|---|---|---|---|---|
| NUT_001 | — | Frutas | FC | protector |
| NUT_002 | — | Verduras | FC | protector |
| NUT_003 | — | Pescado | FC | protector |
| NUT_004 | — | Frutos secos | FC | protector |
| NUT_005 | — | Cereales integrales | FC | protector |
| NUT_006 | — | Alimentos ultraprocesados | FC | riesgo |
| NUT_007 | — | Bebidas azucaradas | FC | riesgo |
| NUT_008 | — | Carnes procesadas | FC | riesgo |
| NUT_009 | — | Alimentos fritos | FC | riesgo |
| NUT_010 | — | Peso | NUM (kg) | neutral |
| NUT_011 | — | Talla | NUM (cm) | neutral |
| NUT_012 | — | Cambio de peso reciente | OU: Sin cambios · Aumentó · Disminuyó † | riesgo |
| NUT_013 | — | Presión arterial sistólica habitual *(opc.)* | NUM (mmHg) | riesgo |
| NUT_014 | — | Presión arterial diastólica habitual *(opc.)* | NUM (mmHg) | riesgo |
| NUT_015 | — | Glucosa en ayunas, si la conoces *(opc.)* | NUM (mg/dL) | riesgo |
| NUT_016 | — | Colesterol total, si lo conoces *(opc.)* | NUM (mg/dL) | riesgo |

> Los datos aislados no se interpretan como diagnóstico.

## Módulo 13 · Socialización y estimulación cognitiva (`COG`, `SOC`)

Dirección: protector (mayor frecuencia = mejor), salvo SOC_004 (riesgo).

| ID | Ref | Pregunta | Tipo |
|---|---|---|---|
| COG_001 | P65 | ¿Sueles leer? | F5 |
| COG_002 | P66 | ¿Aprendes cosas nuevas? | F5 |
| COG_003 | P67 | ¿Realizas juegos o actividades cognitivas? | F5 |
| COG_004 | P68 | ¿Realizas actividades artísticas? | F5 |
| COG_005 | P69 | ¿Usas con regularidad un computador, un teléfono móvil u otra tecnología? | F5 |
| COG_006 | P70 | ¿Participas en cursos, grupos o actividades de aprendizaje? | F5 |
| SOC_001 | P71 | ¿Con qué frecuencia compartes con familiares o amigos? | OU: A diario · Varias veces por semana · Una vez por semana · Algunas veces al mes ⚑ · Casi nunca |
| SOC_002 | P72 | ¿Participas en grupos o actividades comunitarias? | F5 |
| SOC_003 | P73 | ¿Te sientes acompañado/a por otras personas? | F5 |
| SOC_004 | P74 | ¿Has reducido tus actividades sociales durante el último año? | SN |
| GLO_001 | P80 | ¿Qué cambio cognitivo te preocupa más últimamente? *(pregunta de cierre)* | OPEN |

GLO_001 se formula al final; es la materia prima del análisis de lenguaje natural (clasifica el ámbito potencialmente afectado, sin diagnosticar).

---

## Redacción corregida (⚑) — aprobada

El documento base tiene frases con errores evidentes de traducción. Se corrigieron en las tablas y las correcciones fueron aprobadas.

| Ítem | Original | Propuesta aplicada |
|---|---|---|
| DAT_014 | "Establecimientos … No estoy a salvo/a" | "Se han mantenido estables … No estoy seguro/a" |
| HIS_001 | "Apnea del sudor" | "Apnea del sueño" |
| GEN_002 | "Sacerdote" | "Padre" |
| MEM_003 | "¿Menciona Olvida compromisos importantes?" | "¿Olvidas compromisos importantes?" |
| MEM_006 | "¿Entrar en una habitación y olvidarse de lo que va a hacer?" | forma en 2.ª persona |
| MEM_008–010 | redacción confusa (V1.0) | redacción de la especificación funcional (MEM_008/009/010) |
| ATT_003 | "…porque no entiendes el objetivo" | "…porque pierdes el hilo" (módulo 4 del documento) |
| ATT_004 | "seguir una película, un programa o leerlo" | "…o la lectura de un libro" |
| ATT_007 | "…teniendo en cuenta otra información" | "hacer dos cosas al mismo tiempo" (módulo 4) |
| EXEC_002 | "¿Es importante planificar…?" | "¿Te resulta difícil planificar…?" |
| LANG_003 | "¿Detenerse al final de una conversación?" | "¿Te quedas en blanco o te detienes a mitad de una conversación?" |
| LANG_005 | "¿Te supone algún coste expresar…?" | "¿Te cuesta expresar…?" |
| ORI_001 | "el día, el mes o el cierre" | "el día, el mes o el año" |
| ORI_004 | "aparcar" | "estacionar" (español de Colombia) |
| SLP_001 | "¿Cuántas horas suelo dedicarle?" | "¿Cuántas horas duermes…?" |
| SLP_005 | "¿Sudas durante el día?" | "¿Sientes somnolencia durante el día?" (módulo 10) |
| SLP_007 | "durante el invierno" | "mientras duermes" |
| SOC_001 | "A veces lo mismo" | "Algunas veces al mes" |

## Fuera del Test 1

Informante/familiar (sección 9 del documento) → HU-27; batería cognitiva digital → HU-28; hidratación, grasas saturadas y regularidad de comidas (listadas en el Módulo 12 de la propuesta pero no en la V1.0) → decisión pendiente del equipo.
