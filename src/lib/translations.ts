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
    maintenance: "Mantenimiento",
    works: "Obras",
    expenses: "Gastos",
    lots: "Lotes",
  },

  // Buttons
  buttons: {
    newContribution: "Nuevo Aporte",
    newExpense: "Nuevo Gasto",
    saveContribution: "Guardar Aporte",
    saveExpense: "Guardar Gasto",
    cancel: "Cancelar",
    delete: "Eliminar",
    confirm: "Confirmar",
    edit: "Editar",
    gridView: "Vista por Lote",
    listView: "Vista Lista",
  },

  // Confirmation dialogs
  confirmations: {
    deleteLot: {
      title: "Confirmar Eliminación",
      message:
        "¿Estás seguro de que quieres eliminar el lote? Esta acción no se puede deshacer.",
    },
    deleteExpense: {
      title: "Confirmar Eliminación",
      message: "¿Estás seguro de que quieres eliminar el gasto? Esta acción no se puede deshacer.",
    },
    deleteContribution: {
      title: "Confirmar Eliminación", 
      message: "¿Estás seguro de que quieres eliminar la contribución? Esta acción no se puede deshacer.",
    },
  },

  // Financial cards
  financial: {
    maintenanceFund: "Fondo de Mantenimiento",
    worksFund: "Fondo de Obras",
    income: "Ingresos",
    expenses: "Gastos",
    balance: "Saldo",
  },

  // Quick stats
  stats: {
    totalLots: "Total de Lotes",
    contributionsThisMonth: "Aportes este mes",
    expensesThisMonth: "Gastos este mes",
  },

  // Payment grid
  grid: {
    lotNo: "No. Lote",
    owner: "Propietario",
    maintenanceContributions: "Aportes de Mantenimiento",
    worksContributions: "Aportes de Obras",
  },

  // Expense list
  expenseList: {
    maintenanceExpenses: "Gastos de Mantenimiento",
    worksExpenses: "Gastos de Obras",
    noExpensesRecorded: "No hay gastos registrados",
  },

  // Lot list
  lotList: {
    addLot: "Agregar Lote",
    lotNumber: "No. Lote",
    owner: "Propietario",
    actions: "Acciones",
    noLotsFound: "No hay lotes",
  },

  // Modals
  modals: {
    // Contribution modal
    registerNewContribution: "Registrar Nuevo Aporte",
    lot: "Lote",
    selectLot: "Seleccionar lote",
    fundType: "Tipo de Fondo",
    maintenance: "Mantenimiento",
    works: "Obras",
    month: "Mes",
    selectMonth: "Seleccionar mes",
    amount: "Monto",
    date: "Fecha",
    description: "Descripción",
    optionalDescription: "Descripción opcional",

    // Expense modal
    registerNewExpense: "Registrar Nuevo Gasto",
    expenseDescription: "Descripción del gasto",
    category: "Categoría",
    categoryPlaceholder: "ej. Jardinería, Seguridad, Servicios",

    // Lot modal
    editLot: "Editar Lote",
    addNewLot: "Agregar Nuevo Lote",
    lotId: "No. de Lote",
    ownerName: "Nombre del Propietario",
    lotIdPlaceholder: "ej. 22, E2-1, 18 y 19",
    ownerNamePlaceholder: "Ingrese el nombre del propietario",
    update: "Actualizar",
    create: "Crear",
  },

  // Status messages
  status: {
    processing: "Procesando...",
    loading: "Cargando...",
  },

  // Error messages
  errors: {
    errorLoadingData: "Error cargando datos de la aplicación",
    errorLoadingExpenses: "Error cargando datos de gastos",
    errorLoadingMaintenance: "Error cargando datos de mantenimiento",
    errorLoadingWorks: "Error cargando datos de obras",
    unknownError: "Error desconocido",
  },

  // Validation messages
  validation: {
    lotRequired: "El lote es requerido",
    typeRequired: "El tipo debe ser mantenimiento u obras",
    amountPositive: "El monto debe ser positivo",
    dateRequired: "La fecha es requerida",
    dateValid: "Fecha válida es requerida",
    descriptionOptional: "La descripción es opcional",
    categoryRequired: "La categoría es requerida",
    lotNumberRequired: "El número de lote es requerido",
    ownerRequired: "El nombre del propietario es requerido",
    lotIdRequired: "ID de lote válido es requerido",
    contributionIdRequired: "ID de aporte válido es requerido",
    expenseIdRequired: "ID de gasto válido es requerido",
    missingFields: "Campos faltantes",
    databaseError: "Error de base de datos",
    createSuccess: "Creado exitosamente",
    updateSuccess: "Actualizado exitosamente",
    deleteSuccess: "Eliminado exitosamente",
  },

  // Tooltips and titles
  tooltips: {
    editExpense: "Editar gasto",
    deleteExpense: "Eliminar gasto", 
    editContribution: "Editar contribución",
    deleteContribution: "Eliminar contribución",
  },

  // Messages
  messages: {
    noContributionsRecorded: "No hay contribuciones registradas",
  },

  // Months in Spanish
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
