export function dashboardPath(user) {
  return user?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard'
}

export function getStoredUser() {
  if (!localStorage.getItem('salon-token')) {
    localStorage.removeItem('salon-user')
    return null
  }

  try {
    return JSON.parse(localStorage.getItem('salon-user'))
  } catch {
    localStorage.removeItem('salon-user')
    return null
  }
}
