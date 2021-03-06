import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthState } from '../types/myTypes'
import firebase from '../utilities/FirebaseDAO';

/*
  authLevel = 0  -No authentication
  authLevel = 1  -Authenticated, not email verifed
  authLevel = 2  -Fully authenticated
*/


const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC = props => {
  const [auth, setAuth] = useState<AuthState | undefined>(undefined);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const [username, name] = user.displayName!.split("-");
        if (user.emailVerified) {
          setAuth({
            authLevel: 2,
            email: user.email,
            uid: user.uid,
            username: username,
            name: name,
            photoURL: user.photoURL,
          });
        } else {
          setAuth({
            authLevel: 1,
            email: user.email,
            uid: user.uid,
            username: username,
            name: name,
            photoURL: user.photoURL,
          });
        }
      }
      else {
        setAuth({
          authLevel: 0,
          email: null,
          uid: undefined,
          username: null,
          name: null,
          photoURL: null,
        });
      }
    });
  }, [])

  return (
    <AuthContext.Provider
      value={auth}
    >
      {props.children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);

export enum Constraints {
  greaterThanLevel,
  lessThanLevel,
  equalToLevel,
}


export type AuthConstraint = {
  authLevel: number;
  constraint: Constraints
}

const VerifyConstraint = (authConstraint: AuthConstraint, authLevel: number) => {
  switch (authConstraint.constraint) {
    case Constraints.equalToLevel: {
      return authLevel === authConstraint.authLevel;
    }
    case Constraints.greaterThanLevel: {
      return authLevel > authConstraint.authLevel;
    }
    case Constraints.lessThanLevel: {
      return authLevel < authConstraint.authLevel;
    }
  }
}

interface AuthRedirectParams {
  auth: AuthState,
  authConstraint: AuthConstraint,
  redirectTo: string,
  redirectHook: React.Dispatch<React.SetStateAction<string | null>>
}

export const AuthRedirect = ({
  auth,
  authConstraint,
  redirectTo,
  redirectHook

}: AuthRedirectParams) => {
  if (auth) {
    if (!VerifyConstraint(authConstraint, auth.authLevel)) {
      redirectHook(redirectTo);
    }
  }
}
