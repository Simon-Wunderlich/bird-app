import { Provider } from "@/src/components/ui/provider"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider>
      <App />
    </Provider>
)
