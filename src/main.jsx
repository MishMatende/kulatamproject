import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster
      position="top-center"
      toastOptions={{
        success: {
          style: {
            background: "#000",
            color: "#fff",
          },
        },
        error: {
          style: {
            background: "#fee2e2",
            color: "#991b1b",
          },
        },
      }}
    />
    <App />
  </BrowserRouter>,
);
