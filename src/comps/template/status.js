import { Button, Input, Stack } from "@mui/material";
import { useState } from "react";
import { Badge, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import firebase from "./../../firebase";

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function resendVerificationEmail(email) {
    // Check if email is provided and has a valid structure
    if (!email) {
      setMessage("Please enter your email.");
      console.log("Please enter your email")
      return;
    }
  
    if (!isValidEmail(email)) {
      setMessage("Please enter a valid email address.");
      console.log("Please enter a valid email address.")
      return;
    }
  
    // Check if the email exists in Firestore
    firebase.firestore().collection("Users").where("email", "==", email).get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          // Email not found in Firestore
          setMessage("Email not found. Please sign up first.");
          console.log("Email not found. Please sign up first.")
          return;
        }
  
        // Resend verification email
        firebase.auth().currentUser.sendEmailVerification()
          .then(() => {
            setMessage("Verification email sent. Please check your inbox.");
          })
          .catch((error) => {
            console.error("Error resending verification email:", error);
            setMessage("Error resending verification email. Please try again later.");
          });
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setMessage("Error checking email. Please try again later.");
      });
  }
  
  // Function to validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  return (
    <Container
      style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
        padding: "2vh 2vh 12vh 2vh",
      }}
    >
      <Stack className="text-center" style={{ margin: "0 10%" }}>
        {/* <div>
          <p className="lead">Please check your email for a verification link to complete the registration process. Thank you!</p>
          <p>If you haven't received the verification email yet, please enter your email below to resend it. Thank you!</p>
          <Input
            variant="filled"
            style={{backgroundColor: "grey", borderRadius: "6px", marginBottom: "3px", color:"white"}}
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button onClick={resendVerificationEmail} variant="contained" style={{backgroundColor: "rgb(10,30,10)"}}>
            Resend Verification Email
          </Button>
          <div>{message}</div>
        </div> */}
        <img
          src="assets/pending.png"
          style={{ width: "60%", margin: "0 20%" }}
        />
        <h2 className="display-5">Account Pending verification.</h2>
        <p className="lead">
          Check email in 48 hours for <Badge> Approval </Badge>.
        </p>

        <Link
          to="/login"
          variant="body2"
          style={{
            color: "white",
            textDecoration: "none",
            borderRadius: "10px",
            backgroundColor: "rgb(10,30,10)",
            padding: "5px",
          }}
        >
          Return to Sign in page
        </Link>
      </Stack>
    </Container>
  );
}
