import React, { useCallback, useEffect, useRef, useState } from "react";
import { Form, Button, Table } from "react-bootstrap";
import Papa from "papaparse";
import { TableCSVExporter } from "./TableCSVExporter";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
let xlsx = require("json-as-xlsx");

function Home() {
  const [date, setDate] = useState();
  const [today, setToday] = useState();

  const [euroEndingBalance, setEuroEndingBalance] = useState(null);
  const [euroExpensesEndingBalance, setEuroExpensesEndingBalance] = useState(0);
  const [euroIncomesEndingBalance, setEuroIncomesEndingBalance] = useState(0);

  const [dollarEndingBalance, setDollarEndingBalance] = useState(null);
  const [dollarExpensesEndingBalance, setDollarExpensesEndingBalance] =
    useState(null);
  const [dollarIncomesEndingBalance, setDollarIncomesEndingBalance] =
    useState(null);
  const [endingDollarRentalIncome, setDollarEndingRentalIncome] = useState(null);
  const [endingEuroRentalIncome, setEuroEndingRentalIncome] = useState(null);

  const [showTable, setShowTable] = useState(false);
  const [euroArray, setEuroArray] = useState();
  const [rentalIncomeArray, setRentalIncomeArray] = useState([]);
  const [dollarArray, setDollarArray] = useState();

  const [checkedRadio, setCheckedRadio] = useState(1);

  const [euroCession, setEuroCession] = useState(null);
  const [dollarCession, setDollarCession] = useState(null);

  const [euroBeginningBalance, setEuroBeginningBalance] = useState(0);
  const [dollarBeginningBalance, setDollarBeginningBalance] = useState(0);

  // A SAVOIR / RETENIR : How to handle ref and useeffect together =>
  // I wanted to delete the default button when the generate file button was clicked
  //which means that i needed to know when the default button "Download file" with id test-table-xls-button was injected in the DOM
  const [ref, setRef] = useState(null);

  const tableRef = useCallback((node) => {
    setRef(node);
  }, []);

  useEffect(() => {
    if (ref) {
      const el = document.getElementById("test-table-xls-button");
      if (el !== null) {
        el.style.visibility = "hidden";
      }
    }
  }, [ref]);
  
  const [values, setValues] = useState([]);

  const dollarChangeHandler = (event) => {
    setShowTable(false);
    // Passing file data (event.target.files[0]) to parse using Papa.parse
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const rowsArray = [];
        const valuesArray = [];

        // Iterating data to get column name and their values
        results.data.map((d) => {
          rowsArray.push(Object.keys(d));
          valuesArray.push(Object.values(d));
        });

        setDollarArray(results.data);

        let newArray = values.concat(results.data);

        newArray.sort((a, b) => {
          return a["Parent Category"].localeCompare(b["Parent Category"]);
        });

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

        newArray.sort((a, b) => {
          return a["Parent Category"].localeCompare(b["Parent Category"]);
        });

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
    let dollarResult = parseFloat(0);
    let euroResult = parseFloat(0);
    let rentalDollarIncomeResult = parseFloat(0);
    let rentalEuroIncomeResult = parseFloat(0);

    if (dollarArray) {
      dollarArray.forEach((val) => {
        dollarResult += parseFloat(val.Amount);
      });
    }

    if (dollarCession && checkedRadio == 1)
      dollarResult += parseFloat(dollarCession);

    setDollarExpensesEndingBalance(
      (Math.round(dollarResult * 100) / 100).toFixed(2)
    );

    //dollar rental income

    if (rentalIncomeArray) {
      rentalIncomeArray.forEach((val) => {
        rentalDollarIncomeResult += parseFloat(val.Amount);
      });
      if (dollarCession && checkedRadio == 2)
        rentalDollarIncomeResult += parseFloat(dollarCession);
    }

    if (rentalIncomeArray.length > 0 || rentalDollarIncomeResult) {
      setDollarEndingRentalIncome(
        (Math.round(rentalDollarIncomeResult * 100) / 100).toFixed(2)
      );
    }

    //euro rental income
    console.log()

    if (euroArray) {
      euroArray.forEach((val) => {
        euroResult += parseFloat(val.Amount);
      });
    }

    if (euroCession && checkedRadio == 2) {
      // no rental income for euros
      euroResult += parseFloat(euroCession);
      setEuroEndingRentalIncome(null)
    }

    else if (euroCession && checkedRadio == 1) {
      rentalEuroIncomeResult += parseFloat(euroCession);
      setEuroEndingRentalIncome(rentalEuroIncomeResult);
    } 

    setEuroExpensesEndingBalance(
      (Math.round(euroResult * 100) / 100).toFixed(2)
    );

    console.log('endingEuroRentalIncome')
    console.log(endingEuroRentalIncome)
    console.log('euroExpensesEndingBalance')
    console.log(euroExpensesEndingBalance)

    setShowTable(true);
  };

  const downloadExcelSheet = () => {
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

  function useHookWithRefCallback() {
    const ref = useRef(null);
    const setRef = useCallback((node) => {
      if (ref.current) {
        // Make sure to cleanup any events/references added to the last instance
        console.log("existe!!");
      }

      if (node) {
        // Check if a node is actually passed. Otherwise node would be null.
        // You can now do what you need to, addEventListeners, measure, etc.
      }

      // Save a reference to the node
      ref.current = node;
    }, []);

    return [setRef];
  }

  useEffect(() => {
    let dollarResult = dollarBeginningBalance;
    if (endingDollarRentalIncome > 0 && dollarExpensesEndingBalance) {
      console.log("icii");
      let tmp = endingDollarRentalIncome - dollarExpensesEndingBalance;
      dollarResult = tmp;
    } else if (endingDollarRentalIncome > 0) {
      dollarResult += parseFloat(endingDollarRentalIncome);
    } else if (dollarExpensesEndingBalance) {
      dollarResult += parseFloat(dollarExpensesEndingBalance);
    }
    console.log("dollarResult");
    console.log(dollarResult);
    setDollarEndingBalance((Math.round(dollarResult * 100) / 100).toFixed(2));
  }, [dollarExpensesEndingBalance]);

  useEffect(() => {
    let euroResult = euroBeginningBalance;
    if (endingEuroRentalIncome > 0 && euroExpensesEndingBalance) {
      let tmp = endingEuroRentalIncome - euroExpensesEndingBalance;
      euroResult = tmp;
    }
    else if (endingEuroRentalIncome > 0) {
      euroResult += parseFloat(endingEuroRentalIncome);
    } else if (euroExpensesEndingBalance) {
      euroResult += parseFloat(euroExpensesEndingBalance);
    }
    setEuroEndingBalance((Math.round(euroResult * 100) / 100).toFixed(2));
  }, [euroExpensesEndingBalance]);

  useEffect(() => {
    let euroResult = 0;

    if (euroBeginningBalance) {
      if (euroExpensesEndingBalance)
        euroResult =
          parseFloat(euroExpensesEndingBalance) +
          parseFloat(euroBeginningBalance);
      else {
        euroResult = euroEndingBalance;
      }
      if (endingEuroRentalIncome) euroResult = endingEuroRentalIncome - euroResult;
      setEuroEndingBalance((Math.round(euroResult * 100) / 100).toFixed(2));    }
  }, [euroBeginningBalance]);

  useEffect(() => {
    let dollarResult = 0;

    if (dollarBeginningBalance) {
      if (dollarExpensesEndingBalance)
        dollarResult =
          parseFloat(dollarExpensesEndingBalance) +
          parseFloat(dollarBeginningBalance);
      else {
        dollarResult = dollarBeginningBalance;
      }
      if (endingDollarRentalIncome) dollarResult = endingDollarRentalIncome - dollarResult;
      setDollarEndingBalance((Math.round(dollarResult * 100) / 100).toFixed(2));
    }
  }, [dollarBeginningBalance]);

  useEffect(() => {
    let dollarResult = 0;
    if (endingDollarRentalIncome > 0 && dollarExpensesEndingBalance) {
      dollarResult = endingDollarRentalIncome - dollarExpensesEndingBalance;
    } else if (endingDollarRentalIncome > 0) {
      dollarResult = endingDollarRentalIncome;
    } else if (dollarExpensesEndingBalance) {
      dollarResult = dollarExpensesEndingBalance;
    }
    setDollarEndingBalance((Math.round(dollarResult * 100) / 100).toFixed(2));
  }, [endingDollarRentalIncome]);

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
            onChange={(e) => {
              setEuroBeginningBalance(e.target.value);
              setShowTable(false);
            }}
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
            onChange={(e) => {
              setDollarBeginningBalance(e.target.value);
              setShowTable(false);
            }}
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
            onChange={(e) => {
              setEuroCession(e.target.value);
              setShowTable(false);
            }}
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
            onChange={(e) => {
              setDollarCession(e.target.value);
              setShowTable(false);
            }}
          />
        </Form.Group>

        <div
          key={`inline-radio`}
          className="mb-3"
          onChange={(e) => {
            setCheckedRadio(e.target.id[e.target.id.length - 1]);
            setShowTable(false);
          }}
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
            ref={tableRef}
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
                      <td><strong>USD {dollarCession}</strong></td>
                      <td> </td>
                    </>
                  )}
                  {dollarCession && checkedRadio == 2 && (
                    <>
                      <td><strong>USD {dollarCession}</strong></td>
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
                      <td><strong>{euroCession} EUR</strong></td>
                      <td> </td>
                      <td> </td>
                    </>
                  )}
                  {euroCession && checkedRadio == 2 && (
                    <>
                      <td> </td>
                      <td><strong>{euroCession} EUR</strong></td>
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
                {(endingDollarRentalIncome) && (
                  <td>
                    <strong>USD {endingDollarRentalIncome}</strong>
                  </td>
                )}
                {!endingDollarRentalIncome && <td>-</td>}
                {dollarExpensesEndingBalance && (
                  <td>
                    <strong>USD {dollarExpensesEndingBalance}</strong>
                  </td>
                )}
                {!dollarExpensesEndingBalance && <td>-</td>}
                <td>
                  <strong>USD {dollarEndingBalance}</strong>
                </td>

                {euroExpensesEndingBalance && checkedRadio == 1 && (
                  <>
                    <td>
                      <strong> {endingEuroRentalIncome} EUR</strong>
                    </td>
                    <td><strong>{euroExpensesEndingBalance} EUR</strong></td>
                  </>
                )}
                {!euroExpensesEndingBalance && <td>-</td>}

                {euroExpensesEndingBalance && checkedRadio == 2 && (
                  <>
                    <td>
                      {endingEuroRentalIncome &&(<strong> {endingEuroRentalIncome} EUR</strong>)}
                      {!endingEuroRentalIncome && <></>}
                    </td>
                    <td><strong>{euroExpensesEndingBalance} EUR</strong></td>
                  </>
                )}
                {!euroExpensesEndingBalance && <td>-</td>}
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
