import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";

export function WithSSRAuth<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookie = parseCookies(ctx)
    if (!cookie['@auth-next.token'])
      return {
        redirect: {
          destination: '/',
          permanent: false
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