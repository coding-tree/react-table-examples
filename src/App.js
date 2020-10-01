import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useTable, useRowSelect, useSortBy } from "react-table";
import makeData from "./makeData";

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

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  }
);

const VoteButtons = React.forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return (
    <>
      <input type="checkbox" ref={resolvedRef} {...rest} />
    </>
  );
});

function Table({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    state: { selectedRowIds },
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
    useRowSelect,

    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: "selection",
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          ),
        },
        ...columns,
      ]);
    }
  );
  // Render the UI for your table
  return (
    <>
      <StyledTable {...getTableProps()}>
        <colgroup>
          <col span="1" width="5%" style={{ textAlign: "center" }}></col>
          <col span="1" width="45%" style={{ textAlign: "left" }}></col>
          <col span="1" width="20%"></col>
          <col span="1" width="15%"></col>
          <col span="1" width="10%"></col>
          <col span="1" width="10%"></col>
        </colgroup>
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <StyledTableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <StyledTh
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  {column.render("Header")}
                  <span>
                    {column.sort ? (
                      column.isSorted ? (
                        column.isSortedDesc ? (
                          <StyledIcon className="fas fa-sort-down"></StyledIcon>
                        ) : (
                          <StyledIcon className="fas fa-sort-up"></StyledIcon>
                        )
                      ) : (
                        <StyledIcon className="fas fa-sort"></StyledIcon>
                      )
                    ) : (
                      <></>
                    )}
                  </span>
                </StyledTh>
              ))}
            </StyledTableRow>
          ))}
        </TableHead>
        <tbody {...getTableBodyProps()}>
          {rows.slice(0, 10).map((row, i) => {
            prepareRow(row);
            return (
              <StyledTableRow
                {...row.getRowProps()}
                onClick={() => console.log("Collapse div")}
              >
                {row.cells.map((cell) => {
                  return (
                    <StyledTd {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </StyledTd>
                  );
                })}
              </StyledTableRow>
            );
          })}
        </tbody>
      </StyledTable>
      <p>Selected Rows: {Object.keys(selectedRowIds).length}</p>
      <pre>
        <code>
          {JSON.stringify(
            {
              selectedRowIds: selectedRowIds,
              "selectedFlatRows[].original": selectedFlatRows.map(
                (d) => d.original
              ),
            },
            null,
            2
          )}
        </code>
      </pre>
    </>
  );
}

function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: "Temat",
        accessor: "topic",
        sort: true,
      },
      {
        Header: "Kategoria",
        accessor: (r) => r["tags"].join(", "),
        sort: true,
      },
      {
        Header: "Inicjator",
        accessor: "userAdded",
        sort: true,
      },
      {
        Header: "Ocena",
        accessor: (r) =>
          r["usersVote"].reduce(
            (acc, r) => acc + (r.vote === "up" ? 1 : -1),
            0
          ),
        sort: true,
      },
      {
        Header: "Zagłosuj",
      },
    ],
    []
  );

  const data = React.useMemo(() => makeData(), []);

  return (
    <React.Fragment>
      <GlobalStyles />
      <TableContainer>
        <TableHeader>
          <Button></Button>
        </TableHeader>
        <Table columns={columns} data={data.results} filterable />
      </TableContainer>
    </React.Fragment>
  );
}

const StyledButton = styled.button`
  font-family: inherit;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  width: fit-content;
  border-radius: 4px;
  transition: all 0.2s ease-in-out 0s;
  text-transform: uppercase;
  line-height: 1;
  outline: none;
  cursor: pointer;
  font-weight: bold;
  height: 42px;
  font-size: 16px;
  min-width: 144px;
  padding: 0px 3rem;
  border: 2px solid rgb(0, 150, 64);
  color: rgb(255, 255, 255);
  background-color: rgb(0, 150, 64);
  &:hover {
    border-color: rgb(0, 150, 64);
    color: rgb(0, 150, 64);
    background-color: rgb(255, 255, 255);
  }
`;

const Button = () => {
  return <StyledButton>Dodaj +</StyledButton>;
};

const StyledTable = styled.table`
  border-spacing: 0;
  background-color: white;
  width: 100%;
  table-layout: fixed;
  font-weight: bold;
  border-collapse: collapse;
  word-break: break-word;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(4, max-content) 1fr max-content;
  column-gap: 2rem;
  -webkit-box-align: center;
  align-items: center;
  padding: 0px 30px 27px 13px;
`;

const TableContainer = styled.div`
  background-color: white;
  padding: 1rem;
  border-radius: 30px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
`;

const TableHead = styled.thead`
  padding: 25px 10px;
  background-color: rgb(252, 251, 252);
  color: rgb(157, 158, 163);
  font-weight: bold;
  height: 50px;
`;

const StyledTh = styled.th`
  padding: 15px 0;
  font-weight: bold;
  white-space: nowrap;
  border-top: 1px solid rgb(243, 238, 240);
  border-bottom: 1px solid rgb(243, 238, 240);
`;

const StyledTd = styled.td`
  padding: 10px;
  :first-of-type {
    text-align: center;
  }
`;

const StyledTableRow = styled.tr`
  border-top: 1px solid rgb(243, 238, 240);
  border-bottom: 1px solid rgb(243, 238, 240);
  cursor: pointer;
`;

const StyledIcon = styled.i`
  margin-left: 5px;
`;
export default App;
