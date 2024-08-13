import React, { useState } from "react";
import { Navigate } from "react-router-dom";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import firebase from "./../../firebase";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://appsetstudio.com//">
        AppsetStudios
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const defaultTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function LoginForm() {
  const [loggedin, setLoggedin] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      // Sign in user with email and password
      await firebase
        .auth()
        .signInWithEmailAndPassword(data.get("email"), data.get("password"));

      // Get the currently signed-in user
      const currentUser = firebase.auth().currentUser;

      // Retrieve user document from Firestore
      const userDoc = await firebase
        .firestore()
        .collection("Users")
        .doc(currentUser.uid)
        .get();

      // Check user role
      const userRole = userDoc.data().role;
      const userStatus = userDoc.data().status;
      // console.log("Successfully taken role : " + userRole);
      // Check if the user is a reporter
      if (
        (userRole === "reporter" || userRole === "admin") &&
        userStatus === "Approved"
      ) {
        console.log("Successfully logged in!");
        setLoggedin(true);
        return <Navigate to="/home" />;
      } else {
        // User is not a reporter, so sign them out and display an error
        await firebase.auth().signOut();
        console.log("Only reporters are allowed to log in.");
        setError("Only reporters are allowed to log in.");
      }
    } catch (error) {
      console.error("Error logging in: ", error);
      setError("Invalid email or password.");
    }
  };

  if (loggedin) {
    return <Navigate to="/home" />; // navigate to dashboard
  }

  return (
    <>
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              {error && (
                <Typography
                  variant="body2"
                  color="error"
                  style={{
                    backgroundColor: "darkred",
                    fontSize: "14px",
                    color: "white",
                    borderRadius: "5px",
                    padding: "6px",
                  }}
                  align="center"
                >
                  {error}
                </Typography>
              )}
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="/resetPassword" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="/register" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
      </ThemeProvider>
    </>
  );
}
