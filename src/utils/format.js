export function formatDate(value) {
  if (!value) return 'Date not set'
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(value))
}

export function formatPrice(value) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || error?.response?.data?.errors?.join(' ') || fallback
}
