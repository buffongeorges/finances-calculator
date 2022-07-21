import React from "react";
import { Button, Row, Col } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

function Clients() {
    let navigate = useNavigate();

    const createNewClient = () => {
        navigate('/new-client')
    }
  return (
    <div
      className="container"
      style={{
        paddingTop: "1rem",
        paddingLeft: "0.5rem",
      }}
    >
      <h1>Clients</h1>
      <Row>
        <Col xs="9" md="9" lg="9">
          <p style={{ fontSize: "1.3rem" }}>Liste des clients</p>
        </Col>
        <Col xs="3" md="3" lg="3">
          <Button
            style={{
              backgroundColor: "#39A901",
              borderColor: "#39A901",
            }}
            onClick={() => { createNewClient()}}
          >
            New Client
          </Button>
        </Col>
      </Row>
      <div>You have no client</div>
    </div>
  );
}

export default Clients;
