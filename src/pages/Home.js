import React, { useEffect, useState } from "react";
import { Form, Button, Table } from "react-bootstrap";
import Papa from "papaparse";
import { TableCSVExporter } from "./TableCSVExporter";

function Home() {
  const [date, setDate] = useState();
  const [today, setToday] = useState();
  const [euroEndingBalance, setEuroEndingBalance] = useState(0);
  const [dollarEndingBalance, setDollarEndingBalance] = useState(0);
  const [endingRentalIncome, setEndingRentalIncome] = useState(0);
  const [rentalIncomeArray, setRentalIncomeArray] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [euroArray, setEuroArray] = useState();
  const [dollarArray, setDollarArray] = useState();

  const [euroBeginningBalance, setEuroBeginningBalance] = useState(0);
  const [dollarBeginningBalance, setDollarBeginningBalance] = useState(0);

  // State to store parsed data
  const [parsedData, setParsedData] = useState([]);

  //State to store table Column name
  const [tableRows, setTableRows] = useState([]);

  //State to store the values
  const [values, setValues] = useState([]);

  const dollarChangeHandler = (event) => {
    // Passing file data (event.target.files[0]) to parse using Papa.parse
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        console.log("Hello world");
        console.log(results.data);
        const rowsArray = [];
        const valuesArray = [];

        // Iterating data to get column name and their values
        results.data.map((d) => {
          rowsArray.push(Object.keys(d));
          valuesArray.push(Object.values(d));
        });

        // Parsed Data Response in array format
        setParsedData(results.data);

        // Filtered Column Names
        setTableRows(rowsArray[0]);

        // Filtered Values
        setValues(results.data);

        setDollarArray(results.data);
      },
    });
  };

  const euroChangeHandler = (event) => {
    // Passing file data (event.target.files[0]) to parse using Papa.parse
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const valuesArray = [];

        // Iterating data to get column name and their values
        results.data.map((d) => {
          // rowsArray.push(Object.keys(d));
          valuesArray.push(Object.values(d));
        });

        console.log("tableau en euro");
        console.log(results.data);

        console.log("previous dollar array");
        console.log(values);

        setEuroArray(results.data);
        let newArray = values.concat(results.data);
        console.log("before sort");
        console.log(newArray);

        newArray.sort((a, b) => {
          console.log(a);
          console.log(a["Parent Category"]);
          return a["Parent Category"].localeCompare(b["Parent Category"]);
        });
        console.log("after sort");
        console.log(newArray);

        setValues(newArray);
      },
    });
  };

  const rentalIncomeChangeHandler = (event) => {
    // Passing file data (event.target.files[0]) to parse using Papa.parse
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        console.log("rental incomes");
        console.log(results.data);
        setRentalIncomeArray(results.data);
      },
    });
  };

  const generateCustomReport = () => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + "-" + dd + "-" + yyyy;
    setDate(today);
    console.log("le rapport");
    console.log(values);
    let dollarResult = parseFloat(dollarBeginningBalance);
    let euroResult = parseFloat(euroBeginningBalance);
    let rentalIncomeResult = parseFloat(0);

    if (dollarArray) {
      dollarArray.forEach((val) => {
        console.log("val");
        console.log(val.Amount);
        dollarResult += parseFloat(val.Amount);
      });
    }
    setDollarEndingBalance(dollarResult);

    if (rentalIncomeArray) {
      rentalIncomeArray.forEach((val) => {
        rentalIncomeResult += parseFloat(val.Amount);
      });
    }
    setEndingRentalIncome(rentalIncomeResult);
    // setShowTable(true);

    if (euroArray) {
      euroArray.forEach((val) => {
        console.log("val");
        console.log(val.Amount);
        euroResult += parseFloat(val.Amount);
      });
    }
    setEuroEndingBalance(euroResult);

    setShowTable(true);
  };

  const downloadExcelSheet = () => {
    console.log("todo");
    const dataTable = document.getElementById("dataTable");
    const exporter = new TableCSVExporter(dataTable);
    const csvOutput = exporter.convertToCSV();
    const csvBlob = new Blob([csvOutput], { type: "text/csv" });
    const blobUrl = URL.createObjectURL(csvBlob);
    const anchorElement = document.createElement("a");

    anchorElement.href = blobUrl;
    anchorElement.download = `table-export-${date}.csv`;
    anchorElement.click();

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 500);
  };

  useEffect(() => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + "/" + dd + "/" + yyyy;

    setToday(today)
  }, []);

  return (
    <div className="App">
      <div style={{ marginLeft: "2rem", marginRight: "2rem" }}>
        <center>
          <h1>Calculateur 🤑</h1>
        </center>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="inputPassword5">Solde initial EUR</Form.Label>
          <Form.Control
            defaultValue={0}
            type="number"
            maxLength={10}
            id="inputPassword5"
            aria-describedby="passwordHelpBlock"
            onChange={(e) => setEuroBeginningBalance(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="inputPassword5">Solde initial USD</Form.Label>
          <Form.Control
            type="number"
            defaultValue={0}
            maxLength={10}
            id="inputPassword5"
            aria-describedby="passwordHelpBlock"
            onChange={(e) => setDollarBeginningBalance(e.target.value)}
          />
          {/* <Form.Text id="passwordHelpBlock" muted>
            Your password must be 8-20 characters long, contain letters and
            numbers, and must not contain spaces, special characters, or emoji.
          </Form.Text> */}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Choisissez le fichier Recettes USD</Form.Label>
          <Form.Control
            type="file"
            placeholder="Enter email"
            onChange={rentalIncomeChangeHandler}
          />
          <Form.Text className="text-muted">
            Example : We'll never share your incomes with anyone else.
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Choisissez le fichier Dépenses USD</Form.Label>
          <Form.Control
            type="file"
            placeholder="Enter email"
            onChange={dollarChangeHandler}
          />
          <Form.Text className="text-muted">
            Example : We'll never share your incomes with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Choisissez le fichier Dépenses EURO</Form.Label>
          <Form.Control
            type="file"
            placeholder="Enter email"
            onChange={euroChangeHandler}
          />
          <Form.Text className="text-muted">
            Example : We'll never share your expenses with anyone else.
          </Form.Text>
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          onClick={() => generateCustomReport()}
        >
          Generate file
        </Button>
      </div>

      {showTable && (
        <Table
          id="dataTable"
          style={{ marginLeft: "2rem", marginRight: "2rem", marginTop: "2rem" }}
          striped
          bordered
          hover
        >
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Recettes USD</th>
              <th>Depenses USD</th>
              <th>Solde USD</th>
              <th>Recettes EURO</th>
              <th>Depenses EURO</th>
              <th>Solde EURO</th>
            </tr>
          </thead>
          <tbody>
            {/* Beginning Balance */}
            <tr>
              <td></td>
              <td>Solde initial</td>
              <td>-</td>
              <td>-</td>
              <td>
                <strong>USD {dollarBeginningBalance} </strong>
              </td>
              <td>-</td>
              <td>-</td>
              <td>
                <strong>{euroBeginningBalance} EUR</strong>
              </td>
            </tr>

            {/* Rental Income */}
            <tr>
              <td></td>
              <td>
                {" "}
                <strong>Rental Income </strong>
              </td>
            </tr>

            {rentalIncomeArray.map((value, index) => {
              return (
                <tr key={index}>
                  {/* {value.map((val, i) => {
                  return <td key={i}>{val}</td>;
                })} */}
                  <td>{value.Date}</td>
                  <td>{value["Client Name"]}</td>
                  <td>USD {value.Amount}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              );
            })}

            <tr>
              <td>-</td>
              <td>
                <strong>{values[0]["Parent Category"]}</strong>
              </td>
            </tr>
            {values.map((value, index) => {
              return (
                <>
                  {index >= 1 &&
                    value["Parent Category"].localeCompare(
                      values[index - 1]["Parent Category"]
                    ) != 0 && (
                      <tr>
                        <td>-</td>
                        <td>
                          <strong>{value["Parent Category"]}</strong>
                        </td>
                        <td> </td>
                        <td> </td>
                        <td> </td>
                        <td> </td>
                        <td> </td>
                        <td> </td>
                      </tr>
                    )}

                  {value.Currency == "EUR" && (
                    <tr key={index}>
                      <td>{value.Date}</td>
                      <td>{value.Merchant}</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>{value.Amount}</td>
                      <td>-</td>
                    </tr>
                  )}
                  {value.Currency == "USD" && (
                    <tr key={index}>
                      <td>{value.Date}</td>
                      <td>{value.Merchant}</td>
                      <td>-</td>
                      <td>{value.Amount}</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                  )}
                </>
              );
            })}
            <tr>
              <td></td>
              <td><strong>Solde de cloture</strong></td>
              <td>
                <strong>USD {endingRentalIncome}</strong>
              </td>
              <td>-</td>
              <td>
                <strong>USD {dollarEndingBalance}</strong>
              </td>
              <td>-</td>
              <td>-</td>
              <td>
                <strong> {euroEndingBalance}EUR</strong>
              </td>
            </tr>
            <tr>
              <td>Account Managed by</td>
              <td>ROGERS Line</td>
            </tr>
            <tr>
              <td>Report generated on</td>
              <td>{today}</td>
            </tr>
          </tbody>
        </Table>
      )}
      {showTable && (<Button
        style={{ marginLeft: "2rem", marginRight: "2rem", marginTop: "2rem" }}
        onClick={() => downloadExcelSheet()}
      >
        Download File
      </Button>)}
    </div>
  );
}

export default Home;
