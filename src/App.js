import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
// User Interface
import firebase from "./firebase";
import { Container, Row, Spinner, Col } from "react-bootstrap";
import Typography from "@mui/material/Typography";
import LoginRoutes from "./loginRoutes";
import { BrowserRouter as Router } from "react-router-dom";
import Routers from "./routes";
import { ThemeProvider } from "./comps/template/themeContext";
import Loading from "./comps/assets/Loading2.gif";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <ThemeProvider>
        <Container style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
          <img src={Loading} width={"100%"} />
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>{isLoggedIn ? <LoginRoutes /> : <Routers />}</Router>
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
