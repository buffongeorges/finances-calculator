import React, { useCallback, useEffect, useRef, useState } from "react";
import { Form, Button, Table } from "react-bootstrap";
import Papa from "papaparse";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import "./Home.css";

function Home() {
  const [date, setDate] = useState();
  const [today, setToday] = useState();

  //refs
  const usdBeginningBalanceRef = useRef(null);
  const eurBeginningBalanceRef = useRef(null);
  const fundsWireUsdRef = useRef(null);
  const fundsWireEurRef = useRef(null);
  const usdCurrencyExchangeRef = useRef(null);
  const eurCurrencyExchangeRef = useRef(null);

  //client
  const [clientName, setClientName] = useState("");

  //beginning balances
  const [euroBeginningBalance, setEuroBeginningBalance] = useState(0);
  const [dollarBeginningBalance, setDollarBeginningBalance] = useState(0);

  //funds from owner
  const [fundsFromOwnerEuro, setFundsFromOwnerEuro] = useState(0);
  const [fundsFromOwnerDollar, setFundsFromOwnerDollar] = useState(0);

  //ending balances
  const [euroEndingBalance, setEuroEndingBalance] = useState(0);
  const [dollarEndingBalance, setDollarEndingBalance] = useState(0);
  const [euroExpensesEndingBalance, setEuroExpensesEndingBalance] = useState(0);

  const [dollarExpensesEndingBalance, setDollarExpensesEndingBalance] =
    useState(0);
  const [endingDollarRentalIncome, setDollarEndingRentalIncome] = useState(0);
  const [endingEuroRentalIncome, setEuroEndingRentalIncome] = useState(0);

  const [showTable, setShowTable] = useState(false);
  const [euroArray, setEuroArray] = useState();
  const [rentalIncomeArray, setRentalIncomeArray] = useState([]);
  const [dollarArray, setDollarArray] = useState();

  const [checkedRadioCurrency, setCheckedRadioCurrency] = useState(1);
  const [checkedRadioReportPeriod, setCheckedRadioReportPeriod] = useState(1);

  const [euroCession, setEuroCession] = useState(null);
  const [dollarCession, setDollarCession] = useState(null);

  // A SAVOIR / RETENIR : How to handle ref and useeffect together =>
  // I wanted to delete the default button when the generate file button was clicked
  //which means that i needed to know when the default button "Download file" with id test-table-xls-button was injected in the DOM
  const [ref, setRef] = useState(null);

  const styles = {
    border: "1px solid black",
    textAlign: "left",
  };

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
        console.log("rentalIncomeArray USD.............");
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

    today = mm + "/" + dd + "/" + yyyy;
    setDate(today);
    let dollarResult = parseFloat(0);
    let euroResult = parseFloat(0);
    let rentalDollarIncomeResult = parseFloat(0);
    let rentalEuroIncomeResult = parseFloat(0);

    if (dollarArray) {
      dollarArray.forEach((val) => {
        const parsedValue = Number(val.Amount.replace(",", "."));
        dollarResult += parseFloat(parsedValue);
      });
    }

    if (dollarCession && checkedRadioCurrency == 1) {
      dollarResult += parseFloat(dollarCession);
    }

    if (dollarBeginningBalance < 0) {
      //solde initial négatif => dépense
      dollarResult += parseFloat(Math.abs(dollarBeginningBalance));
    }

    // add commissions (TPI & Wholesaler) if present
    rentalIncomeArray.forEach((rentalIncome) => {
      console.log(rentalIncome);
      if (rentalIncome["TPI Commission"]) {
        console.log("TPI Commission exists!");
        const parsedTpiCommission = Number(
          rentalIncome["TPI Commission"].replace(",", ".")
        );
        dollarResult += parseFloat(parsedTpiCommission);
      }
      if (rentalIncome["Wholesaler Commission"]) {
        console.log("Wholesaler Commission exists!");
        const parsedWholesalerCommission = Number(
          rentalIncome["Wholesaler Commission"].replace(",", ".")
        );
        dollarResult += parseFloat(parsedWholesalerCommission);
      }
    });
    setDollarExpensesEndingBalance(
      (Math.round(dollarResult * 100) / 100).toFixed(2)
    );

    //dollar rental income
    if (dollarBeginningBalance >= 0) {
      rentalDollarIncomeResult += parseFloat(dollarBeginningBalance);
    }
    rentalDollarIncomeResult += parseFloat(fundsFromOwnerDollar);
    // TODO : si fundsFromOwnerDollar < 0 est ce qu'il faut aussi le passer dans la case dépenses ???
    // Si oui, il va falloir faire si > 0 => +rentalIncomeDollar et sinon, +dollarResult (qui represente les dépenses)
    // et ne pas oublier de faire un affichage conditionnel (< ou >) des <td>
    // et pareil pour fundsFromOwnerEuro....
    if (rentalIncomeArray) {
      rentalIncomeArray.forEach((val) => {
        rentalDollarIncomeResult += parseFloat(val.Amount);
      });
      if (dollarCession && checkedRadioCurrency == 2)
        rentalDollarIncomeResult += parseFloat(dollarCession);
    }
    console.log(rentalDollarIncomeResult);
    if (rentalIncomeArray.length > 0 || rentalDollarIncomeResult >= 0) {
      console.log("la valeur que je fixe est: ");
      console.log(
        (Math.round(rentalDollarIncomeResult * 100) / 100).toFixed(2)
      );
      setDollarEndingRentalIncome(
        (Math.round(rentalDollarIncomeResult * 100) / 100).toFixed(2)
      );
    }

    //euro rental income
    if (euroArray) {
      console.log(euroArray);
      euroArray.forEach((val) => {
        euroResult += parseFloat(val.Amount);
      });
    }

    if (euroBeginningBalance < 0) {
      //solde initial négatif => dépense
      euroResult += parseFloat(Math.abs(euroBeginningBalance));
    }

    if (euroBeginningBalance >= 0) {
      rentalEuroIncomeResult += parseFloat(euroBeginningBalance);
    }
    rentalEuroIncomeResult += parseFloat(fundsFromOwnerEuro);
    if (euroCession && checkedRadioCurrency == 2) {
      euroResult += parseFloat(euroCession);
      // no rental income for euros ...
      // TO DO : ... except for funds/wire
      // rentalEuroIncomeResult += parseFloat(euroCession);
      // setEuroEndingRentalIncome(rentalEuroIncomeResult);
    } else if (euroCession && checkedRadioCurrency == 1) {
      rentalEuroIncomeResult += parseFloat(euroCession);
    }
    setEuroEndingRentalIncome(
      (Math.round(rentalEuroIncomeResult * 100) / 100).toFixed(2)
    );

    setEuroExpensesEndingBalance(
      (Math.round(euroResult * 100) / 100).toFixed(2)
    );
    setShowTable(true);

    console.log("wait while generating....");
    console.log("values");
    console.log(values);
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

    today = dd + "/" + mm + "/" + yyyy;

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
    let dollarResult = dollarBeginningBalance >= 0 ? dollarBeginningBalance : 0;
    console.log("positif???");
    console.log(dollarResult > 0);
    console.log("dollarResult", dollarResult);
    if (dollarExpensesEndingBalance) {
      console.log("dans le if");
      console.log(dollarResult);
      let tmp = endingDollarRentalIncome - dollarExpensesEndingBalance;

      dollarResult = tmp;
      // dollarResult = parseFloat(tmp) + parseFloat(dollarBeginningBalance);
    } else if (endingDollarRentalIncome > 0) {
      console.log("dans le else if 1");
      console.log(dollarResult);
      // dollarResult += parseFloat(endingDollarRentalIncome);
      dollarResult =
        parseFloat(dollarResult) + parseFloat(endingDollarRentalIncome);
    } else if (dollarExpensesEndingBalance) {
      console.log("dans le else if 2");
      dollarResult =
        parseFloat(dollarResult) + parseFloat(dollarExpensesEndingBalance);
      // dollarResult += parseFloat(dollarExpensesEndingBalance);
    }
    console.log("dollarResult");
    console.log(dollarResult);
    setDollarEndingBalance((Math.round(dollarResult * 100) / 100).toFixed(2));
  }, [dollarExpensesEndingBalance]);

  useEffect(() => {
    let euroResult = euroBeginningBalance >= 0 ? euroBeginningBalance : 0;
    if (endingEuroRentalIncome > 0 && euroExpensesEndingBalance) {
      console.log("dans le if");
      let tmp = endingEuroRentalIncome - euroExpensesEndingBalance;
      euroResult = tmp;
    } else if (endingEuroRentalIncome > 0) {
      console.log("dans le else if 1");
      euroResult = parseFloat(euroResult) + parseFloat(endingEuroRentalIncome);
      // euroResult += parseFloat(endingEuroRentalIncome);
    } else if (euroExpensesEndingBalance) {
      console.log("dans le else if 2");
      euroResult =
        parseFloat(euroResult) + parseFloat(euroExpensesEndingBalance);
      // euroResult += parseFloat(euroExpensesEndingBalance);
    }
    setEuroEndingBalance((Math.round(euroResult * 100) / 100).toFixed(2));
    console.log("coucou");
    console.log(euroResult);
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
      if (endingEuroRentalIncome)
        euroResult = endingEuroRentalIncome - euroResult;
      setEuroEndingBalance((Math.round(euroResult * 100) / 100).toFixed(2));
    }
    console.log("yooo");
    console.log(euroResult);
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
      if (endingDollarRentalIncome) {
        dollarResult = endingDollarRentalIncome - dollarResult;
      }
      console.log("dollarResult");
      console.log(dollarResult);
      setDollarEndingBalance((Math.round(dollarResult * 100) / 100).toFixed(2));
    }
  }, [dollarBeginningBalance]);

  useEffect(() => {
    console.log("on va faire le calcul de Solde USD ...");
    console.log(dollarBeginningBalance);
    let dollarResult = dollarBeginningBalance >= 0 ? dollarBeginningBalance : 0;
    console.log("dollarResult", dollarResult);

    if (dollarExpensesEndingBalance) {
      dollarResult =
        // parseFloat(dollarResult) + // déjà ajouté auparavant...
        parseFloat(endingDollarRentalIncome) -
        parseFloat(dollarExpensesEndingBalance);
    } else if (endingDollarRentalIncome > 0) {
      dollarResult =
        parseFloat(dollarResult) + parseFloat(endingDollarRentalIncome);
    } else if (dollarExpensesEndingBalance) {
      dollarResult =
        parseFloat(dollarResult) + parseFloat(dollarExpensesEndingBalance);
    }
    setDollarEndingBalance((Math.round(dollarResult * 100) / 100).toFixed(2));
  }, [endingDollarRentalIncome]);

  useEffect(() => {
    console.log("on va faire le calcul de solde EUR...");
    console.log(euroBeginningBalance);
    let euroResult = euroBeginningBalance >= 0 ? euroBeginningBalance : 0;
    if (euroExpensesEndingBalance) {
      euroResult =
        // parseFloat(euroResult) + // déjà ajouté auparavant...
        parseFloat(endingEuroRentalIncome) -
        parseFloat(euroExpensesEndingBalance);
    } else if (endingEuroRentalIncome > 0) {
      euroResult = parseFloat(euroResult) + parseFloat(endingEuroRentalIncome);
    } else if (euroExpensesEndingBalance) {
      euroResult =
        parseFloat(euroResult) + parseFloat(euroExpensesEndingBalance);
    }
    console.log("euroResult");
    console.log(euroResult);
    setEuroEndingBalance((Math.round(euroResult * 100) / 100).toFixed(2));
  }, [endingEuroRentalIncome]);

  // parse dates to have them all in the following format : mm/dd/yyyy
  // ATTENTION : dateString have to be like : dd/mm/yyyy or yyyy-mm-dd
  //for good conversion
  // while be used only for dates generated by the program (today)
  const parseDate = (dateString) => {
    let year, month, day;

    if (dateString.includes("/")) {
      // Format JJ/MM/AAAA
      const parts = dateString.split("/");
      year = parseInt(parts[2], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[0], 10);
    } else if (dateString.includes("-")) {
      // Format AAAA-MM-JJ
      const parts = dateString.split("-");
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else {
      // Format non reconnu
      throw new Error("Invalid date format");
    }

    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    return new Date(formattedDate).toLocaleDateString("en-US", {
      timeZone: "UTC",
    });
  };

  //this function will be used to convert dates from excel sheets
  //be careful with it, for now just for dates like yyyy-mm-dd
  const parseDateArray = (dateString) => {
    if (/^\d{4}/.test(dateString)) {
      // Vérifie si la chaîne de caractères commence par une année (4 chiffres)
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}/${year}`;
    } else {
      return dateString;
    }
  };

  const parseAmount = (amount) => {
    if (amount == 0 || amount == '0.00' || amount == '0,00') {
      return '0,00';
    }
    if (typeof amount === "string") {
      const parsedValue = Number(amount.replace(",", "."));
      const isNegative = parsedValue < 0;
      const absValue = Math.abs(parsedValue);
      const decimalSeparator = ',';
      const formattedValue = Number(absValue).toLocaleString('fr-FR', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedValueWithoutSpaces = formattedValue.replace(/\s/g, '');
      return isNegative ? "-" + formattedValueWithoutSpaces : formattedValueWithoutSpaces;
    }
    if (typeof amount === "number") {
      const decimalSeparator = ',';
      const formattedValue = Number(amount).toLocaleString('fr-FR', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedValueWithoutSpaces = formattedValue.replace(/\s/g, '');
      return formattedValueWithoutSpaces;
    }
    return "NaN";
  };

  return (
    <div className="App">
      <div
        style={{
          marginLeft: "2rem",
          marginRight: "2rem",
          marginTop: "-1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginTop: "0rem",
            marginBottom: "2rem",
          }}
        >
          <img
            src={require("../images/the-property-ink-autumn.png")}
            style={{ width: "35%", maxHeight: "20%" }}
          />
          <div style={{ alignSelf: "flex-end", fontSize: "2rem" }}>
            <strong>Calculator</strong>
          </div>
        </div>

        <Button
          variant="secondary"
          type="submit"
          style={{ marginBottom: "1rem" }}
          onClick={() => {
            window.location.reload();
          }}
        >
          Restart
        </Button>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="clientName">
            Client name / Nom du client :
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter client name"
            id="clientName"
            aria-describedby="clientName"
            onChange={(e) => {
              setClientName(e.target.value.toUpperCase());
              setShowTable(false);
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="inputPassword5">
            USD Beginning balance / Solde initial USD
          </Form.Label>
          <Form.Control
            type="number"
            min="0"
            defaultValue={0}
            ref={usdBeginningBalanceRef}
            maxLength={10}
            id="inputPassword5"
            aria-describedby="passwordHelpBlock"
            onChange={(e) => {
              setDollarBeginningBalance(e.target.value);
              setShowTable(false);
            }}
            onKeyPress={(event) => {
              if (!/[0-9-.]/.test(event.key)) {
                event.preventDefault();
                alert("You can only enter numbers !");
              }
            }}
            onWheel={(e) => {
              e.target.blur();
            }}
            onClick={(e) => {
              if (e.target.value == 0)
                usdBeginningBalanceRef.current.value = "";
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="inputPassword5">
            EUR Beginning balance / Solde initial EUR
          </Form.Label>
          <Form.Control
            defaultValue={0}
            type="number"
            maxLength={10}
            ref={eurBeginningBalanceRef}
            min="0"
            id="inputPassword5"
            aria-describedby="passwordHelpBlock"
            onChange={(e) => {
              setEuroBeginningBalance(e.target.value);
              setShowTable(false);
            }}
            onKeyPress={(event) => {
              if (!/[0-9-.]/.test(event.key)) {
                event.preventDefault();
                alert("You can only enter numbers !");
              }
            }}
            onWheel={(e) => {
              e.target.blur();
            }}
            onClick={(e) => {
              if (e.target.value == 0)
                eurBeginningBalanceRef.current.value = "";
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="inputPassword5">
            Funds / wire from owner USD (optional)
          </Form.Label>
          <Form.Control
            type="number"
            min="0"
            ref={fundsWireUsdRef}
            defaultValue={0}
            maxLength={10}
            id="inputPassword5"
            aria-describedby="passwordHelpBlock"
            onChange={(e) => {
              setFundsFromOwnerDollar(e.target.value);
              setShowTable(false);
            }}
            onKeyPress={(event) => {
              if (!/[0-9-.]/.test(event.key)) {
                event.preventDefault();
                alert("You can only enter numbers !");
              }
            }}
            onWheel={(e) => {
              e.target.blur();
            }}
            onClick={(e) => {
              if (e.target.value == 0) fundsWireUsdRef.current.value = "";
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="inputPassword5">
            Funds / wire from owner EURO (optional)
          </Form.Label>
          <Form.Control
            type="number"
            min="0"
            ref={fundsWireEurRef}
            defaultValue={0}
            maxLength={10}
            id="inputPassword5"
            aria-describedby="passwordHelpBlock"
            onChange={(e) => {
              setFundsFromOwnerEuro(e.target.value);
              setShowTable(false);
            }}
            onKeyPress={(event) => {
              if (!/[0-9-.]/.test(event.key)) {
                event.preventDefault();
                alert("You can only enter numbers !");
              }
            }}
            onWheel={(e) => {
              e.target.blur();
            }}
            onClick={(e) => {
              if (e.target.value) fundsWireEurRef.current.value = "";
            }}
          />
        </Form.Group>

        <Form.Group className="mb-5">
          <Form.Label>
            Select the <strong>Income USD (payments collected)</strong> file /
            Choisissez le fichier <strong>Recettes USD </strong>
            <br />
            <strong style={{ color: "red" }}>
              ATTENTION : only CSV format accepted
            </strong>
          </Form.Label>

          <Form.Control
            type="file"
            placeholder="Enter email"
            onChange={rentalIncomeChangeHandler}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="inputPassword5">
            Currency Exchange / Cession devises USD (optional)
          </Form.Label>
          <Form.Control
            type="number"
            min="0"
            defaultValue={0}
            ref={usdCurrencyExchangeRef}
            maxLength={10}
            id="inputPassword5"
            aria-describedby="passwordHelpBlock"
            onChange={(e) => {
              setDollarCession(e.target.value);
              setShowTable(false);
            }}
            onKeyPress={(event) => {
              if (!/[0-9-.]/.test(event.key)) {
                event.preventDefault();
                alert("You can only enter numbers !");
              }
            }}
            onWheel={(e) => {
              e.target.blur();
            }}
            onClick={(e) => {
              if (e.target.value == 0)
                usdCurrencyExchangeRef.current.value = "";
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="inputPassword5">
            Currency exchange / Cession devises EURO (optional)
          </Form.Label>
          <Form.Control
            type="number"
            min="0"
            ref={eurCurrencyExchangeRef}
            defaultValue={0}
            maxLength={10}
            id="inputPassword5"
            aria-describedby="passwordHelpBlock"
            onChange={(e) => {
              setEuroCession(e.target.value);
              setShowTable(false);
            }}
            onKeyPress={(event) => {
              if (!/[0-9-.]/.test(event.key)) {
                event.preventDefault();
                alert("You can only enter numbers !");
              }
            }}
            onWheel={(e) => {
              e.target.blur();
            }}
            onClick={(e) => {
              if (e.target.value) eurCurrencyExchangeRef.current.value = "";
            }}
          />
        </Form.Group>

        <div
          key={`inline-radio`}
          className="mb-3"
          onChange={(e) => {
            setCheckedRadioCurrency(e.target.id[e.target.id.length - 1]);
            setShowTable(false);
          }}
        >
          <Form.Label htmlFor="inputCurrencyBought">
            Currency bought / Devise achetée (optional)
          </Form.Label>
          <Form.Check
            inline
            label="€"
            name="group1"
            type="radio"
            id={`inline-radio-1`}
            defaultChecked={true}
            style={{ marginLeft: "1rem" }}
          />
          <Form.Check
            inline
            label="$"
            name="group1"
            type="radio"
            id={`inline-radio-2`}
          />
        </div>

        <Form.Group className="mb-5">
          <Form.Label>
            Select the <strong>Expense USD </strong> file / Choisissez le
            fichier <strong>Dépenses USD </strong>
            <br />
            <strong style={{ color: "red" }}>
              ATTENTION : only CSV format accepted
            </strong>
          </Form.Label>
          <Form.Control
            type="file"
            placeholder="Enter email"
            onChange={dollarChangeHandler}
          />
        </Form.Group>

        <Form.Group className="mb-5">
          <Form.Label>
            Select the <strong>Expense EURO </strong>file / Choisissez le
            fichier <strong>Dépenses EURO</strong>
            <br />
            <strong style={{ color: "red" }}>
              ATTENTION : only CSV format accepted
            </strong>
          </Form.Label>
          <Form.Control
            type="file"
            placeholder="Enter email"
            onChange={euroChangeHandler}
          />
        </Form.Group>

        <div
          key={`inline-radio-report-period`}
          className="mb-2"
          onChange={(e) => {
            setCheckedRadioReportPeriod(e.target.id[e.target.id.length - 1]);
            setShowTable(false);
          }}
        >
          <Form.Label htmlFor="inputReportPeriod">Report</Form.Label>
          <Form.Check
            inline
            label="Monthly / Mensuel"
            name="report-period"
            type="radio"
            id={`report-period-1`}
            defaultChecked={true}
            style={{ marginLeft: "1rem" }}
          />
          <Form.Check
            inline
            label="Annually / Annuel"
            name="report-period"
            type="radio"
            id={`report-period-2`}
          />
        </div>

        <Button
          variant="primary"
          type="submit"
          onClick={() => generateCustomReport()}
          style={{ marginBottom: "1rem" }}
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
            filename={`TPI-export-${clientName}`}
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
              <tr style={styles}>
                <th>HOME OWNER STATEMENT</th>
              </tr>
              {clientName && (
                <tr style={styles}>
                  <th>{clientName}</th>
                </tr>
              )}
              {!clientName && (
                <tr style={styles}>
                  <th>{"NO NAME FOR CLIENT"}</th>
                </tr>
              )}

              <tr style={styles}>
                <th>DATE</th>
                <th>DESCRIPTION</th>
                <th>INCOME USD / RECETTES USD</th>
                <th>EXPENSE USD / DEPENSES USD</th>
                <th style={{ borderRight: "10px solid blue" }}>
                  BALANCE USD / SOLDE USD
                </th>
                <th>INCOME EURO / RECETTES EURO</th>
                <th>EXPENSE EURO / DEPENSES EURO</th>
                <th>BALANCE EURO / SOLDE EURO</th>
              </tr>
            </thead>
            <tbody>
              {/* Beginning Balance */}
              <tr style={styles}>
                <td></td>
                <td style={{ textAlign: "left" }}>
                  <strong>BEGINNING BALANCE / SOLDE INITIAL</strong>
                </td>
                <td>
                  {dollarBeginningBalance >= 0 && (
                    <strong>
                      <div>
                        <span>{parseAmount(dollarBeginningBalance)}</span>
                      </div>
                    </strong>
                  )}
                  {dollarBeginningBalance < 0 && (
                    <strong>
                      <div>
                        <span>0,00</span>
                      </div>
                    </strong>
                  )}
                </td>
                <td>
                  {dollarBeginningBalance < 0 && (
                    <strong>
                      <div>
                        <span>
                          {parseAmount(Math.abs(dollarBeginningBalance))}
                        </span>
                      </div>
                    </strong>
                  )}
                  {dollarBeginningBalance >= 0 && <>0,00</>}
                </td>
                <td style={{ borderRight: "solid 10px blue" }}>
                  0,00
                </td>
                <td>
                  {euroBeginningBalance >= 0 && (
                    <strong>
                      <div>
                          <span>{parseAmount(euroBeginningBalance)}</span>
                      </div>
                    </strong>
                  )}
                  {euroBeginningBalance < 0 && (
                    <strong>
                      <div>
                          <span>0,00</span>
                      </div>
                    </strong>
                  )}
                </td>
                <td>
                  {euroBeginningBalance < 0 && (
                    <strong>
                      <div>
                          <span>
                          {parseAmount(Math.abs(euroBeginningBalance))}
                        </span>
                      </div>
                    </strong>
                  )}
                  {euroBeginningBalance >= 0 && <>0,00</>}
                </td>
                <td>0,00</td>
              </tr>

              {/* Funds from owner */}
              <tr style={styles}>
                <td></td>
                <td style={{ textAlign: "left" }}>
                  {" "}
                  <strong>FUNDS / WIRE FROM OWNER </strong>
                </td>
                <td>
                  <strong>
                    <div>
                      <span>{parseAmount(fundsFromOwnerDollar)}</span>
                    </div>
                  </strong>{" "}
                </td>
                <td>0,00</td>
                <td style={{ borderRight: "solid 10px blue" }}>0,00</td>
                <td>
                  <strong>
                    <div>
                      <span>{parseAmount(fundsFromOwnerEuro)}</span>
                    </div>
                  </strong>
                </td>
                <td>0,00</td>
                <td>0,00</td>
              </tr>
              {/* Cession de devises */}
              {(dollarCession || euroCession) && (
                <tr style={styles}>
                  <td> </td>
                  <td style={{ textAlign: "left" }}>
                    <strong>CURRENCY EXCHANGE / CESSION DE DEVISES</strong>
                  </td>
                  {dollarCession && checkedRadioCurrency == 1 && (
                    <>
                      <td> </td>
                      <td>
                        <strong>
                          <div>
                            <span>{parseAmount(dollarCession)}</span>
                          </div>
                        </strong>
                      </td>
                      <td style={{ borderRight: "solid 10px blue" }}> </td>
                    </>
                  )}
                  {dollarCession && checkedRadioCurrency == 2 && (
                    <>
                      <td>
                        <strong>
                          <div>
                            <span>{parseAmount(dollarCession)}</span>
                          </div>
                        </strong>
                      </td>
                      <td> </td>
                      <td style={{ borderRight: "solid 10px blue" }}> </td>
                    </>
                  )}
                  {!dollarCession && (
                    <>
                      <td> </td>
                      <td> </td>
                      <td style={{ borderRight: "solid 10px blue" }}> </td>
                    </>
                  )}
                  {/* ----- */}
                  {euroCession && checkedRadioCurrency == 1 && (
                    <>
                      <td>
                        <strong>
                          <div>
                            <span>{parseAmount(euroCession)}</span>
                          </div>
                        </strong>
                      </td>
                      <td> </td>
                      <td style={{ borderRight: "solid 10px blue" }}> </td>
                    </>
                  )}
                  {euroCession && checkedRadioCurrency == 2 && (
                    <>
                      <td> </td>
                      <td>
                        <strong>
                          <div>
                            <span>{parseAmount(euroCession)}</span>
                          </div>
                        </strong>
                      </td>
                      <td> </td>
                    </>
                  )}
                  {!euroCession && (
                    <>
                      <td> </td>
                      <td> </td>
                      <td> </td>
                    </>
                  )}
                </tr>
              )}
              {/* Rental Income */}
              <tr style={styles}>
                <td></td>
                <td style={{ textAlign: "left" }}>
                  {" "}
                  <strong>
                    RENTAL INCOME
                    {checkedRadioReportPeriod == 1 && <> (MONTH)</>}
                    {checkedRadioReportPeriod == 2 && <> (YEAR)</>}
                  </strong>
                </td>
                <td></td>
                <td></td>
                <td style={{ borderRight: "solid 10px blue" }}></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              {rentalIncomeArray.map((value, index) => {
                return (
                  <>
                    <tr key={index} style={styles}>
                      <td style={{ textAlign: "left" }}>
                        {parseDateArray(value.Date)}
                      </td>
                      <td style={{ textAlign: "left" }}>
                        <strong>{value["Client Name"]}</strong>
                      </td>
                      <td>
                        <div>
                          <span>{parseAmount(value.Amount)}</span>
                        </div>
                      </td>
                      <td>0,00</td>
                      <td style={{ borderRight: "solid 10px blue" }}>0,00</td>
                      <td>0,00</td>
                      <td>0,00</td>
                      <td>0,00</td>
                    </tr>
                    {/* si le client a Wholesaler Commission attribué */}
                    {value["Wholesaler Commission"] && (
                      <tr style={styles}>
                        <td> </td>
                        <td style={{ textAlign: "center" }}>
                          <strong>WHOLESALER COMMISSION</strong>
                        </td>
                        <td>0,00</td>
                        <td>
                          <div>
                            <span>
                              {parseAmount(value["Wholesaler Commission"])}
                            </span>
                          </div>
                        </td>
                        <td style={{ borderRight: "solid 10px blue" }}>0,00</td>
                        <td>0,00</td>
                        <td>0,00</td>
                        <td>0,00</td>
                      </tr>
                    )}
                    {/* si le client a TPI Commission attribué */}
                    {value["TPI Commission"] && (
                      <tr style={styles}>
                        <td> </td>
                        <td style={{ textAlign: "center" }}>
                          <strong>TPI COMMISSION</strong>
                        </td>
                        <td>0,00</td>
                        <td>
                          <div>
                            <span>{parseAmount(value["TPI Commission"])}</span>
                          </div>
                        </td>
                        <td style={{ borderRight: "solid 10px blue" }}>0,00</td>
                        <td>0,00</td>
                        <td>0,00</td>
                        <td>0,00</td>
                      </tr>
                    )}
                  </>
                );
              })}

              {values.length > 0 && (
                <tr style={styles}>
                  <td> </td>
                  <td style={{ textAlign: "left" }}>
                    <strong>
                      {values[0]["Parent Category"].toUpperCase()}
                    </strong>
                  </td>
                  <td></td>
                  <td></td>
                  <td style={{ borderRight: "solid 10px blue" }}></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              )}
              {values.map((value, index) => {
                return (
                  <>
                    {index >= 1 &&
                      value["Parent Category"].localeCompare(
                        values[index - 1]["Parent Category"]
                      ) != 0 && (
                        <tr style={styles}>
                          <td> </td>
                          <td style={{ textAlign: "left" }}>
                            <strong>
                              {value["Parent Category"].toUpperCase()}
                            </strong>
                          </td>
                          <td> </td>
                          <td> </td>
                          <td style={{ borderRight: "solid 10px blue" }}> </td>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                        </tr>
                      )}

                    {value.Currency == "EUR" && (
                      <tr key={index} style={styles}>
                        <td style={{ textAlign: "left" }}>
                          {parseDateArray(value.Date)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {value.Merchant}
                        </td>
                        <td>0,00</td>
                        <td>0,00</td>
                        <td style={{ borderRight: "solid 10px blue" }}>0,00</td>
                        <td>0,00</td>
                        <td>
                          <div>
                            <span>{parseAmount(value.Amount)}</span>
                          </div>
                        </td>
                        <td>0,00</td>
                      </tr>
                    )}
                    {value.Currency == "USD" && (
                      <tr key={index} style={styles}>
                        <td style={{ textAlign: "left" }}>
                          {parseDateArray(value.Date)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {value.Merchant}
                        </td>
                        <td>0,00</td>
                        <td>
                          <div>
                            <span>{parseAmount(value.Amount)}</span>
                          </div>
                        </td>
                        <td style={{ borderRight: "solid 10px blue" }}>0,00</td>
                        <td>0,00</td>
                        <td>0,00</td>
                        <td>0,00</td>
                      </tr>
                    )}
                  </>
                );
              })}
              <tr style={styles}>
                <td></td>
                <td>
                  <strong>
                    <span
                      style={{
                        float: "left",
                        marginLeft: 0,
                        textAlign: "left",
                      }}
                    >
                      ENDING BALANCE / SOLDE DE CLOTURE
                    </span>
                  </strong>
                </td>
                {endingDollarRentalIncome && (
                  <td>
                    <strong>
                      <div>
                        <span>{parseAmount(endingDollarRentalIncome)}</span>
                      </div>
                    </strong>
                  </td>
                )}
                {!endingDollarRentalIncome && <td>0,00</td>}
                {dollarExpensesEndingBalance && (
                  <td>
                    <strong>
                      <div>
                        <span>{parseAmount(dollarExpensesEndingBalance)}</span>
                      </div>
                    </strong>
                  </td>
                )}
                {!dollarExpensesEndingBalance && <td>0,00</td>}
                <td style={{ borderRight: "solid 10px blue" }}>
                  <strong>
                    <div>
                      <span>{parseAmount(dollarEndingBalance)}</span>
                    </div>
                  </strong>
                </td>

                {euroExpensesEndingBalance && checkedRadioCurrency == 1 && (
                  <>
                    <td>
                      <strong>
                        <div>
                          <span>{parseAmount(endingEuroRentalIncome)}</span>
                        </div>
                      </strong>
                    </td>
                    <td>
                      <strong>
                        <div>
                          <span>{parseAmount(euroExpensesEndingBalance)}</span>
                        </div>
                      </strong>
                    </td>
                  </>
                )}
                {!euroExpensesEndingBalance && <td>0,00</td>}

                {euroExpensesEndingBalance && checkedRadioCurrency == 2 && (
                  <>
                    <td>
                      {endingEuroRentalIncome && (
                        <strong>
                          <div>
                            <span>{parseAmount(endingEuroRentalIncome)}</span>
                          </div>
                        </strong>
                      )}
                      {!endingEuroRentalIncome && <></>}
                    </td>
                    <td>
                      <strong>
                        <div>
                          <span>{parseAmount(euroExpensesEndingBalance)}</span>
                        </div>
                      </strong>
                    </td>
                  </>
                )}
                {!euroExpensesEndingBalance && <td>0,00</td>}
                <td>
                  <strong>
                    <div>
                      <span>{parseAmount(euroEndingBalance)}</span>
                    </div>
                  </strong>
                </td>
              </tr>
              <tr style={styles}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td style={{ borderRight: "solid 10px blue" }}></td>
                <td></td>
                <td>ACCOUNT MANAGED BY</td>
                <td>LINE ROGERS</td>
              </tr>
              <tr style={styles}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td style={{ borderRight: "solid 10px blue" }}></td>
                <td></td>
                <td>REPORT GENERATED ON</td>
                <td>{parseDate(today)}</td>
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
