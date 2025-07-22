// Spanish translations for Plotify
export const translations = {
  // App metadata
  app: {
    title: "Parcela Jaslico",
    subtitle: "Sistema de Gestión de Aportes",
  },

  // Navigation
  navigation: {
    dashboard: "Panel de Control",
    income: "Ingresos",
    expenses: "Gastos", 
    lots: "Lotes",
  },

  // Common actions and buttons
  actions: {
    new: "Nuevo",
    add: "Agregar",
    edit: "Editar", 
    save: "Guardar",
    update: "Actualizar",
    create: "Crear",
    delete: "Eliminar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    close: "Cerrar",
    filter: "Filtrar",
    search: "Buscar",
    config: "Configurar",
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
    
    // Financial terms
    income: "Ingresos",
    expenses: "Gastos",
    balance: "Saldo",
    total: "Total",
    maintenance: "Mantenimiento", 
    works: "Obras",
    
    // Quantities
    payments: "pagos",
    results: "resultados",
    result: "resultado",
    summary: "Resumen",
  },

  // Status messages
  status: {
    loading: "Cargando...",
    processing: "Procesando...",
    saving: "Guardando...",
    deleting: "Eliminando...",
  },

  // Form placeholders and options
  placeholders: {
    selectLot: "Seleccionar lote",
    optionalDescription: "Descripción opcional",
    categoryExample: "ej. Jardinería, Seguridad, Servicios",
    lotIdExample: "ej. 22, E2-1, 18 y 19",
    ownerName: "Ingrese el nombre del propietario",
    monthlyAmount: "60000",
    selectMonth: "Seleccionar mes",
    search: "Buscar...",
  },

  // Filter options
  filters: {
    all: "Todos",
    allIncome: "Todos los Ingresos",
    allLots: "Todos los Lotes",
    allExpenses: "Todos los Gastos",
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
    newLot: "Agregar Nuevo Lote", 
    editLot: "Editar Lote",
    
    
    // Grid headers
    maintenanceContributions: "Aportes de Mantenimiento",
    worksContributions: "Aportes de Obras", 
    maintenanceExpenses: "Gastos de Mantenimiento",
    worksExpenses: "Gastos de Obras",
    
    // Fund types
    maintenanceFund: "Fondo de Mantenimiento",
    worksFund: "Fondo de Obras",
    
    // Stats
    totalLots: "Total de Lotes",
    contributionsThisMonth: "Aportes este mes",
    expensesThisMonth: "Gastos este mes",
  },

  // Messages
  messages: {
    // Empty states
    noContributions: "No hay contribuciones registradas",
    noContributionsForLot: "No hay contribuciones registradas para este lote",
    noExpenses: "No hay gastos registrados", 
    noLots: "No hay lotes",
    noResults: "No se encontraron resultados",
    
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
    amountPositive: "El monto debe ser positivo",
    dateRequired: "La fecha es requerida",
    dateValid: "Fecha válida es requerida",
    categoryRequired: "La categoría es requerida",
    ownerRequired: "El nombre del propietario es requerido",
    missingFields: "Campos faltantes",
    
    // System
    database: "Error de base de datos",
    network: "Error de conexión", 
    server: "Error del servidor",
  },

  // Confirmation dialogs
  confirmations: {
    // Delete confirmations (all use same title)
    deleteTitle: "Confirmar Eliminación",
    deleteLot: "¿Estás seguro de que quieres eliminar el lote? Esta acción no se puede deshacer.",
    deleteExpense: "¿Estás seguro de que quieres eliminar el gasto? Esta acción no se puede deshacer.",
    deleteContribution: "¿Estás seguro de que quieres eliminar la contribución? Esta acción no se puede deshacer.",
    
    // Generic
    unsavedChanges: "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?",
    confirmAction: "¿Estás seguro de que quieres realizar esta acción?",
  },

  // Date and time
  months: [
    "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", 
    "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
  ],
};

// Type definitions for better TypeScript support
export type TranslationKeys = typeof translations;