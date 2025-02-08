import { useState } from 'react'
import './App.css'
import Login from './components/auth/google_auth'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Hello, Priya</h1>
      <Login></Login>
    </>
  )
}

export default App
