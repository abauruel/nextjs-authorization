import { GetServerSideProps } from 'next'

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { setupAPIClient } from '../services/setupApiClient'
import { WithSSRAuth } from '../utils/withSSRAuth'
export default function Dashboard() {
  const { user } = useContext(AuthContext)
  return (
    <h1>Dashboard : {user?.email}</h1>
  )
}

export const getServerSideProps: GetServerSideProps = WithSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me')
  return {
    props: {}
  }
})