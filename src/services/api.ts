import axios, { AxiosError } from 'axios'
import { request } from 'http'
import { parseCookies, setCookie } from 'nookies'
import { sigOut } from '../context/AuthContext'

let cookies = parseCookies()
let isRefreshing = false
let failedRequestsQueue = []

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies['@auth-next.token']}`
  }
})

api.interceptors.response.use(response => response,
  (error: AxiosError) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        cookies = parseCookies()

        const { '@auth-next.refreshToken': refreshToken } = cookies
        const originalConfig = error.config
        if (!isRefreshing) {
          isRefreshing = true

          api.post('/refresh', {
            refreshToken
          }).then(response => {
            const { token } = response.data

            setCookie(undefined, '@auth-next.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            })
            setCookie(undefined, '@auth-next.refreshToken', response.data.refreshToken, {
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
        sigOut()
      }
    }
    return Promise.reject(error)
  })