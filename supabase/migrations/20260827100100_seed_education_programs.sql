-- Contenido inicial: las 10 conferencias del catalogo Neurofit Talks.

insert into public.education_programs
  (slug, line, position, icon, title, title_en, objective, objective_en, topics, topics_en)
values
  (
    'cerebro-saludable', 'talk', 1, 'i-lucide-brain',
    'El cerebro saludable: la clave del bienestar y el alto desempeño',
    'The healthy brain: the key to wellbeing and high performance',
    'Comprender cómo los hábitos cotidianos influyen en el funcionamiento del cerebro, la productividad, la creatividad y el bienestar.',
    'Understand how everyday habits shape brain function, productivity, creativity and wellbeing.',
    array[
      'Cómo funciona el cerebro.',
      'Neuroplasticidad.',
      'Hábitos que fortalecen la salud cerebral.',
      'Factores que afectan el rendimiento cognitivo.',
      'Estrategias para cuidar el cerebro durante toda la vida.'
    ],
    array[
      'How the brain works.',
      'Neuroplasticity.',
      'Habits that strengthen brain health.',
      'Factors that affect cognitive performance.',
      'Strategies to care for the brain throughout life.'
    ]
  ),
  (
    'estres-bajo-control', 'talk', 2, 'i-lucide-wind',
    'Estrés bajo control: estrategias para proteger la salud mental',
    'Stress under control: strategies to protect mental health',
    'Brindar herramientas prácticas para reconocer, comprender y gestionar el estrés de manera saludable.',
    'Provide practical tools to recognise, understand and manage stress in a healthy way.',
    array[
      '¿Qué ocurre en el cerebro durante el estrés?',
      'Estrés agudo y estrés crónico.',
      'Regulación emocional.',
      'Técnicas para disminuir la carga mental.',
      'Construcción de hábitos saludables.'
    ],
    array[
      'What happens in the brain during stress?',
      'Acute stress and chronic stress.',
      'Emotional regulation.',
      'Techniques to reduce mental load.',
      'Building healthy habits.'
    ]
  ),
  (
    'burnout-agotamiento-laboral', 'talk', 3, 'i-lucide-battery-low',
    'Burnout: cómo prevenir el agotamiento laboral',
    'Burnout: how to prevent workplace exhaustion',
    'Identificar los factores que favorecen el agotamiento laboral y desarrollar estrategias para prevenirlo.',
    'Identify the factors behind workplace exhaustion and build strategies to prevent it.',
    array[
      'Qué es el síndrome de burnout.',
      'Señales de alerta.',
      'Factores de riesgo.',
      'Estrategias individuales y organizacionales.',
      'Cultura del bienestar.'
    ],
    array[
      'What burnout syndrome is.',
      'Warning signs.',
      'Risk factors.',
      'Individual and organisational strategies.',
      'A culture of wellbeing.'
    ]
  ),
  (
    'inteligencia-emocional-equipos', 'talk', 4, 'i-lucide-heart-handshake',
    'Inteligencia emocional para equipos de alto desempeño',
    'Emotional intelligence for high-performing teams',
    'Fortalecer la capacidad para reconocer, comprender y gestionar las emociones en el entorno laboral.',
    'Strengthen the ability to recognise, understand and manage emotions at work.',
    array[
      'Autoconocimiento.',
      'Autorregulación emocional.',
      'Empatía.',
      'Comunicación efectiva.',
      'Relaciones laborales saludables.'
    ],
    array[
      'Self-awareness.',
      'Emotional self-regulation.',
      'Empathy.',
      'Effective communication.',
      'Healthy working relationships.'
    ]
  ),
  (
    'habitos-mente-productiva', 'talk', 5, 'i-lucide-leaf',
    'Hábitos saludables para una mente productiva',
    'Healthy habits for a productive mind',
    'Promover hábitos que favorezcan la concentración, la energía y el bienestar integral.',
    'Promote habits that support focus, energy and whole-person wellbeing.',
    array[
      'Sueño.',
      'Actividad física.',
      'Alimentación.',
      'Manejo del estrés.',
      'Organización del tiempo.'
    ],
    array[
      'Sleep.',
      'Physical activity.',
      'Nutrition.',
      'Stress management.',
      'Time management.'
    ]
  ),
  (
    'liderazgo-que-inspira-bienestar', 'talk', 6, 'i-lucide-compass',
    'Liderazgo que inspira bienestar',
    'Leadership that inspires wellbeing',
    'Desarrollar competencias de liderazgo que favorezcan equipos saludables, motivados y comprometidos.',
    'Develop leadership skills that foster healthy, motivated and committed teams.',
    array[
      'Liderazgo consciente.',
      'Seguridad psicológica.',
      'Comunicación.',
      'Reconocimiento.',
      'Bienestar como estrategia organizacional.'
    ],
    array[
      'Conscious leadership.',
      'Psychological safety.',
      'Communication.',
      'Recognition.',
      'Wellbeing as an organisational strategy.'
    ]
  ),
  (
    'salud-mental-en-el-trabajo', 'talk', 7, 'i-lucide-shield-check',
    'Salud mental en el trabajo: responsabilidad de todos',
    'Mental health at work: everyone''s responsibility',
    'Sensibilizar sobre la importancia de la salud mental como un elemento fundamental para el desarrollo de las organizaciones.',
    'Raise awareness of mental health as a cornerstone of organisational development.',
    array[
      'Mitos sobre la salud mental.',
      'Factores protectores.',
      'Señales de alerta.',
      'Promoción y prevención.',
      'Construcción de una cultura organizacional saludable.'
    ],
    array[
      'Myths about mental health.',
      'Protective factors.',
      'Warning signs.',
      'Promotion and prevention.',
      'Building a healthy organisational culture.'
    ]
  ),
  (
    'poder-de-la-resiliencia', 'talk', 8, 'i-lucide-sprout',
    'El poder de la resiliencia: afrontar los cambios con fortaleza',
    'The power of resilience: facing change with strength',
    'Fortalecer la capacidad de adaptación frente a los desafíos personales y laborales.',
    'Strengthen the capacity to adapt to personal and professional challenges.',
    array[
      'Qué es la resiliencia.',
      'Adaptación al cambio.',
      'Flexibilidad psicológica.',
      'Afrontamiento saludable.',
      'Crecimiento personal.'
    ],
    array[
      'What resilience is.',
      'Adapting to change.',
      'Psychological flexibility.',
      'Healthy coping.',
      'Personal growth.'
    ]
  ),
  (
    'bienestar-organizacional', 'talk', 9, 'i-lucide-trending-up',
    'Bienestar organizacional: una inversión que transforma empresas',
    'Organisational wellbeing: an investment that transforms companies',
    'Mostrar cómo el bienestar impacta la productividad, el compromiso y la sostenibilidad de las organizaciones.',
    'Show how wellbeing drives productivity, engagement and organisational sustainability.',
    array[
      'Bienestar organizacional basado en evidencia.',
      'Riesgos psicosociales.',
      'Cultura organizacional.',
      'Compromiso.',
      'Estrategias de promoción y prevención.'
    ],
    array[
      'Evidence-based organisational wellbeing.',
      'Psychosocial risks.',
      'Organisational culture.',
      'Engagement.',
      'Promotion and prevention strategies.'
    ]
  ),
  (
    'futuro-del-bienestar-ia', 'talk', 10, 'i-lucide-sparkles',
    'El futuro del bienestar: Neurociencia e Inteligencia Artificial',
    'The future of wellbeing: neuroscience and artificial intelligence',
    'Explorar cómo la inteligencia artificial y la neurociencia pueden apoyar la promoción del bienestar y la salud mental en las organizaciones.',
    'Explore how artificial intelligence and neuroscience can support wellbeing and mental health in organisations.',
    array[
      'Tendencias globales.',
      'Inteligencia Artificial aplicada al bienestar.',
      'Agentes conversacionales.',
      'Brain Score™ como herramienta de evaluación preliminar.',
      'Visión de Neurofit IA y el futuro del bienestar organizacional.'
    ],
    array[
      'Global trends.',
      'Artificial intelligence applied to wellbeing.',
      'Conversational agents.',
      'Brain Score™ as a preliminary screening tool.',
      'The Neurofit IA vision and the future of organisational wellbeing.'
    ]
  );
