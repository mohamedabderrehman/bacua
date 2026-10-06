/**
 * Every user-facing string in the app.
 *
 * No Arabic literal belongs in JSX — keeping strings here means a translator (or a
 * future French/English mode) touches one file, and it keeps RTL text out of code
 * where editors mangle bidi ordering.
 *
 * Register: UI labels are Modern Standard Arabic; conversational copy (greetings,
 * suggestion chips) leans Algerian darija, which is how students actually type.
 */

export const ar = {
  app: {
    name: 'BACUA',
    tagline: 'مساعدك الذكي للباكالوريا',
  },

  common: {
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    delete: 'حذف',
    save: 'حفظ',
    done: 'تمّ',
    back: 'رجوع',
    search: 'بحث',
    soon: 'قريباً',
    all: 'الكل',
    retry: 'إعادة المحاولة',
  },

  drawer: {
    newChat: 'محادثة جديدة',
    recent: 'المحادثات الأخيرة',
    noConversations: 'ما زال ما عندك حتى محادثة',
    doross: 'الدروس',
    settings: 'الإعدادات',
    chat: 'المحادثة',
  },

  chat: {
    title: 'المحادثة',
    greeting: 'أهلاً، أنا BACUA',
    greetingNamed: (name: string) => `أهلاً ${name}، أنا BACUA`,
    subtitle: 'خليني نساعدك تفهم في ثواني',
    askMeAnything: 'اسألني أي حاجة',
    placeholder: 'تكلّم معايا...',
    thinking: 'ما زال يفكّر',
    stopped: 'توقّف التوليد',
    // Composer chips
    deepThink: 'تفكير عميق',
    webSearch: 'بحث',
    subjectAll: 'كل المواد',
    pickSubject: 'اختر المادة',
    // Message actions
    copy: 'نسخ',
    copied: 'تم النسخ',
    regenerate: 'إعادة توليد',
    like: 'إعجاب',
    dislike: 'عدم إعجاب',
    speak: 'قراءة صوتية',
    stop: 'إيقاف',
    // Lesson hand-off banner
    lessonContext: (title: string) => `بخصوص درس: ${title}`,
    clearContext: 'إزالة السياق',
    sources: 'المصادر',
  },

  doross: {
    title: 'الدروس',
    subtitle: 'كل دروس الباك في بلاصة وحدة',
    searchPlaceholder: 'دوّر على مادة أو درس...',
    stream: 'الشعبة',
    lessons: (n: number) => (n === 1 ? 'درس واحد' : n === 2 ? 'درسان' : `${n} دروس`),
    units: (n: number) => (n === 1 ? 'وحدة واحدة' : n === 2 ? 'وحدتان' : `${n} وحدات`),
    coefficient: 'المعامل',
    progress: 'التقدّم',
    noResults: 'ما لقيناش حتى نتيجة',
    noResultsHint: 'جرّب كلمة أخرى أو بدّل الشعبة',
    completed: 'مقروء',
    markRead: 'علّم كمقروء',
    markUnread: 'إلغاء التعليم',
  },

  lesson: {
    objectives: 'أهداف الدرس',
    content: 'محتوى الدرس',
    formulas: 'القوانين المهمة',
    askBacua: 'اسأل BACUA على هذا الدرس',
    notFound: 'ما لقيناش هذا الدرس',
  },

  settings: {
    title: 'الإعدادات',

    studySection: 'الدراسة',
    name: 'الاسم',
    namePlaceholder: 'كيفاش نسمّيك؟',
    stream: 'الشعبة',
    examDate: 'تاريخ الباكالوريا',
    countdown: (days: number) => `باقي ${days} يوم على الباك`,
    countdownToday: 'اليوم هو يوم الباك — بالتوفيق!',
    countdownPassed: 'عدّى تاريخ الباك — بدّلو من الإعدادات',

    appearanceSection: 'المظهر',
    darkMode: 'الوضع الليلي',
    darkModeNote: 'الوضع الفاتح قريباً',
    textSize: 'حجم الخط',
    textSizeSm: 'صغير',
    textSizeMd: 'متوسط',
    textSizeLg: 'كبير',
    reduceMotion: 'تقليل الحركة',
    reduceMotionNote: 'يوقّف الخلفية المتحركة — يخفّف على الهواتف الضعيفة',

    chatSection: 'المحادثة',
    haptics: 'الاهتزاز',
    sound: 'الصوت',
    saveHistory: 'حفظ المحادثات',
    saveHistoryNote: 'كي تطفيه، المحادثات تتمسح كي تخرج من التطبيق',
    clearAll: 'مسح كل المحادثات',
    clearAllConfirmTitle: 'مسح كل المحادثات؟',
    clearAllConfirmBody: 'هذي العملية ما تتراجعش. كل المحادثات يتمسحو نهائياً.',
    clearAllDone: 'تمسحو كل المحادثات',

    accountSection: 'الحساب',
    signOut: 'تسجيل الخروج',
    signOutConfirmTitle: 'تسجيل الخروج؟',
    signOutConfirmBody: 'محادثاتك تبقى محفوظة على هذا الهاتف.',

    aboutSection: 'حول',
    version: 'الإصدار',
    privacy: 'سياسة الخصوصية',
    contact: 'تواصل معنا',
    aboutBody:
      'BACUA مساعد ذكي لطلبة الباكالوريا. الإجابات مبنية على دروس البرنامج الرسمي.',
    mockNotice:
      'هذي نسخة تجريبية — الإجابات محضّرة مسبقاً وماشي من ذكاء اصطناعي حقيقي.',
  },

  streams: {
    label: 'الشعبة',
  },

  welcome: {
    // The pitch. Specific beats generic: "لباكالوريا الجزائر" is the whole differentiator,
    // and naming the language is what makes a student believe it was built for them.
    headline: 'أوّل مساعد ذكاء اصطناعي مصمَّم لباكالوريا الجزائر',
    subtitle: 'دروسك، تمارينك، وبرنامج مراجعتك — في تطبيق واحد يفهمك بالعربية.',
    features: [
      'إجابات مبنية على البرنامج الرسمي',
      'لخّص أي درس في ثواني',
      'برنامج مراجعة على مقاس وقتك',
    ],
    ctaStart: 'ابدأ الآن مجاناً',
    ctaLogin: 'تسجيل الدخول',
    footnote: 'مجاني تماماً — بلا بطاقة بنكية',
  },

  signup: {
    stepOf: (current: number, total: number) => `الخطوة ${current} من ${total}`,
    next: 'التالي',
    back: 'رجوع',
    finish: 'أنشئ حسابي',
    skip: 'تخطّى هذي الخطوة',

    nameTitle: 'تعارف بسيط',
    nameSubtitle: 'باش نخاطبك باسمك ماشي كـ"مستخدم"',
    firstName: 'الاسم',
    firstNamePlaceholder: 'مثال: أمين',
    lastName: 'اللقب',
    lastNamePlaceholder: 'مثال: بن علي',

    contactTitle: 'كيفاش نوصلوك؟',
    contactSubtitle: 'باش نحفظو تقدّمك ونرجعولك حسابك إذا بدّلت التيليفون',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'name@example.com',
    phone: 'رقم الهاتف',
    phonePlaceholder: '05 51 23 45 67',

    streamTitle: 'وش تقرا؟',
    streamSubtitle: 'اختر شعبتك باش نخصّصو لك الدروس والمعاملات',

    weakTitle: 'وين راك تحتاج تحسين؟',
    weakSubtitle: 'اختر المواد اللي تحب تركّز عليها — تقدر تبدّلهم بعدين',
    weakSelected: (n: number) => (n === 0 ? 'ما اخترت حتى مادة' : `اخترت ${n} مواد`),

    errName: 'اكتب اسمك بالعربية',
    errLastName: 'اكتب لقبك بالعربية',
    errArabicOnly: 'اكتبه بالعربية من فضلك',
    errEmail: 'البريد الإلكتروني ماشي صحيح',
    errPhone: 'رقم الهاتف ماشي صحيح — مثال: 0551234567',
    errStream: 'اختر شعبتك باش نكمّلو',
  },

  login: {
    title: 'مرحباً بك من جديد',
    subtitle: 'كمّل من وين وقفت',
    identifier: 'البريد الإلكتروني أو رقم الهاتف',
    identifierPlaceholder: 'name@example.com  أو  0551234567',
    password: 'كلمة السر',
    passwordPlaceholder: '••••••••',
    submit: 'دخول',
    forgot: 'نسيت كلمة السر؟',
    noAccount: 'ما عندكش حساب؟',
    createOne: 'أنشئ حساب مجاني',
    errIdentifier: 'اكتب بريدك الإلكتروني ولا رقم هاتفك',
    errPassword: 'اكتب كلمة السر',
    demoNote: 'نسخة تجريبية — تقدر تدخل بأي بيانات، ما كاينش ربط بقاعدة بيانات.',
  },
} as const;

export type Strings = typeof ar;
