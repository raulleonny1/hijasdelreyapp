export type Locale = "es" | "en";

export const LOCALE_STORAGE_KEY = "hdr_locale";

export type CourseUiCopy = {
  title: string;
  subtitle: string;
  author: string;
  description: string;
  category: string;
};

export type Messages = {
  brand: string;
  brandShort: string;
  studyGuide: string;
  footerEdition: string;
  nav: {
    home: string;
    studies: string;
    chat: string;
    prayer: string;
    enter: string;
    register: string;
    registerShort: string;
    logout: string;
  };
  language: {
    group: string;
    es: string;
    en: string;
  };
  home: {
    createAccount: string;
    enterWithPin: string;
    yourPath: string;
    twelveWeeks: string;
    studiesBlurb: string;
    accessStudies: string;
    purposeTitle: string;
    purposeSubtitle: string;
    ctaReady: string;
    register: string;
    signIn: string;
    intro: {
      title: string;
      subtitle: string;
      description: string;
      scripture: string;
      motto: string;
      mottoTranslation: string;
      initials: string;
      purposes: string[];
    };
    studies: { id: number; title: string; part: string }[];
  };
  login: {
    title: string;
    subtitle: string;
    firstTime: string;
    createAccount: string;
    registeredOk: string;
    pinLabel: string;
    entering: string;
    enter: string;
    errPinLength: string;
    errLogin: string;
    errConnection: string;
  };
  register: {
    title: string;
    subtitle: string;
    hasAccount: string;
    signInPin: string;
    firstName: string;
    lastName: string;
    email: string;
    placeholderFirst: string;
    placeholderLast: string;
    placeholderEmail: string;
    pinCreate: string;
    pinConfirm: string;
    submitting: string;
    submit: string;
    errNameRequired: string;
    errBirthDate: string;
    errEmail: string;
    errPinLength: string;
    errPinMismatch: string;
    errRegister: string;
    errConnection: string;
  };
  birthDate: {
    label: string;
    pickParts: string;
    useCalendar: string;
    day: string;
    month: string;
    year: string;
    hint: string;
    months: string[];
  };
  pinDigit: string;
  welcome: {
    aria: string;
    tap: string;
  };
  pwa: {
    aria: string;
    title: string;
    ios: string;
    android: string;
    install: string;
    later: string;
  };
  estudios: {
    welcomeBanner: string;
    libraryEyebrow: string;
    hello: string;
    loggedInBlurb: string;
    guestTitle: string;
    guestBlurb: string;
    goLesson1: string;
    formationLibrary: string;
  };
  course: {
    official: string;
    readingDoc: string;
    lessons: string;
    weeks: string;
    weeksSuggested: string;
    read: string;
    viewCourse: string;
    comingSoon: string;
    backLibrary: string;
    backCourses: string;
  };
  lesson: {
    of: string;
    questions: string;
    prev: string;
    next: string;
    completed: string;
  };
  studyTabs: {
    summary: string;
    reading: string;
    questions: string;
    summaryTitle: string;
    section: string;
    focus: string;
    goReading: string;
    material: string;
    emptyContent: string;
    questionsIntro: string;
    imageAlt: string;
  };
  questions: {
    loading: string;
    empty: string;
    progress: string;
    placeholder: string;
    saved: string;
    saveError: string;
    authRequired: string;
  };
  reading: {
    eyebrow: string;
    tocAria: string;
    contents: string;
    imageAlt: string;
  };
  chat: {
    title: string;
    community: string;
    privateChat: string;
    newPrivate: string;
    searchMembers: string;
    noMembers: string;
    selectConversation: string;
    emptyThread: string;
    placeholder: string;
    send: string;
    emoji: string;
    record: string;
    stopRecord: string;
    recording: string;
    cancel: string;
    showOriginal: string;
    showTranslation: string;
    translated: string;
    loading: string;
    loadError: string;
    sendError: string;
    audioError: string;
    micDenied: string;
    you: string;
    back: string;
    membersTitle: string;
    startChat: string;
    audioMessage: string;
  };
  prayer: {
    title: string;
    subtitle: string;
    tabRead: string;
    tabPublish: string;
    tabMine: string;
    emptyShared: string;
    emptyMine: string;
    yourRequest: string;
    placeholder: string;
    consentLabel: string;
    consentHint: string;
    publish: string;
    publishing: string;
    published: string;
    sharedBadge: string;
    privateBadge: string;
    delete: string;
    confirmDelete: string;
    you: string;
    loading: string;
    loadError: string;
    publishError: string;
    deleteError: string;
    errEmpty: string;
    errConsent: string;
  };
  courses: Record<string, CourseUiCopy>;
  apiErrors: Record<string, string>;
};

const homeStudiesEs: Messages["home"]["studies"] = [
  { id: 1, title: "¿Qué es un cristiano?", part: "Hijas en camino" },
  { id: 2, title: "¿Qué es una orden?", part: "Hijas en camino" },
  { id: 3, title: "¿Qué espera Cristo de sus Hijas?", part: "Nuestro compromiso" },
  {
    id: 4,
    title: "¿Cuál es el propósito principal de la Orden?",
    part: "Nuestro compromiso",
  },
  { id: 5, title: "¿Cuál es el propósito de un Capítulo?", part: "Nuestro compromiso" },
  { id: 6, title: "Oración y Estudio", part: "Martas y Marías" },
  { id: 7, title: "Servicio y Evangelización", part: "Martas y Marías" },
  { id: 8, title: "¿Qué es una Regla de Vida?", part: "Martas y Marías" },
  {
    id: 9,
    title: "¿Cómo las Hijas son empoderadas para servir?",
    part: "Extender la mano para servir",
  },
  { id: 10, title: "¿Cuál es el siguiente paso?", part: "¿Está llamada a la Orden?" },
];

const homeStudiesEn: Messages["home"]["studies"] = [
  { id: 1, title: "What is a Christian?", part: "Daughters on a journey" },
  { id: 2, title: "What is an Order?", part: "Daughters on a journey" },
  {
    id: 3,
    title: "What does Christ expect of His Daughters?",
    part: "Our commitment",
  },
  {
    id: 4,
    title: "What is the primary purpose of The Order?",
    part: "Our commitment",
  },
  { id: 5, title: "What is the purpose of a chapter?", part: "Our commitment" },
  { id: 6, title: "Prayer and Study", part: "Marthas and Marys" },
  { id: 7, title: "Service and Evangelism", part: "Marthas and Marys" },
  { id: 8, title: "What is a Rule of Life?", part: "Marthas and Marys" },
  {
    id: 9,
    title: "How Daughters are empowered to serve",
    part: "Reaching out to serve",
  },
  { id: 10, title: "What is the next step?", part: "Are you called to The Order?" },
];

const coursesEs: Messages["courses"] = {
  "guia-nacional": {
    title: "Guía de Estudio Internacional 2022",
    subtitle: "Preparación para La Orden de las Hijas del Rey®",
    author: "La Orden de las Hijas del Rey",
    description:
      "Diez estudios oficiales para la preparación a la admisión en La Orden.",
    category: "Formación en La Orden",
  },
  anglicanismo: {
    title: "Anglicanismo",
    subtitle: "Identidad, historia y fe de la Comunión Anglicana",
    author: "Material de formación",
    description:
      "Documento completo de lectura sobre el Anglicanismo, con todo el texto e imágenes del material original.",
    category: "Biblioteca de formación",
  },
  "matrimonio-iere": {
    title: "Matrimonio en la Comunión Anglicana",
    subtitle: "Celebración religiosa anglicana en España (IERE)",
    author: "Catalina Pons - Estel Tugores",
    description:
      "Estudio sobre el matrimonio sacramental en la Iglesia Española Reformada Episcopal: doctrina, requisitos civiles y eclesiásticos, y celebración litúrgica.",
    category: "Doctrina y vida sacramental",
  },
  "idiomas-biblia": {
    title: "Los idiomas de la Santa Biblia",
    subtitle: "Hebreo, arameo y griego en las Escrituras",
    author: "Juan María Tellería Larrañaga",
    description:
      "Introducción pedagógica a las lenguas en que fue escrita la Biblia, para enriquecer la lectura y el estudio de las Sagradas Escrituras.",
    category: "Estudio bíblico",
  },
  "calvino-vida-cristiana": {
    title: "Meditaciones cristianas",
    subtitle: "El Libro de Oro de la verdadera vida cristiana",
    author: "Juan Calvino",
    description:
      "Cinco capítulos devocionales de Calvino sobre obediencia, auto negación, la cruz y el uso cristiano de la vida presente.",
    category: "Espiritualidad reformada",
  },
  "lewis-problema-dolor": {
    title: "El problema del dolor",
    subtitle: "Una respuesta cristiana al sufrimiento",
    author: "C. S. Lewis",
    description:
      "Clásico de apologética cristiana que explora por qué existe el dolor si Dios es bueno y todopoderoso, y qué respuesta ofrece la fe.",
    category: "Apologética y pastoral",
  },
  "libros-biblia": {
    title: "Los libros de la Biblia",
    subtitle: "Panorama del Antiguo y Nuevo Testamento",
    author: "José Manuel Díaz Yanes – Juan María Tellería Larrañaga",
    description:
      "Curso introductorio que recorre cada gran sección de la Biblia: su mensaje, contexto y lugar en la Historia de la Salvación.",
    category: "Estudio bíblico",
  },
  "pulpito-cristiano": {
    title: "Púlpito cristiano",
    subtitle: "Sermones para la predicación y el estudio grupal",
    author: "Samuel Vila",
    description:
      "Colección de sermones evangélicos con estructura clara: ideal para reflexión personal, grupos pequeños o preparación homilética.",
    category: "Homilética y predicación",
  },
  "moltmann-dios-crucificado": {
    title: "El Dios crucificado",
    subtitle:
      "La cruz de Cristo como fundamento y crítica de la teología cristiana",
    author: "Jürgen Moltmann",
    description:
      "Este libro está en formato escaneado sin texto extraíble. Se añadirá cuando dispongamos de una versión digital legible.",
    category: "Teología sistemática",
  },
};

const coursesEn: Messages["courses"] = {
  "guia-nacional": {
    title: "International Study Guide 2022",
    subtitle: "Preparation for The Order of the Daughters of the King®",
    author: "The Order of the Daughters of the King",
    description:
      "Ten official studies for preparation for admission into The Order.",
    category: "Formation in The Order",
  },
  anglicanismo: {
    title: "Anglicanism",
    subtitle: "Identity, history, and faith of the Anglican Communion",
    author: "Formation material",
    description:
      "Complete reading document on Anglicanism, with the full text and images from the original material.",
    category: "Formation library",
  },
  "matrimonio-iere": {
    title: "Marriage in the Anglican Communion",
    subtitle: "Anglican religious celebration in Spain (IERE)",
    author: "Catalina Pons - Estel Tugores",
    description:
      "A study of sacramental marriage in the Spanish Reformed Episcopal Church: doctrine, civil and ecclesiastical requirements, and liturgical celebration.",
    category: "Doctrine and sacramental life",
  },
  "idiomas-biblia": {
    title: "The languages of the Holy Bible",
    subtitle: "Hebrew, Aramaic, and Greek in the Scriptures",
    author: "Juan María Tellería Larrañaga",
    description:
      "A pedagogical introduction to the languages in which the Bible was written, to enrich reading and study of the Holy Scriptures.",
    category: "Biblical study",
  },
  "calvino-vida-cristiana": {
    title: "Christian meditations",
    subtitle: "The Golden Book of the true Christian life",
    author: "John Calvin",
    description:
      "Five devotionals by Calvin on obedience, self-denial, the cross, and the Christian use of the present life.",
    category: "Reformed spirituality",
  },
  "lewis-problema-dolor": {
    title: "The Problem of Pain",
    subtitle: "A Christian response to suffering",
    author: "C. S. Lewis",
    description:
      "A classic of Christian apologetics exploring why pain exists if God is good and all-powerful, and what answer faith offers.",
    category: "Apologetics and pastoral care",
  },
  "libros-biblia": {
    title: "The books of the Bible",
    subtitle: "Overview of the Old and New Testament",
    author: "José Manuel Díaz Yanes – Juan María Tellería Larrañaga",
    description:
      "An introductory course covering each major section of the Bible: its message, context, and place in the History of Salvation.",
    category: "Biblical study",
  },
  "pulpito-cristiano": {
    title: "Christian pulpit",
    subtitle: "Sermons for preaching and group study",
    author: "Samuel Vila",
    description:
      "A collection of evangelical sermons with clear structure: ideal for personal reflection, small groups, or homiletic preparation.",
    category: "Homiletics and preaching",
  },
  "moltmann-dios-crucificado": {
    title: "The Crucified God",
    subtitle:
      "The cross of Christ as foundation and critique of Christian theology",
    author: "Jürgen Moltmann",
    description:
      "This book is in a scanned format without extractable text. It will be added when a readable digital version is available.",
    category: "Systematic theology",
  },
};

export const messages: Record<Locale, Messages> = {
  es: {
    brand: "La Orden de las Hijas del Rey",
    brandShort: "La Orden de las Hijas del Rey",
    studyGuide: "Guía de estudio",
    footerEdition: "La Orden de las Hijas del Rey® — Edición 2022",
    nav: {
      home: "Inicio",
      studies: "Estudios",
      chat: "Chat",
      prayer: "Oración",
      enter: "Entrar",
      register: "Registrarse",
      registerShort: "Registro",
      logout: "Salir",
    },
    language: { group: "Idioma", es: "Castellano", en: "English" },
    home: {
      createAccount: "Crear mi cuenta",
      enterWithPin: "Entrar con PIN",
      yourPath: "Su camino",
      twelveWeeks: "Doce semanas de preparación",
      studiesBlurb:
        "Cada sesión incluye lectura, reflexión y preguntas para compartir en comunidad. Inicie sesión para guardar sus respuestas en la nube.",
      accessStudies: "Acceder a los estudios",
      purposeTitle: "Propósito de la guía",
      purposeSubtitle: "Fundamentos de su preparación espiritual",
      ctaReady:
        "Cuando esté lista, cree su cuenta y comience el Estudio Uno con su PIN personal.",
      register: "Registrarse",
      signIn: "Iniciar sesión",
      intro: {
        title: "Guía de Estudio Internacional 2022",
        subtitle:
          "Preparación para la admisión en La Orden de las Hijas del Rey®",
        description:
          "Diez estudios de la Guía de Estudio Internacional para conocer la filosofía, historia y compromiso de La Orden. Se recomienda un período mínimo de doce semanas de preparación.",
        scripture:
          "Tu palabra es una lámpara para mis pies y una luz para mi camino. — Salmo 119:105",
        motto: "MAGNANIMITER CRUCEM SUSTINE",
        mottoTranslation: "Con noble espíritu, sostén la cruz",
        initials: "FHS — For His Sake (Por su amor)",
        purposes: [
          "Servir como preparación oficial para las miembros prospectivas",
          "Establecer una comprensión de La Orden",
          "Introducir la Regla de Vida de La Orden",
          "Servir como revisión para las miembros actuales",
          "Ser una fuente de información",
        ],
      },
      studies: homeStudiesEs,
    },
    login: {
      title: "Bienvenida",
      subtitle: "La Orden de las Hijas del Rey — ingrese su PIN de 4 dígitos",
      firstTime: "¿Primera vez aquí?",
      createAccount: "Crear cuenta",
      registeredOk: "¡Registro exitoso! Use el PIN que eligió para entrar.",
      pinLabel: "Su PIN personal",
      entering: "Entrando…",
      enter: "Entrar",
      errPinLength: "Ingrese los 4 dígitos de su PIN.",
      errLogin: "No se pudo iniciar sesión.",
      errConnection: "Error de conexión. Intente de nuevo.",
    },
    register: {
      title: "Crear cuenta",
      subtitle: "La Orden de las Hijas del Rey — complete sus datos para acceder",
      hasAccount: "¿Ya tiene cuenta?",
      signInPin: "Iniciar sesión con PIN",
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Correo electrónico",
      placeholderFirst: "María",
      placeholderLast: "García",
      placeholderEmail: "nombre@ejemplo.com",
      pinCreate: "Cree su PIN (4 dígitos)",
      pinConfirm: "Confirme su PIN",
      submitting: "Registrando…",
      submit: "Crear cuenta",
      errNameRequired: "Nombre y apellido son obligatorios.",
      errBirthDate: "Seleccione su fecha de nacimiento (día, mes y año).",
      errEmail: "Ingrese un correo electrónico válido.",
      errPinLength: "El PIN debe tener 4 dígitos.",
      errPinMismatch: "Los PIN no coinciden.",
      errRegister: "No se pudo registrar.",
      errConnection: "Error de conexión. Intente de nuevo.",
    },
    birthDate: {
      label: "Fecha de nacimiento",
      pickParts: "Elegir día / mes / año",
      useCalendar: "Usar calendario",
      day: "Día",
      month: "Mes",
      year: "Año",
      hint: "Toque el campo de fecha o elija día, mes y año",
      months: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ],
    },
    pinDigit: "Dígito",
    welcome: {
      aria: "Bienvenida — La Orden de las Hijas del Rey",
      tap: "Toque para escuchar el himno",
    },
    pwa: {
      aria: "Instalar aplicación",
      title: "Instale la aplicación",
      ios: "En iPhone/iPad: toque Compartir y luego «Añadir a pantalla de inicio».",
      android:
        "Acceso rápido a La Orden de las Hijas del Rey desde su pantalla de inicio.",
      install: "Instalar",
      later: "Ahora no",
    },
    estudios: {
      welcomeBanner:
        "¡Bienvenida! Su cuenta está lista. Elija un curso para comenzar.",
      libraryEyebrow: "Biblioteca de estudios",
      hello: "Hola,",
      loggedInBlurb:
        "Elija un curso o documento. Los estudios incluyen resumen, lectura y preguntas; los documentos de lectura muestran el material completo. Sus respuestas se guardan automáticamente.",
      guestTitle: "Cursos de estudio",
      guestBlurb:
        "Inicie sesión con su PIN para acceder a los cursos y guardar sus reflexiones.",
      goLesson1: "Ir directo a la lección 1 de la Guía Internacional →",
      formationLibrary: "Biblioteca de formación",
    },
    course: {
      official: "Curso oficial",
      readingDoc: "Documento de lectura",
      lessons: "lecciones",
      weeks: "semanas",
      weeksSuggested: "semanas sugeridas",
      read: "Leer →",
      viewCourse: "Ver curso →",
      comingSoon: "Próximamente",
      backLibrary: "← Biblioteca de formación",
      backCourses: "← Todos los cursos",
    },
    lesson: {
      of: "Lección {id} de {total}",
      questions: "preguntas",
      prev: "← Lección {id}",
      next: "Lección {id} →",
      completed: "¡Ha completado este curso!",
    },
    studyTabs: {
      summary: "Resumen",
      reading: "Lectura",
      questions: "Preguntas",
      summaryTitle: "Resumen del estudio",
      section: "Sección",
      focus: "Enfoque",
      goReading: "Ir a la lectura completa",
      material: "Material de estudio",
      emptyContent:
        "El contenido de esta lección se encuentra en el material impreso. Utilice la sección de preguntas para su reflexión.",
      questionsIntro:
        "No hay respuestas correctas o incorrectas. Sus reflexiones se guardan de forma privada. Prepárese para compartir con su grupo cuando lo desee.",
      imageAlt: "Imagen del material de estudio",
    },
    questions: {
      loading: "Cargando sus respuestas…",
      empty:
        "Las preguntas de este estudio se están preparando. Consulte la guía impresa mientras tanto.",
      progress: "Progreso en este estudio",
      placeholder: "Escriba su reflexión aquí…",
      saved: "Guardado",
      saveError: "No se pudo guardar. Compruebe su conexión e intente de nuevo.",
      authRequired: "Su sesión expiró. Vuelva a iniciar sesión para guardar.",
    },
    reading: {
      eyebrow: "Documento de lectura",
      tocAria: "Índice",
      contents: "Contenido",
      imageAlt: "Imagen del documento",
    },
    chat: {
      title: "Chat",
      community: "Comunidad",
      privateChat: "Privado",
      newPrivate: "Nuevo chat privado",
      searchMembers: "Buscar miembro…",
      noMembers: "No hay otras miembros aún.",
      selectConversation: "Seleccione una conversación",
      emptyThread: "Aún no hay mensajes. Sea la primera en escribir.",
      placeholder: "Escriba un mensaje…",
      send: "Enviar",
      emoji: "Emojis",
      record: "Grabar audio",
      stopRecord: "Detener",
      recording: "Grabando…",
      cancel: "Cancelar",
      showOriginal: "Ver original",
      showTranslation: "Ver traducción",
      translated: "Traducido",
      loading: "Cargando…",
      loadError: "No se pudo cargar el chat.",
      sendError: "No se pudo enviar el mensaje.",
      audioError: "No se pudo enviar el audio.",
      micDenied: "Permiso de micrófono denegado.",
      you: "Usted",
      back: "Conversaciones",
      membersTitle: "Iniciar chat privado",
      startChat: "Abrir chat",
      audioMessage: "Mensaje de audio",
    },
    prayer: {
      title: "Pedidos de oración",
      subtitle:
        "Comparta sus intenciones con la comunidad. Solo se publican los pedidos si usted acepta que otras miembros los lean.",
      tabRead: "Leer",
      tabPublish: "Publicar",
      tabMine: "Mis pedidos",
      emptyShared: "Aún no hay pedidos compartidos. Sea la primera en publicar.",
      emptyMine: "Todavía no ha publicado ningún pedido.",
      yourRequest: "Su pedido de oración",
      placeholder: "Escriba aquí su pedido de oración…",
      consentLabel:
        "Acepto que otras miembros de la comunidad lean mi pedido de oración.",
      consentHint:
        "Sin esta aceptación, su pedido no se publica. No se comparte su correo ni su PIN.",
      publish: "Publicar pedido",
      publishing: "Publicando…",
      published: "Su pedido se publicó correctamente.",
      sharedBadge: "Compartido con la comunidad",
      privateBadge: "Solo usted",
      delete: "Eliminar",
      confirmDelete: "¿Eliminar este pedido de oración?",
      you: "Usted",
      loading: "Cargando…",
      loadError: "No se pudieron cargar los pedidos.",
      publishError: "No se pudo publicar el pedido.",
      deleteError: "No se pudo eliminar el pedido.",
      errEmpty: "Escriba su pedido de oración.",
      errConsent: "Debe aceptar que otras miembros lean su pedido para publicarlo.",
    },
    courses: coursesEs,
    apiErrors: {
      "Ingrese su PIN de 4 dígitos.": "Ingrese su PIN de 4 dígitos.",
      "PIN incorrecto. Intente de nuevo.": "PIN incorrecto. Intente de nuevo.",
      "Error al iniciar sesión.": "Error al iniciar sesión.",
      "Nombre y apellido son obligatorios.": "Nombre y apellido son obligatorios.",
      "Seleccione su fecha de nacimiento.": "Seleccione su fecha de nacimiento.",
      "Correo electrónico no válido.": "Correo electrónico no válido.",
      "El PIN debe tener exactamente 4 dígitos.":
        "El PIN debe tener exactamente 4 dígitos.",
      "Los PIN no coinciden.": "Los PIN no coinciden.",
      "Fecha de nacimiento no válida.": "Fecha de nacimiento no válida.",
      "Este correo ya está registrado. Inicie sesión con su PIN.":
        "Este correo ya está registrado. Inicie sesión con su PIN.",
      "Este PIN ya está en uso. Elija otro PIN de 4 dígitos.":
        "Este PIN ya está en uso. Elija otro PIN de 4 dígitos.",
      "Firebase no está configurado. Agregue FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en Vercel y haga Redeploy.":
        "Firebase no está configurado. Agregue FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en Vercel y haga Redeploy.",
      "Firebase no está configurado en el servidor. En Vercel agregue FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY (ver CONFIGURAR-FIREBASE.md) y haga Redeploy.":
        "Firebase no está configurado en el servidor. En Vercel agregue FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY (ver CONFIGURAR-FIREBASE.md) y haga Redeploy.",
      "No se pudo completar el registro.": "No se pudo completar el registro.",
    },
  },
  en: {
    brand: "The Order of the Daughters of the King",
    brandShort: "Daughters of the King",
    studyGuide: "Study guide",
    footerEdition: "The Order of the Daughters of the King® — 2022 Edition",
    nav: {
      home: "Home",
      studies: "Studies",
      chat: "Chat",
      prayer: "Prayer",
      enter: "Sign in",
      register: "Register",
      registerShort: "Join",
      logout: "Sign out",
    },
    language: { group: "Language", es: "Castellano", en: "English" },
    home: {
      createAccount: "Create my account",
      enterWithPin: "Sign in with PIN",
      yourPath: "Your path",
      twelveWeeks: "Twelve weeks of preparation",
      studiesBlurb:
        "Each session includes reading, reflection, and questions to share in community. Sign in to save your answers in the cloud.",
      accessStudies: "Access the studies",
      purposeTitle: "Purpose of the guide",
      purposeSubtitle: "Foundations of your spiritual preparation",
      ctaReady:
        "When you are ready, create your account and begin Study One with your personal PIN.",
      register: "Register",
      signIn: "Sign in",
      intro: {
        title: "International Study Guide 2022",
        subtitle:
          "Preparation for admission into The Order of the Daughters of the King®",
        description:
          "Ten studies from the International Study Guide to learn the philosophy, history, and commitment of The Order. A minimum twelve-week period of preparation is recommended.",
        scripture:
          "Your word is a lamp to my feet and a light to my path. — Psalm 119:105",
        motto: "MAGNANIMITER CRUCEM SUSTINE",
        mottoTranslation: "With a noble spirit, sustain the cross",
        initials: "FHS — For His Sake",
        purposes: [
          "Serve as official preparation for prospective members",
          "Establish an understanding of The Order",
          "Introduce The Order’s Rule of Life",
          "Serve as a review for current members",
          "Be a source of information",
        ],
      },
      studies: homeStudiesEn,
    },
    login: {
      title: "Welcome",
      subtitle: "The Order of the Daughters of the King — enter your 4-digit PIN",
      firstTime: "First time here?",
      createAccount: "Create account",
      registeredOk: "Registration successful! Use the PIN you chose to sign in.",
      pinLabel: "Your personal PIN",
      entering: "Signing in…",
      enter: "Sign in",
      errPinLength: "Enter all 4 digits of your PIN.",
      errLogin: "Could not sign in.",
      errConnection: "Connection error. Please try again.",
    },
    register: {
      title: "Create account",
      subtitle:
        "The Order of the Daughters of the King — complete your details to access",
      hasAccount: "Already have an account?",
      signInPin: "Sign in with PIN",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      placeholderFirst: "Mary",
      placeholderLast: "Smith",
      placeholderEmail: "name@example.com",
      pinCreate: "Create your PIN (4 digits)",
      pinConfirm: "Confirm your PIN",
      submitting: "Creating account…",
      submit: "Create account",
      errNameRequired: "First and last name are required.",
      errBirthDate: "Select your date of birth (day, month, and year).",
      errEmail: "Enter a valid email address.",
      errPinLength: "The PIN must have 4 digits.",
      errPinMismatch: "The PINs do not match.",
      errRegister: "Could not register.",
      errConnection: "Connection error. Please try again.",
    },
    birthDate: {
      label: "Date of birth",
      pickParts: "Choose day / month / year",
      useCalendar: "Use calendar",
      day: "Day",
      month: "Month",
      year: "Year",
      hint: "Tap the date field or choose day, month, and year",
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
    pinDigit: "Digit",
    welcome: {
      aria: "Welcome — The Order of the Daughters of the King",
      tap: "Tap to hear the hymn",
    },
    pwa: {
      aria: "Install app",
      title: "Install the app",
      ios: "On iPhone/iPad: tap Share, then “Add to Home Screen”.",
      android:
        "Quick access to The Order of the Daughters of the King from your home screen.",
      install: "Install",
      later: "Not now",
    },
    estudios: {
      welcomeBanner: "Welcome! Your account is ready. Choose a course to begin.",
      libraryEyebrow: "Study library",
      hello: "Hello,",
      loggedInBlurb:
        "Choose a course or document. Studies include summary, reading, and questions; reading documents show the full material. Your answers are saved automatically.",
      guestTitle: "Study courses",
      guestBlurb: "Sign in with your PIN to access courses and save your reflections.",
      goLesson1: "Go straight to lesson 1 of the International Guide →",
      formationLibrary: "Formation library",
    },
    course: {
      official: "Official course",
      readingDoc: "Reading document",
      lessons: "lessons",
      weeks: "weeks",
      weeksSuggested: "suggested weeks",
      read: "Read →",
      viewCourse: "View course →",
      comingSoon: "Coming soon",
      backLibrary: "← Formation library",
      backCourses: "← All courses",
    },
    lesson: {
      of: "Lesson {id} of {total}",
      questions: "questions",
      prev: "← Lesson {id}",
      next: "Lesson {id} →",
      completed: "You have completed this course!",
    },
    studyTabs: {
      summary: "Summary",
      reading: "Reading",
      questions: "Questions",
      summaryTitle: "Study summary",
      section: "Section",
      focus: "Focus",
      goReading: "Go to full reading",
      material: "Study material",
      emptyContent:
        "This lesson’s content is in the printed material. Use the questions section for your reflection.",
      questionsIntro:
        "There are no right or wrong answers. Your reflections are saved privately. Be ready to share with your group when you wish.",
      imageAlt: "Study material image",
    },
    questions: {
      loading: "Loading your answers…",
      empty:
        "Questions for this study are being prepared. Please consult the printed guide for now.",
      progress: "Progress in this study",
      placeholder: "Write your reflection here…",
      saved: "Saved",
      saveError: "Could not save. Check your connection and try again.",
      authRequired: "Your session expired. Sign in again to save your answers.",
    },
    reading: {
      eyebrow: "Reading document",
      tocAria: "Table of contents",
      contents: "Contents",
      imageAlt: "Document image",
    },
    chat: {
      title: "Chat",
      community: "Community",
      privateChat: "Private",
      newPrivate: "New private chat",
      searchMembers: "Search member…",
      noMembers: "No other members yet.",
      selectConversation: "Select a conversation",
      emptyThread: "No messages yet. Be the first to write.",
      placeholder: "Type a message…",
      send: "Send",
      emoji: "Emojis",
      record: "Record audio",
      stopRecord: "Stop",
      recording: "Recording…",
      cancel: "Cancel",
      showOriginal: "Show original",
      showTranslation: "Show translation",
      translated: "Translated",
      loading: "Loading…",
      loadError: "Could not load chat.",
      sendError: "Could not send the message.",
      audioError: "Could not send the audio.",
      micDenied: "Microphone permission denied.",
      you: "You",
      back: "Conversations",
      membersTitle: "Start private chat",
      startChat: "Open chat",
      audioMessage: "Audio message",
    },
    prayer: {
      title: "Prayer requests",
      subtitle:
        "Share your intentions with the community. Requests are published only if you agree that other members may read them.",
      tabRead: "Read",
      tabPublish: "Publish",
      tabMine: "My requests",
      emptyShared: "No shared requests yet. Be the first to publish.",
      emptyMine: "You have not published any requests yet.",
      yourRequest: "Your prayer request",
      placeholder: "Write your prayer request here…",
      consentLabel:
        "I agree that other members of the community may read my prayer request.",
      consentHint:
        "Without this consent, your request is not published. Your email and PIN are never shared.",
      publish: "Publish request",
      publishing: "Publishing…",
      published: "Your request was published successfully.",
      sharedBadge: "Shared with the community",
      privateBadge: "Only you",
      delete: "Delete",
      confirmDelete: "Delete this prayer request?",
      you: "You",
      loading: "Loading…",
      loadError: "Could not load prayer requests.",
      publishError: "Could not publish the request.",
      deleteError: "Could not delete the request.",
      errEmpty: "Please write your prayer request.",
      errConsent: "You must agree that others may read your request to publish it.",
    },
    courses: coursesEn,
    apiErrors: {
      "Ingrese su PIN de 4 dígitos.": "Enter your 4-digit PIN.",
      "PIN incorrecto. Intente de nuevo.": "Incorrect PIN. Please try again.",
      "Error al iniciar sesión.": "Sign-in error.",
      "Nombre y apellido son obligatorios.": "First and last name are required.",
      "Seleccione su fecha de nacimiento.": "Select your date of birth.",
      "Correo electrónico no válido.": "Invalid email address.",
      "El PIN debe tener exactamente 4 dígitos.": "The PIN must be exactly 4 digits.",
      "Los PIN no coinciden.": "The PINs do not match.",
      "Fecha de nacimiento no válida.": "Invalid date of birth.",
      "Este correo ya está registrado. Inicie sesión con su PIN.":
        "This email is already registered. Sign in with your PIN.",
      "Este PIN ya está en uso. Elija otro PIN de 4 dígitos.":
        "This PIN is already in use. Choose another 4-digit PIN.",
      "Firebase no está configurado. Agregue FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en Vercel y haga Redeploy.":
        "Firebase is not configured. Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in Vercel and Redeploy.",
      "Firebase no está configurado en el servidor. En Vercel agregue FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY (ver CONFIGURAR-FIREBASE.md) y haga Redeploy.":
        "Firebase is not configured on the server. In Vercel add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (see CONFIGURAR-FIREBASE.md) and Redeploy.",
      "No se pudo completar el registro.": "Could not complete registration.",
    },
  },
};

export function formatMsg(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    template
  );
}

export function translateApiError(locale: Locale, error: string | undefined, fallback: string) {
  if (!error) return fallback;
  return messages[locale].apiErrors[error] ?? error;
}

export function courseCopy(locale: Locale, slug: string, fallback: CourseUiCopy): CourseUiCopy {
  return messages[locale].courses[slug] ?? fallback;
}
