import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

export function WithSSRGuest<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookie = parseCookies(ctx)
    if (cookie['@auth-next.token'])
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false
        }
      }
    return await fn(ctx)
  }
}