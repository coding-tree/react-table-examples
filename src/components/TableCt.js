import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import styled, { css } from "styled-components";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useExpanded,
  usePagination
} from "react-table";
import makeData from "../makeData";

const IndeterminateCheckbox = forwardRef(
  ({ indeterminate, toggleRowSelected, ...rest }, ref) => {
    const defaultRef = useRef();
    const resolvedRef = ref || defaultRef;

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    const handleClick = e => {
      e.stopPropagation();
      toggleRowSelected();
    };

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} hidden />
        <StyledCheckbox checked={rest.checked} onClick={handleClick}>
          {rest.checked ? <i className="fas fa-check"></i> : ""}
        </StyledCheckbox>
      </>
    );
  }
);

const StyledCheckbox = styled.div`
  height: 20px;
  width: 20px;
  background: rgb(239, 229, 230);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s ease 0s;
  cursor: pointer;
  i {
    font-size: 12px;
  }
  ${({ checked }) =>
    checked &&
    css`
      background-color: rgb(0, 150, 64);
      color: white;
    `}
`;

const VoteButtons = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  const handleVoting = (e, vote) => {
    e.stopPropagation();
    console.log("Voting: ", vote);
  };

  return (
    <ButtonContainer>
      <PrimaryButton
        small
        onClick={e => handleVoting(e, "UP")}
        ref={resolvedRef}
        {...rest}
      >
        <i className="fas fa-plus"></i>
      </PrimaryButton>
      <ErrorButton
        small
        onClick={e => handleVoting(e, "DOWN")}
        ref={resolvedRef}
        {...rest}
      >
        <i className="fas fa-minus"></i>
      </ErrorButton>
    </ButtonContainer>
  );
});

const UserVote = ({ row }) => {
  const votes = row["usersVote"].reduce(
    (acc, r) => acc + (r.vote === "up" ? 1 : -1),
    0
  );

  return (
    <div>
      {votes > 0 && (
        <StyledVote color="rgb(48, 131, 115)">+{+votes}</StyledVote>
      )}
      {votes < 0 && <StyledVote color="rgb(255, 44, 44)">{+votes}</StyledVote>}
      {votes === 0 && <StyledVote>{votes}</StyledVote>}
    </div>
  );
};

function Table({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    selectedFlatRows,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,

    state: { selectedRowIds, pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 }
    },
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        // Let's make a column for selection
        {
          id: "selection",
          width: "5%",
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({
            getToggleAllRowsSelectedProps,
            toggleAllRowsSelected
          }) => (
            <IndeterminateCheckbox
              toggleRowSelected={toggleAllRowsSelected}
              {...getToggleAllRowsSelectedProps()}
            />
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <IndeterminateCheckbox
              toggleRowSelected={row.toggleRowSelected}
              {...row.getToggleRowSelectedProps()}
            />
          )
        },
        ...columns,
        {
          id: "voting",
          width: "12%",
          align: "right",
          Header: "Zagłosuj",
          Cell: ({ row }) => (
            <VoteButtons row={row} {...row.getToggleRowSelectedProps()} />
          )
        }
      ]);
    }
  );

  // Render the UI for your table
  return (
    <>
      <StyledTable {...getTableProps()}>
        <colgroup>
          {headerGroups.map(headerGroup =>
            headerGroup.headers.map((column, index) => (
              <col key={index + 1} span="1" width={column.width}></col>
            ))
          )}
        </colgroup>
        <StyledTableHead>
          {headerGroups.map(headerGroup => (
            <StyledTableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, i) => (
                <TableHead key={i} column={column} />
              ))}
            </StyledTableRow>
          ))}
        </StyledTableHead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return <TableRow key={i} row={row} />;
          })}
        </tbody>
      </StyledTable>

      {/* Pagination */}
      <div>
        {pageOptions.map(el => (
          <button onClick={() => gotoPage(el)}>{el + 1}</button>
        ))}
      </div>

      {/* Selected rows */}
      <p>Selected Rows: {Object.keys(selectedRowIds).length}</p>
      <pre>
        <code>
          {JSON.stringify(
            {
              selectedRowIds: selectedRowIds,
              "selectedFlatRows[].original": selectedFlatRows.map(
                d => d.original
              )
            },
            null,
            2
          )}
        </code>
      </pre>
    </>
  );
}

const TableHead = ({ column }) => {
  return (
    <StyledTh
      {...column.getHeaderProps(column.getSortByToggleProps())}
      align={column.align}
    >
      {column.render("Header")}
      <>
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
        ) : null}
      </>
    </StyledTh>
  );
};

const TableRow = ({ row }) => {
  return (
    <>
      <StyledTableRow
        {...row.getRowProps()}
        {...row.getToggleRowExpandedProps()}
      >
        {row.cells.map(cell => {
          return (
            <StyledTd {...cell.getCellProps()}>{cell.render("Cell")}</StyledTd>
          );
        })}
      </StyledTableRow>
      {row.isExpanded ? (
        <StyledDetails>
          <StyledDetailsColumn colSpan={row.cells.length}>
            <StyledDetailsContainer>
              <TextBold>Opis: </TextBold>
              <StyledText>{row.original.description}</StyledText>
              <TextBold>Tagi:</TextBold>
              <StyledText>{row.original.tags.join(", ")}</StyledText>
            </StyledDetailsContainer>
          </StyledDetailsColumn>
        </StyledDetails>
      ) : null}
    </>
  );
};

const StyledDetails = styled.tr`
  background-color: rgb(248, 246, 247);
`;
const StyledDetailsColumn = styled.td``;
const StyledDetailsContainer = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  padding: 30px;
  gap: 1rem;
`;

const TextBold = styled.span`
  font-weight: bold;
`;

const StyledText = styled.span`
  font-weight: 400;
`;

function TableCt() {
  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: (r, index) => index + 1,
        sort: true,
        align: "left",
        width: "5%"
      },
      {
        Header: "Temat",
        accessor: "topic",
        sort: true,
        align: "left",
        width: "40%"
      },
      {
        Header: "Kategoria",
        accessor: r => r["tags"].join(", "),
        sort: true,
        align: "left",
        width: "20%"
      },
      {
        Header: "Ocena",
        accessor: row => <UserVote row={row} />,
        sort: true,
        align: "right",
        width: "8%",
        sortType: (a, b, name, desc) => {
          if (a.original.votes === b.original.votes) {
            return 0;
          }
          if (a.original.votes > b.original.votes) {
            return 1;
          }
          return -1;
        }
      },
      {
        Header: "Inicjator",
        accessor: "userAdded",
        sort: true,
        align: "left",
        width: "15%"
      }
    ],
    []
  );

  const data = useMemo(() => makeData(), []);

  return (
    <React.Fragment>
      <TableContainer>
        <TableHeader>
          <PrimaryButton>Dodaj +</PrimaryButton>
        </TableHeader>
        <Table columns={columns} data={data.results} />
      </TableContainer>
    </React.Fragment>
  );
}

const ButtonContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 5px;
  justify-content: flex-end;
`;

const PrimaryButton = styled.button`
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
  padding: 0px 30px;
  border: 2px solid rgb(0, 150, 64);
  color: rgb(255, 255, 255);
  background-color: rgb(0, 150, 64);
  &:hover {
    border-color: rgb(0, 150, 64);
    color: rgb(0, 150, 64);
    background-color: rgb(255, 255, 255);
  }

  ${({ small }) =>
    small &&
    css`
      min-width: 42px;
      height: 42px;
      font-size: 16px;
      padding: 0px 12px;
    `}
`;

const ErrorButton = styled.button`
  font-family: inherit;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  width: fit-content;
  border-radius: 4px;
  border: 2px solid rgb(255, 44, 44);
  transition: all 0.2s ease-in-out 0s;
  line-height: 1;
  outline: none;
  cursor: pointer;
  font-weight: bold;
  min-width: 42px;
  height: 42px;
  font-size: 1.6rem;
  padding: 0px 1.2rem;
  color: rgb(255, 255, 255);
  background-color: rgb(255, 44, 44);
  opacity: 1;
  &:hover {
    border-color: rgb(255, 44, 44);
    color: rgb(255, 44, 44);
    background-color: rgb(255, 255, 255);
    opacity: 1;
  }
  ${({ small }) =>
    small &&
    css`
      min-width: 42px;
      height: 42px;
      font-size: 16px;
      padding: 0px 12px;
    `}
`;

const StyledTable = styled.table`
  border-spacing: 0;
  background-color: white;
  width: 100%;
  table-layout: fixed;
  font-weight: bold;
  border-collapse: collapse;
  word-break: break-word;
  padding: 0 10px;
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

const StyledTableHead = styled.thead`
  background-color: rgb(252, 251, 252);
  color: rgb(157, 158, 163);
  font-weight: bold;
  height: 50px;
`;

const StyledTh = styled.th`
  padding: 15px 10px;
  font-weight: bold;
  white-space: nowrap;
  border-top: 1px solid rgb(243, 238, 240);
  border-bottom: 1px solid rgb(243, 238, 240);
  text-align: ${({ align }) => (align ? align : "center")};
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
  padding: 0 10px;
`;

const StyledIcon = styled.i`
  margin-left: 8px;
`;

const StyledVote = styled.span`
  color: ${({ color }) => (color ? color : "rgb(157, 158, 163)")};
`;
export default TableCt;
