import { createContext, ReactNode, useState } from 'react'
import { api } from '../services/api'
import Router from 'next/router'
import { setCookie } from 'nookies'

type SignInCredential = {
  email: string,
  password: string
}

type AuthContextData = {
  signIn(credentials: SignInCredential): Promise<void>,
  isAuthenticated: boolean,
  user: User
}

type AuthProviderProps = {
  children: ReactNode,
}
type User = {
  email: string,
  permissions: string[],
  roles: string[]
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user

  async function signIn({ email, password }: SignInCredential) {

    try {
      const response = await api.post('sessions', {
        email, password
      })
      const { token, refreshToken, permissions, roles } = response.data

      setUser({
        email,
        permissions, roles
      })
      setCookie(undefined, '@auth-next.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
      setCookie(undefined, '@auth-next.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      Router.push('/dashboard')


    } catch (err) {
      console.error(err)
    }

  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}