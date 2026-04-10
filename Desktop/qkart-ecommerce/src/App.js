import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Switch, Route, Redirect } from "react-router-dom";
import theme from "./theme";
import Login from "./components/Login";
import Register from "./components/Register";
import Product from "./components/Products";
import Checkout from "./components/Checkout";
import Thanks from './components/Thanks';


const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8082/api/v1"
    : "http://13.234.10.92:8082/api/v1";

export const config = {
  endpoint: BASE_URL,
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Switch>
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/Thanks" component={Thanks} />
          <Route exact path="/" component={Product} />
          <Redirect from="/" to="/login" />
        </Switch>
      </div>
    </ThemeProvider>
  );
}

export default App;