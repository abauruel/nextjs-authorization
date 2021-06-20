import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import decode from 'jwt-decode'
import { ValidateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions?: string[],
  roles?: string[]
}

export function WithSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookie = parseCookies(ctx)
    const token = cookie['@auth-next.token']
    if (!token)
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }

    if (options) {
      const user = decode<{ permissions: string[], roles: string[] }>(token)
      const { permissions, roles } = options
      const userHasValidPermissions = ValidateUserPermissions({
        user, permissions, roles
      })

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false
          }
        }
      }
    }


    try {
      return await fn(ctx)
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(undefined, '@auth-next.token')
        destroyCookie(undefined, '@auth-next.refreshToken')
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }

    }
  }
}