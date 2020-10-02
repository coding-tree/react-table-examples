import React from "react";
import {
  BrowserRouter,
  NavLink,
  Redirect,
  Route,
  Switch
} from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import Home from "./components/Home";
import TableCt from "./components/TableCt";

const App = () => {
  return (
    <BrowserRouter>
      <GlobalStyles />
      <StyledContainer>
        <h1>Table app</h1>
        <nav>
          <ul>
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/table-ct">Table CT</NavLink>
            </li>
            <li>
              <NavLink to="/table-bulma">Table Bulma</NavLink>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route exact strict path="/" component={Home}></Route>
          <Route exact strict path="/table-ct" component={TableCt}></Route>
          <Route exact strict path="/table-bulma" component={TableCt}></Route>
          <Redirect to="/"></Redirect>
        </Switch>
      </StyledContainer>
    </BrowserRouter>
  );
};

const GlobalStyles = createGlobalStyle`

  *,*::after,*::before {
    padding: 0;
    margin: 0;
    box-sizing: border-box
  }
  body {
    background-color: rgb(248, 246, 247);
    max-width: 1140px;
    margin: 0 auto;
    font-family: 'Muli', sans-serif;
    min-height: 100vh;
  }
`;

const StyledContainer = styled.div`
  max-width: 1140px;
  margin: 0 auto;
`;

export default App;
