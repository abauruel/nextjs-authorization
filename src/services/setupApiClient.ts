import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies'
import { sigOut } from '../context/AuthContext'
import { AuthTokenError } from './errors/AuthTokenError'

let cookies = parseCookies()
let isRefreshing = false
let failedRequestsQueue = []


export function setupAPIClient(ctx = undefined) {

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies['@auth-next.token']}`
    }
  })

  api.interceptors.response.use(response => response,
    (error: AxiosError) => {
      if (error.response.status === 401) {
        if (error.response.data?.code === 'token.expired') {
          cookies = parseCookies(ctx)

          const { '@auth-next.refreshToken': refreshToken } = cookies
          const originalConfig = error.config
          if (!isRefreshing) {
            isRefreshing = true

            api.post('/refresh', {
              refreshToken
            }).then(response => {
              const { token } = response.data

              setCookie(ctx, '@auth-next.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
              })
              setCookie(ctx, '@auth-next.refreshToken', response.data.refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
              })

              api.defaults.headers['Authorization'] = `Bearer ${token}`

              failedRequestsQueue.forEach(request => request.onSuccess(token))
              failedRequestsQueue = []
            }).catch((err) => {
              failedRequestsQueue.forEach(request => request.onFailure(err))
              failedRequestsQueue = []
            })
              .finally(() => {
                isRefreshing = false
              })
          }
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers['Authorization'] = `Bearer ${token}`
                resolve(api(originalConfig))
              },
              onFailure: (error: AxiosError) => {
                reject(error)
              },
            })

          })

        } else {
          if (process.browser) {
            sigOut()
          } else {
            return Promise.reject(new AuthTokenError())
          }
        }
      }
      return Promise.reject(error)
    })

  return api
}