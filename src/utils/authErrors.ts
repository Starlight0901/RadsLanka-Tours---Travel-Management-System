function isFirebaseAuthError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  )
}

export class PopupCancelledError extends Error {
  constructor() {
    super('Google sign-in was cancelled.')
    this.name = 'PopupCancelledError'
  }
}

export function isPopupCancellation(error: unknown): boolean {
  return (
    isFirebaseAuthError(error) &&
    (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request')
  )
}

export function getAuthErrorMessage(error: unknown): string {
  if (!isFirebaseAuthError(error)) {
    return 'Unable to sign in. Please try again.'
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked. Allow popups for this site and try again.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google sign-in.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled for this project.'
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists for this email with a different sign-in method.'
    default:
      return 'Unable to sign in. Please try again.'
  }
}
