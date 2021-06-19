import { createContext, ReactNode, useEffect, useState } from 'react'
import { api } from '../services/api'
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies'

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
export function sigOut() {
  destroyCookie(undefined, '@auth-next.token')
  destroyCookie(undefined, '@auth-next.refreshToken')
  Router.push('/')
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user


  useEffect(() => {
    const { '@auth-next.token': token } = parseCookies()
    if (token) {
      api.get('/me').then(response => {
        const { email, permissions, roles } = response.data
        setUser({ email, permissions, roles })
      }).catch(() => {
        if (process.browser) {
          sigOut()
        }
      })
    }
  }, [])

  async function signIn({ email, password }: SignInCredential) {

    try {
      const response = await api.post('sessions', {
        email, password
      })
      const { token, refreshToken, permissions, roles } = response.data

      setCookie(undefined, '@auth-next.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
      setCookie(undefined, '@auth-next.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setUser({
        email,
        permissions, roles
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`

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