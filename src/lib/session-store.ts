
'use client';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

// Define the type for the user's role
export type UserRole = 'Admin-Gestionnaire' | 'Compte Entreprise' | 'Gestionnaire (SKOMPTAB)' | 'Stagiaire (SKOMPTAB)' | 'Employé' | null;

// Use session storage which clears when the browser tab is closed
const storage = createJSONStorage<UserRole>(() => sessionStorage);

// Create an atom to store the user's role, persisting it in session storage
export const userRoleAtom = atomWithStorage<UserRole>('userRole', null, storage);
