import React, { useEffect, useState } from "react";
import { Stack, Image, Container, Form, Col, Row } from "react-bootstrap";
import firebase from "./../../firebase";
import { useNavigate } from "react-router-dom";
import EmailButton from "./sendHelpEmail";
import useGetMinistries from "../hooks/useGetMinistries";
import { useTheme } from "../template/themeContext";
import { FormControl, LinearProgress, Button } from "@mui/material";
import { Alarm } from "@mui/icons-material";

const Profile = () => {
  const navigate = useNavigate();
  const [userpic, setUserPic] = useState(null);
  // const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const Logout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        navigate("/", { replace: true });
        window.location.reload(false);
      });
  };

  const [user_, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    employeeNumber: "",
    ministry: "",
    address: "",
    contact: "",
    // password: "",
  });

  useEffect(() => {
    const unsubscribeAuth = firebase
      .auth()
      .onAuthStateChanged((currentUser) => {
        if (currentUser) {
          const userDocRef = firebase
            .firestore()
            .collection("Users")
            .doc(currentUser.uid);
          const unsubscribeSnapshot = userDocRef.onSnapshot((doc) => {
            if (doc.exists) {
              const userData = doc.data();
              setUser(userData);
              // setUserPic(userData?.photoURL);
              // setFormData({
              //   name: userData.name || "",
              //   email: userData.email || "",
              //   age: userData.age || "",
              //   nrc: userData.nrc || "",
              // });
            } else {
              console.error("User document does not exist");
            }
          });
          return () => unsubscribeSnapshot();
        } else {
          console.log("No authenticated user found");
          setUser(null);
        }
      });
    return () => unsubscribeAuth();
  }, []);

  console.log("User is : ", user_);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      // Remove empty fields from the user object
      const filteredUserData = Object.fromEntries(
        Object.entries(user_).filter(
          ([_, value]) => value !== "" && value !== undefined
        )
      );

      if (Object.keys(filteredUserData).length === 0) {
        alert("No valid data to update.");
        setSubmitting(false);
        return;
      }

      await firebase
        .firestore()
        .collection("Users")
        .doc(firebase.auth().currentUser.uid)
        .update(filteredUserData);

      console.log("User data updated successfully!");
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Error updating profile data");
    } finally {
      setSubmitting(false);
    }
  };
  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(`profile_pictures/${file.name}`);

    const uploadTask = fileRef.put(file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Calculate upload progress
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Error uploading profile picture:", error);
        // Handle error
      },
      () => {
        // Upload completed successfully, get download URL
        uploadTask.snapshot.ref.getDownloadURL().then((url) => {
          setUserPic(url); // Set the URL of the uploaded image
          setUploading(false);
        });
      }
    );
    setUploading(true);
  };

  const updateProfilePicture = () => {
    const currentUser = firebase.auth().currentUser;
    const userId = currentUser.uid;

    firebase
      .firestore()
      .collection("Users")
      .doc(userId)
      .update({
        photoURL: userpic, // Save the URL of the uploaded image in the "photoURL" field of the user document
      })
      .then(() => {
        console.log("Profile picture updated successfully");
        // Optionally, you can reload the page or update the user's profile picture state
      })
      .catch((error) => {
        console.error("Error updating profile picture:", error);
        // Handle error
      });
  };

  const removeProfilePicture = () => {
    const currentUser = firebase.auth().currentUser;
    const userId = currentUser.uid;

    firebase
      .firestore()
      .collection("Users")
      .doc(userId)
      .update({
        photoURL: firebase.firestore.FieldValue.delete(), // Remove the "photoURL" field from the user document
      })
      .then(() => {
        console.log("Profile picture removed successfully");
        setUserPic(""); // Clear the URL of the profile picture from the state
      })
      .catch((error) => {
        console.error("Error removing profile picture:", error);
        // Handle error
      });
  };
  const Ministries = useGetMinistries().docs;

  const { theme, toggleTheme } = useTheme();
  return (
    <Container
      style={{
        backgroundColor: theme === "light" ? "white" : "black",
        color: theme === "light" ? "black" : "white",
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
          style={{
            backgroundColor: theme === "light" ? "black" : "white",
            color: theme === "light" ? "white" : "black",
          }}
        >
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </Button>
        <Button onClick={() => Logout()} className="p-2 ms-auto" variant="dark">
          Logout
        </Button>
      </Stack>
      <br />
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
        <label
          htmlFor="profilePictureInput"
          style={{
            position: "absolute",
            top: "15px",
            right: "30px",
            cursor: "pointer",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "60%",
            padding: "5px",
          }}
        >
          <i className="bi bi-pencil-fill"></i>
        </label>
        <input
          id="profilePictureInput"
          type="file"
          onChange={handleProfilePictureChange}
          accept="image/*"
          style={{ display: "none" }}
        />

        <Button
          size="sm"
          fullWidth
          variant="contained"
          onClick={updateProfilePicture}
          style={{
            fontSize: "10px",
            position: "absolute",
            bottom: "35px",
            backgroundColor: "rgba(0,0,0,0.8)",
          }}
        >
          Update Picture
        </Button>
        <Button
          size="sm"
          fullWidth
          variant="contained"
          onClick={removeProfilePicture}
          style={{
            fontSize: "10px",
            position: "absolute",
            bottom: "5px",
            backgroundColor: "rgba(0,0,0,0.8)",
          }}
        >
          Remove Picture
        </Button>
        <br />
      </Stack>
      {uploading && (
        <LinearProgress variant="determinate" value={uploadProgress} />
      )}
      <p className="text-center">
        {user_ && user_.firstName} {user_ && user_.lastName} <br />{" "}
        {user_ && user_.email}
      </p>

      <br />
      <Form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: theme === "light" ? "white" : "black",
          color: theme === "light" ? "black" : "white",
        }}
      >
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formGridFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              onChange={handleInputChange}
              name="firstName"
              type="text"
              placeholder="John"
              value={user_.firstName}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="formGridLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              onChange={handleInputChange}
              name="lastName"
              type="Text"
              placeholder="Doe"
              value={user_.lastName}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} controlId="formGridEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              onChange={handleInputChange}
              name="email"
              type="email"
              placeholder="Enter employee number"
              value={user_.email}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} controlId="formGridEmployeeNumber">
            <Form.Label>Employee Number</Form.Label>
            <Form.Control
              onChange={handleInputChange}
              name="employeeNumber"
              type="number"
              placeholder="Enter employee number"
              value={user_.employeeNumber}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} controlId="formGridMinistry">
            <Form.Label>Ministry</Form.Label>
            <Form.Select
              required
              name="ministry"
              value={user_.ministry} // Ensure it's controlled
              onChange={handleInputChange}
            >
              <option value="">
                <em>None</em>
              </option>
              {Ministries.map((ministry) => (
                <option key={ministry.name} value={ministry.name}>
                  {ministry.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Row>

        <Form.Group className="mb-3" controlId="formGridAddress1">
          <Form.Label>Address</Form.Label>
          <Form.Control
            onChange={handleInputChange}
            name="address"
            placeholder="1234 Main St"
            value={user_.address}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formGridContact">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            onChange={handleInputChange}
            type="number"
            name="contact"
            placeholder="0976758366"
            value={user_.contact}
          />
        </Form.Group>

        {/* <Form.Group className="mb-3" controlId="formGridPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            onChange={handleInputChange}
            type="password"
            name="password"
            placeholder="1234MainSt"
            value={user_.password}
          />
        </Form.Group> */}
        <Button
          variant="contained"
          disabled={submitting}
          fullWidth
          type="submit"
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </Form>

      <EmailButton />
    </Container>
  );
};
export default Profile;
