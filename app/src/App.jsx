import { useState } from 'react'
import {ListItem} from "./list_item.jsx"
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Bird app</h1>
      <div className="card">
        <ul>
            <ListItem />
            <ListItem />
            <ListItem />
            <ListItem />
            <ListItem />
        </ul>
      </div>
    </>
  )
}

export default App
