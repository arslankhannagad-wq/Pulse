import { OperationType, FirestoreErrorInfo } from './types.ts';
import { auth } from './firebase.ts';

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  if (error instanceof Error && error.message.includes('permission-denied')) {
    console.error('Firestore Permission Denied: ', JSON.stringify(errInfo, null, 2));
  } else {
    console.error('Firestore Error: ', error);
  }
  
  throw new Error(JSON.stringify(errInfo));
}
