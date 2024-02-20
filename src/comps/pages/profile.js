import React, { useEffect, useState } from "react";
import { Card, Stack, Image, Button, Container, Form, Col, Row } from "react-bootstrap";
import firebase from "./../../firebase";
import { useNavigate } from "react-router-dom";
import EmailButton from "./sendHelpEmail";
import { useTheme } from "../template/themeContext";

const Profile = ({ title, date, postedBy, imageUrl }) => {

  const navigate = useNavigate();

  const Logout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        navigate("/", { replace: true });
        window.location.reload(false);
      });
  };

  const [user_, setdocs] = useState([]);
  useEffect(() => {
    firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((doc) => {
        setdocs(doc.data());
      });
  }, []);

  const { theme, toggleTheme } = useTheme();
  return (
    <Container
      style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
        padding: "12vh 2vh 12vh 2vh",
      }}
    >
      <Stack direction="horizontal" gap={5}>
        <h2>Profile</h2>
        <Button
        variant="contained"
        onClick={toggleTheme}
        className="p-2 ms-auto"
        size="small"
        style={{ backgroundColor: theme === "light" ? "black" : "white",
        color: theme === "light" ? "white" : "black", }}
      >
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </Button>
        <Button onClick={() => Logout()} className="p-2 ms-auto" variant="dark">
          Logout
        </Button>
      </Stack>
<br/>
      <Stack
        style={{
          position: "relative",
          width: "30vh",
          height: "30vh",
          borderRadius: "50%",
          overflow: "hidden",
          margin: "0 auto",
        }}
      >
        <Image
          src={user_ && user_.photoURL}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
        <br/>
      </Stack>
   
<br/>
      <Form>
      <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridFirstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control type="text" placeholder="John" value={user_.firstName} />
        </Form.Group>

        <Form.Group as={Col} controlId="formGridLastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control type="Text" placeholder="Doe" value={user_.lastName} />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="Enter employee number" value={user_.email} />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridEmployeeNumber">
          <Form.Label>Employee Number</Form.Label>
          <Form.Control type="number" placeholder="Enter employee number" value={user_.employeeNumber} />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridMinistry">
          <Form.Label>Ministry</Form.Label>
          <Form.Control type="text" placeholder="Enter Ministry" value={user_.ministry} />
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="formGridAddress1">
        <Form.Label>Address</Form.Label>
        <Form.Control placeholder="1234 Main St" value={user_.address} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formGridContact">
        <Form.Label>Phone Number</Form.Label>
        <Form.Control type="number" placeholder="0976758366" value={user_.contact} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formGridPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="1234MainSt" value={user_.password} />
      </Form.Group>
      
    </Form>
    {/* <p>Please kindly reach out to the administrator to request any changes or updates to your details.</p>
    <Button>
      Send Email
    </Button> */}
    <EmailButton/> 
    </Container>
  );
};
export default Profile;
