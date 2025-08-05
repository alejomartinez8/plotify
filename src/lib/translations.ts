// Spanish translations for Plotify
export const translations = {
  // App metadata
  app: {
    title: "Parcela Jaslico",
    subtitle: "Sistema de Gestión de Aportes",
  },

  // Navigation
  navigation: {
    home: "Inicio",
    income: "Aportes",
    expenses: "Gastos",
    lots: "Lotes",
    quotas: "Cuotas",
    admin: "Admin",
  },

  // Common actions and buttons
  actions: {
    new: "Nuevo",
    edit: "Editar",
    save: "Guardar",
    update: "Actualizar",
    create: "Crear",
    delete: "Eliminar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    filter: "Filtrar",
    search: "Buscar",
    export: "Exportar",
    import: "Importar",
    uploadFile: "Subir archivo",
    viewReceipt: "Ver Comprobante",
  },

  // Common labels and fields
  labels: {
    // Basic fields
    lot: "Lote",
    owner: "Propietario",
    amount: "Monto",
    date: "Fecha",
    description: "Descripción",
    category: "Categoría",
    type: "Tipo",
    year: "Año",
    month: "Mes",
    actions: "Acciones",
    receiptNumber: "Comprobante",
    receiptFile: "Comprobante",

    // Financial terms
    income: "Aportes",
    expenses: "Gastos",
    balance: "Saldo",
    total: "Total",
    maintenance: "Mantenimientos",
    works: "Obras",
    others: "Otros",
    totalContributions: "Total Aportes",
    consolidated: "Consolidado",
    clickForDetails: "Haz clic para ver detalles",
    breakdownOf: "Desglose de",

    // Quantities
    payments: "pagos",
    results: "resultados",
    result: "resultado",
    summary: "Resumen",
    summaryByLot: "Resumen por Lote",
    lotDetail: "Detalle por Lote",
    list: "Vista por Comprobante",
    view: "Vista",
    filters: "Filtros",
    goToLot: "Ir a Lote:",

    // Quota related labels
    quotas: "Cuotas",
    quota: "Cuota",
    dueDate: "Vencimiento",
    status: "Estado",
    current: "Al día",
    overdue: "Atrasado",
    initialDebt: "Deuda Inicial",
    
    // Financial summary labels
    totalPaid: "Total Pagado",
    totalOwed: "Total Adeudado",
    contributionsMade: "Aportes realizados",
    initialDebtBalance: "Saldo pendiente inicial",
    paid: "Pagado",
    owes: "Debe",
    totalLots: "Total Lotes",
    totalDebt: "Deuda Total",
    overdueLots: "atrasados",
  },

  // Status messages
  status: {
    loading: "Cargando...",
    processing: "Procesando...",
  },

  // Form placeholders and options
  placeholders: {
    selectLot: "Seleccionar lote",
    optionalDescription: "Descripción opcional",
    categoryExample: "ej. Jardinería, Seguridad, Servicios",
    lotIdExample: "ej. 22, E2-1, 18 y 19",
    ownerName: "Ingrese el nombre del propietario",
    search: "Buscar...",
    receiptNumber: "ej. 001234, FV-001",
  },

  // Filter options
  filters: {
    all: "Todos",
    allIncome: "Todos los Aportes",
    allLots: "Todos los Lotes",
    allExpenses: "Todos los Gastos",
    allYears: "Todos los Años",
  },

  // Modal and form titles
  titles: {
    // Contributions
    newContribution: "Nuevo Aporte",
    editContribution: "Editar Aporte",
    registerContribution: "Registrar Nuevo Aporte",

    // Expenses
    newExpense: "Nuevo Gasto",
    editExpense: "Editar Gasto",
    registerExpense: "Registrar Nuevo Gasto",

    // Lots
    newLot: "Nuevo Lote",
    editLot: "Editar Lote",

    // Quotas
    quotasSystem: "Sistema de Cuotas",
    quotasDashboard: "Panel de Cuotas",
    newQuota: "Nueva Cuota",
    editQuota: "Editar Cuota",
    quotaConfiguration: "Configuración de Cuotas",
    quotaTypesMaintenance: "Mantenimiento",
    quotaTypesWorks: "Obras",
    quotaAmountPlaceholder: "60000",
    quotaDescriptionPlaceholder: "Descripción de la cuota",
    quotaDeleteConfirmation: "¿Estás seguro de que quieres eliminar esta cuota? Esta acción no se puede deshacer.",
    noQuotasConfigured: "No hay cuotas configuradas",
    quotaSummary: "Resumen de Cuotas",
    viewQuotas: "Ver cuotas",

    // Grid headers
    maintenanceContributions: "Aportes de Mantenimiento",
    worksContributions: "Aportes de Obras",
    othersContributions: "Otros Aportes",
    maintenanceExpenses: "Gastos de Mantenimiento",
    worksExpenses: "Gastos de Obras",

    // Lot page specific
    lotPage: "Página del Lote",
    paymentHistory: "Historial de Pagos",
    paymentSummary: "Resumen de Pagos",
    totalPayments: "Pagos totales",
    thisYear: "Este año",
    thisMonth: "Este mes",

    // Fund types
    maintenanceFund: "Fondo de Mantenimiento",
    worksFund: "Fondo de Obras",
    othersFund: "Fondo de Otros Aportes",
    consolidatedFund: "Total Consolidado",
    financialSummary: "Resumen Financiero",

    // Stats
    totalLots: "Total de Lotes",
    contributionsThisMonth: "Aportes este mes",
    expensesThisMonth: "Gastos este mes",
  },

  // Admin section
  admin: {
    title: "Configuración de Administrador",
    description:
      "Gestiona las configuraciones y herramientas de administración de Plotify",
    backupTab: "Backup & Exportación",
    restoreTab: "Restauración",
    systemTab: "Sistema",
    exportTitle: "Exportar Datos en CSV",
    exportDescription:
      "Descarga todos los datos de la aplicación en formato CSV para respaldo y análisis",
    restoreTitle: "Restauración de Datos",
    restoreDescription:
      "Importa datos desde archivos CSV para restaurar información perdida",
    systemTitle: "Información del Sistema",
    systemDescription: "Información sobre la aplicación y configuraciones",
    appInfoTitle: "Información de la Aplicación",
    featuresTitle: "Características Disponibles",
    supportTitle: "Soporte Técnico",
    appLabel: "Aplicación",
    versionLabel: "Versión",
    environmentLabel: "Ambiente",

    // Export descriptions
    exportDescriptions: {
      income: "Exporta todas las contribuciones de mantenimiento y obras",
      expenses: "Exporta todos los gastos registrados por categoría y tipo",
      lots: "Exporta información de lotes con resúmenes de contribuciones",
    },

    // Import descriptions
    importDescriptions: {
      income: "Importa contribuciones desde un archivo CSV",
      expenses: "Importa gastos desde un archivo CSV",
      lots: "Importa información de lotes desde un archivo CSV",
    },

    // Format info
    formatInfo: {
      title: "Información sobre el formato",
      csvFormat:
        "Los archivos se descargan en formato CSV con codificación UTF-8",
      currencyFormat:
        "Los montos se muestran en pesos colombianos (COP) sin decimales",
      dateFormat: "Las fechas están en formato local colombiano",
      timestampFormat:
        "Los archivos incluyen nombres con fecha y hora de creación",
    },

    // Import info
    importInfo: {
      title: "Instrucciones para la importación",
      csvFormat:
        "Los archivos deben estar en formato CSV con codificación UTF-8",
      headerMatch:
        "Los encabezados deben coincidir exactamente con el formato de exportación",
      dateFormat: "Las fechas pueden estar en formato DD/MM/YYYY o YYYY-MM-DD",
      backupFirst: "Se recomienda hacer un respaldo antes de importar datos",
    },

    // Import warning
    importWarning: {
      title: "Advertencia Importante",
      message:
        "La importación creará nuevos registros o actualizará los existentes. Esta acción no se puede deshacer fácilmente.",
    },

    // Features
    features: [
      "Gestión de lotes y propietarios",
      "Registro de ingresos por contribuciones",
      "Control de gastos por categorías",
      "Exportación de datos en CSV",
      "Autenticación de administrador",
      "Importación de datos CSV",
    ],

    // Support message
    supportMessage:
      "Para reportar problemas o solicitar nuevas características, contacta al administrador del sistema.",
  },

  // Messages
  messages: {
    // Empty states
    noContributions: "No hay contribuciones registradas",
    noContributionsForLot: "No hay contribuciones registradas para este lote",
    noExpenses: "No hay gastos registrados",
    noLots: "No hay lotes",
    noResults: "No se encontraron resultados",

    // Instructions
    clickLotForDetail: "Haz clic en cualquier lote para ver su detalle",

    // Success
    created: "Creado exitosamente",
    updated: "Actualizado exitosamente",
    deleted: "Eliminado exitosamente",

    // Hints
    changeFilter: "Intenta cambiar el filtro de tipo de ingreso",
    selectLot: "Selecciona un lote para ver el resumen",

    // Options
    notDefined: "No definida",
    fundType: "Tipo de Fondo",
  },

  // Error messages
  errors: {
    // Loading
    loadingData: "Error cargando datos de la aplicación",
    loadingIncome: "Error cargando datos de ingresos",
    loadingExpenses: "Error cargando datos de gastos",
    loadingLots: "Error cargando datos de lotes",
    unknown: "Error desconocido",

    // Validation
    required: "Este campo es requerido",
    lotRequired: "El lote es requerido",
    typeRequired: "El tipo debe ser mantenimiento u obras",
    amountRequired: "El monto es requerido",
    amountPositive: "El monto debe ser mayor o igual a cero",
    dateRequired: "La fecha es requerida",
    dateValid: "Fecha válida es requerida",
    categoryRequired: "La categoría es requerida",
    ownerRequired: "El nombre del propietario es requerido",
    missingFields: "Campos faltantes",

    // System
    database: "Error de base de datos",
    network: "Error de conexión",
    server: "Error del servidor",

    // Export errors
    export: {
      defaultError: "Error al exportar los datos",
      unexpectedError: "Error inesperado al exportar",
      incomes: "Error al exportar los ingresos",
      expenses: "Error al exportar los gastos",
      lots: "Error al exportar los lotes",
    },

    // Import errors
    import: {
      incomes: "Error al importar los ingresos",
      expenses: "Error al importar los gastos",
      lots: "Error al importar los lotes",
      processing: "Error al procesar los datos",
      csvFormat:
        "El archivo CSV debe tener al menos una fila de datos además del encabezado",
      headerMismatch:
        "El archivo CSV no tiene el formato correcto. Encabezados esperados: ",
      missingData: "Datos requeridos faltantes o inválidos",
      categoryRequired: "Categoría y monto son requeridos",
      fileRead: "Error al leer el archivo",
      fileType: "Por favor selecciona un archivo CSV válido",
      unexpected: "Error inesperado al importar el archivo",
    },

    // Access errors
    access: {
      title: "Error de Acceso",
      noPermission: "No tienes permisos para acceder a esta página",
    },
  },

  // Confirmation dialogs
  confirmations: {
    // Delete confirmations (all use same title)
    deleteTitle: "Confirmar Eliminación",
    deleteLot:
      "¿Estás seguro de que quieres eliminar el lote? Esta acción no se puede deshacer.",
    deleteExpense:
      "¿Estás seguro de que quieres eliminar el gasto? Esta acción no se puede deshacer.",
    deleteContribution:
      "¿Estás seguro de que quieres eliminar la contribución? Esta acción no se puede deshacer.",

    // Generic
    unsavedChanges:
      "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?",
    confirmAction: "¿Estás seguro de que quieres realizar esta acción?",
  },

  // Date and time
  months: [
    "ENE",
    "FEB",
    "MAR",
    "ABR",
    "MAY",
    "JUN",
    "JUL",
    "AGO",
    "SEP",
    "OCT",
    "NOV",
    "DIC",
  ],
};

// Type definitions for better TypeScript support
export type TranslationKeys = typeof translations;
