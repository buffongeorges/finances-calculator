import React, { useEffect, useRef, useState } from "react";
import { Form, Button, Table } from "react-bootstrap";
import Papa from "papaparse";
import { TableCSVExporter } from "./TableCSVExporter";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
let xlsx = require("json-as-xlsx");

function Home() {
  const tableRef = useRef(null);
  const [date, setDate] = useState();
  const [today, setToday] = useState();

  const [euroEndingBalance, setEuroEndingBalance] = useState(null);
  const [euroExpensesEndingBalance, setEuroExpensesEndingBalance] = useState(0);
  const [euroIncomesEndingBalance, setEuroIncomesEndingBalance] = useState(0);

  const [dollarEndingBalance, setDollarEndingBalance] = useState(null);
  const [dollarExpensesEndingBalance, setDollarExpensesEndingBalance] = useState(null);
  const [dollarIncomesEndingBalance, setDollarIncomesEndingBalance] = useState(null);
  const [endingRentalIncome, setEndingRentalIncome] = useState(null);

  const [showTable, setShowTable] = useState(false);
  const [euroArray, setEuroArray] = useState();
  const [rentalIncomeArray, setRentalIncomeArray] = useState([]);
  const [dollarArray, setDollarArray] = useState();

  const [checkedRadio, setCheckedRadio] = useState(1);

  const [euroCession, setEuroCession] = useState(null);
  const [dollarCession, setDollarCession] = useState(null);

  const [euroBeginningBalance, setEuroBeginningBalance] = useState(0);
  const [dollarBeginningBalance, setDollarBeginningBalance] = useState(0);

  //State to store the values
  const [values, setValues] = useState([]);

  const dollarChangeHandler = (event) => {
    setShowTable(false);
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

        // Filtered Values
        // setValues(results.data);

        setDollarArray(results.data);

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

  const euroChangeHandler = (event) => {
    setShowTable(false);
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
    setShowTable(false);
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

    if (dollarCession) dollarResult += parseFloat(dollarCession);

    // setDollarEndingBalance(dollarResult);
    setDollarExpensesEndingBalance((Math.round(dollarResult * 100) / 100).toFixed(2));
    if (rentalIncomeArray) {
      rentalIncomeArray.forEach((val) => {
        rentalIncomeResult += parseFloat(val.Amount);
      });
    }
    
    if (rentalIncomeArray.length > 0)
    {
      setEndingRentalIncome(
        (Math.round(rentalIncomeResult * 100) / 100).toFixed(2)
      );
    }
    

    // setShowTable(true);

    if (euroArray) {
      euroArray.forEach((val) => {
        console.log("val");
        console.log(val.Amount);
        euroResult += parseFloat(val.Amount);
      });
    }

    if (euroCession) euroResult += parseFloat(euroCession);

    setEuroExpensesEndingBalance((Math.round(euroResult * 100) / 100).toFixed(2));
    
    setShowTable(true);
  };

  const downloadExcelSheet = () => {
    console.log("todo");
    var buttonToClick = document.getElementById("test-table-xls-button");
    buttonToClick.click();
  };

  useEffect(() => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + "/" + dd + "/" + yyyy;

    setToday(today);
  }, []);

  useEffect(() => {
    let dollarResult = 0;
    if (endingRentalIncome > 0 && dollarExpensesEndingBalance) {
      dollarResult = endingRentalIncome - dollarExpensesEndingBalance;
    }
    else if (endingRentalIncome > 0) {
      dollarResult = endingRentalIncome;
    }
    else if (dollarExpensesEndingBalance) {
      dollarResult = dollarExpensesEndingBalance;
    }
    setDollarEndingBalance(dollarResult);

  }, [dollarExpensesEndingBalance]);

  useEffect(() => {
    let euroResult = 0;
    if (euroExpensesEndingBalance) euroResult = euroExpensesEndingBalance;
    setEuroEndingBalance(euroResult);

  }, [euroExpensesEndingBalance]);

  useEffect(() => {
    let dollarResult = 0;
    if (endingRentalIncome > 0 && dollarExpensesEndingBalance) {
      dollarResult = endingRentalIncome - dollarExpensesEndingBalance;
    }
    else if (endingRentalIncome > 0) {
      dollarResult = endingRentalIncome;
    }
    else if (dollarExpensesEndingBalance) {
      dollarResult = dollarExpensesEndingBalance;
    }
    setDollarEndingBalance(dollarResult);

  }, [endingRentalIncome]);

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
        </Form.Group>

        <Form.Group className="mb-5">
          <Form.Label>Choisissez le fichier Recettes USD</Form.Label>
          <Form.Control
            type="file"
            placeholder="Enter email"
            onChange={rentalIncomeChangeHandler}
          />
        </Form.Group>
        <Form.Group className="mb-5">
          <Form.Label>Choisissez le fichier Dépenses USD</Form.Label>
          <Form.Control
            type="file"
            placeholder="Enter email"
            onChange={dollarChangeHandler}
          />
        </Form.Group>

        <Form.Group className="mb-5">
          <Form.Label>Choisissez le fichier Dépenses EURO</Form.Label>
          <Form.Control
            type="file"
            placeholder="Enter email"
            onChange={euroChangeHandler}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="inputPassword5">
            Cession devises EURO (optionnel)
          </Form.Label>
          <Form.Control
            type="number"
            defaultValue={0}
            maxLength={10}
            id="inputPassword5"
            aria-describedby="passwordHelpBlock"
            onChange={(e) => setEuroCession(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="inputPassword5">
            Cession devises USD (optionnel)
          </Form.Label>
          <Form.Control
            type="number"
            defaultValue={0}
            maxLength={10}
            id="inputPassword5"
            aria-describedby="passwordHelpBlock"
            onChange={(e) => setDollarCession(e.target.value)}
          />
        </Form.Group>

        <div
          key={`inline-radio`}
          className="mb-3"
          onChange={(e) => setCheckedRadio(e.target.id[e.target.id.length - 1])}
        >
          <Form.Label htmlFor="inputPassword5">
            Devise achetée (optionnel)
          </Form.Label>
          <Form.Check
            inline
            label="$"
            name="group1"
            type="radio"
            id={`inline-radio-1`}
            defaultChecked={true}
          />
          <Form.Check
            inline
            label="€"
            name="group1"
            type="radio"
            id={`inline-radio-2`}
          />
        </div>

        <Button
          variant="primary"
          type="submit"
          onClick={() => generateCustomReport()}
        >
          Generate file
        </Button>
      </div>

      {showTable && (
        <>
          <ReactHTMLTableToExcel
            id="test-table-xls-button"
            className="download-table-xls-button"
            table="dataTable"
            filename={`property-ink-export-${date}`}
            sheet="tablexls"
            buttonText="Download File"
          />
          <Table
            id="dataTable"
            style={{
              marginLeft: "2rem",
              marginRight: "2rem",
              marginTop: "2rem",
            }}
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

              {/* Cession de devises */}
              {(dollarCession || euroCession) && (
                <tr>
                  <td> </td>
                  <td>
                    <strong>Cession de devises</strong>
                  </td>
                  {dollarCession && checkedRadio == 1 && (
                    <>
                      <td> </td>
                      <td>$ {dollarCession}</td>
                      <td> </td>
                    </>
                  )}
                  {dollarCession && checkedRadio == 2 && (
                    <>
                      <td>$ {dollarCession}</td>
                      <td> </td>
                      <td> </td>
                    </>
                  )}
                  {!dollarCession && (
                    <>
                      <td> </td> <td> </td> <td> </td>
                    </>
                  )}
                  {/* ----- */}
                  {euroCession && checkedRadio == 1 && (
                    <>
                      <td>$ {euroCession}</td>
                      <td> </td>
                      <td> </td>
                    </>
                  )}
                  {euroCession && checkedRadio == 2 && (
                    <>
                      <td> </td>
                      <td>$ {euroCession}</td>
                      <td> </td>
                    </>
                  )}
                  {!euroCession && (
                    <>
                      <td> </td> <td> </td> <td> </td>
                    </>
                  )}
                </tr>
              )}

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
                <td>
                  <strong>Solde de cloture</strong>
                </td>
                {rentalIncomeArray.length > 0 && (
                  <td>
                    <strong>USD {endingRentalIncome}</strong>
                  </td>
                )}
                {rentalIncomeArray.length == 0 && <td>-</td>}
                {dollarExpensesEndingBalance && (<td><strong>USD {dollarExpensesEndingBalance}</strong></td>)}
                {!dollarExpensesEndingBalance &&<td>-</td>}
                <td>
                  <strong>USD {dollarEndingBalance}</strong>
                </td>
                <td>-</td>
                {euroExpensesEndingBalance && (<td><strong> {euroExpensesEndingBalance} EUR</strong></td>)}
                {!euroExpensesEndingBalance &&<td>-</td>}
                <td>
                  <strong> {euroEndingBalance} EUR</strong>
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
        </>
      )}
      {showTable && (
        <Button
          style={{
            marginLeft: "2rem",
            marginRight: "2rem",
            marginTop: "2rem",
            marginBottom: "2rem",
          }}
          onClick={() => downloadExcelSheet()}
        >
          Download File
        </Button>
      )}
    </div>
  );
}

export default Home;
