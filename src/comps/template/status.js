import { Button, Stack } from "@mui/material";
import { Badge, Container, Image } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function StatusPage() {
  return (
    <Container
      style={{
        backgroundColor: "black",
        color: "white",
        height: "100vh",
        padding: "12vh 2vh 12vh 2vh",
      }}
    >
      <Stack className="text-center" style={{ margin: "0 15%" }}>
        <img
          src="assets/pending.png"
          style={{ width: "70%", margin: "0 15%" }}
        />
        <h2 className="display-5">Account Pending verification.</h2>
        <p className="lead">
          Check email in 48 hours for <Badge> Approval </Badge>.
        </p>
      
        <Link to="/login" variant="body2" style={{color: "white", textDecoration: "none", borderRadius: "10px", backgroundColor: "rgb(10,30,10)", padding: "5px" }}>
          Return to Sign in page
        </Link>
      </Stack>
    </Container>
  );
}
