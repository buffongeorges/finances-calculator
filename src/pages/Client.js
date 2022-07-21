import React from "react";
import { Button, Row, Col, Group } from "react-bootstrap";
import Form from "react-bootstrap/Form";

import { useNavigate } from "react-router-dom";
import { Formik, Form as Formm } from "formik";
import * as Yup from "yup";

function Client() {
  let navigate = useNavigate();
  return (
    <div
      className="container"
      style={{
        paddingTop: "1rem",
        paddingLeft: "0.5rem",
      }}
    >
      <h1>New Client</h1>
      <Formik
        initialValues={
          {
            // email: userEmail,
            // password: "",
          }
        }
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Invalid email address")
            .required("Required"),
          password: Yup.string()
            .min(8, "Password is too short")
            .max(30, "Password is too long")
            .required("Required"),
        })}
        onSubmit={(values, { setSubmitting, setFieldError }) => {
          console.log(values);
        }}
      >
        {() => (
          <Formm>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Society</Form.Label>
              <Form.Control type="email" placeholder="Enter email" />
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Type</Form.Label>
              <Form.Control type="text" placeholder="Password" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Type</Form.Label>
              <Form.Control type="date" placeholder="Password" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Nom Fournisseur</Form.Label>
              <Form.Control type="text" placeholder="Password" />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Type</Form.Label>
              <Form.Control type="date" placeholder="Password" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check type="checkbox" label="Check me out" />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Formm>
        )}
      </Formik>
      <div>You have no client</div>
    </div>
  );
}

export default Client;
