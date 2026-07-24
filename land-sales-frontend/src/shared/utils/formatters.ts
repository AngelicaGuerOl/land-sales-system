export function formatNumber(value: number | null, suffix = '') {
  if (value === null || Number.isNaN(value)) {
    return 'No disponible'
  }

  return `${new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}${suffix}`
}

export function formatCurrency(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return 'No disponible'
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value)
}
