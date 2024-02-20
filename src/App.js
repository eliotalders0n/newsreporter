import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
// User Interface
import firebase from "./firebase";
import { Container, Row, Spinner, Col } from "react-bootstrap";
import Typography from "@mui/material/Typography";
import LoginRoutes from "./loginRoutes";
import Routers from "./routes";
import { ThemeProvider } from "./comps/template/themeContext";

const App = () => {
  const [state, setstate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true); // Set isLoading to true when the component mounts

    const authStateChanged = (user) => {
      if (user) {
        setstate(true);
        setIsLoading(false); // Set isLoading to false when the user state changes
      } else {
        setError("Only reporters are allowed to log in.");
        setstate(false);
        setIsLoading(false); // Set isLoading to false when the user state changes
      }
    };

    const unsubscribe = firebase.auth().onAuthStateChanged(authStateChanged);

    // Clean up the subscription when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider>
      {error && (
        <Typography
          variant="body2"
          color="error"
          style={{
            backgroundColor: "rgb(0,70,0)",
            fontSize: "14px",
            color: "lightgrey",
            padding: "6px",
          }}
          align="center"
        >
          {error}
        </Typography>
      )}
      {!state && <LoginRoutes />}
      {state && <Routers />}
      {isLoading && (
        <Container>
          <Row className="justify-content-center align-items-center ">
            {" "}
            {/* vh-100 ensures full height */}
            <Col md={12} xs={12} className="text-center">
              <div className="loading-overlay">
                <Spinner animation="grow" role="status" variant="dark">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </ThemeProvider>
  );
};

export default App;
