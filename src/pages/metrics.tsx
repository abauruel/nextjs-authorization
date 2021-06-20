import { GetServerSideProps } from 'next'
import decode from 'jwt-decode'

import { setupAPIClient } from '../services/setupApiClient'
import { WithSSRAuth } from '../utils/withSSRAuth'
export default function Metrics() {
  return (
    <>
      <div>Métricas</div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = WithSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me')


  return {
    props: {}
  }
}, {
  permissions: ['metrics.list'],
  roles: ['administrator']
})