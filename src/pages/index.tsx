
import { FormEvent, useContext, useState } from 'react'
import styles from '../styles/Home.module.scss'
import { AuthContext } from '../context/AuthContext'
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'
import { WithSSRGuest } from '../utils/withSSRGuest'

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { signIn } = useContext(AuthContext)

  async function handleSignIn(event: FormEvent) {
    event.preventDefault()
    const data = {
      email, password
    }

    await signIn(data)
  }
  return (
    <form className={styles.container} onSubmit={handleSignIn}>

      <input type="email" value={email}
        onChange={(event) => setEmail(event.target.value)} />

      <input type="password" value={password}
        onChange={(event) => setPassword(event.target.value)} />
      <button type="submit">Enviar</button>
    </form>
  )
}

export const getServerSideProps = WithSSRGuest(async (ctx) => {
  return {
    props: {}
  }
})