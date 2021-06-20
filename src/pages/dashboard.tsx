import { GetServerSideProps } from 'next'

import { useContext } from 'react'
import { Can } from '../components/Can'
import { AuthContext } from '../context/AuthContext'
import { useCan } from '../hooks/useCan'
import { setupAPIClient } from '../services/setupApiClient'
import { WithSSRAuth } from '../utils/withSSRAuth'
export default function Dashboard() {

  const { signOut } = useContext(AuthContext)
  const useCanSeeMetrics = useCan({
    permissions: ['metrics.list']
  })


  const { user } = useContext(AuthContext)
  return (
    <>
      <h1>Dashboard : {user?.email}</h1>
      <button onClick={signOut}>SignOut</button>
      <Can permissions={['metrics.list']} >
        <div>Métricas</div>
      </Can>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = WithSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me')
  return {
    props: {}
  }
})