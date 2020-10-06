import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import TableCt from "./components/TableCt";

const App = () => {
  return (
    <div>
      <GlobalStyles />
      <StyledContainer>
        <TableCt></TableCt>
      </StyledContainer>
    </div>
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
    font-family: 'Muli', sans-serif;
    min-height: 100vh;
  }
`;

const StyledContainer = styled.div`
  max-width: 1140px;
  margin: 0 auto;
`;

export default App;
