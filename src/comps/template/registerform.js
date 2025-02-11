import React, { useState } from "react";
import * as Yup from "yup";
import { useFormik, Form, FormikProvider } from "formik";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Button, LinearProgress, MenuItem, Stack } from "@mui/material";
import firebase from "./../../firebase";
import { useNavigate } from "react-router-dom";
import useGetMinistries from "../hooks/useGetMinistries";
import { Image } from "react-bootstrap";

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

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function RegisterForm() {
  const [submitting, setSubmitting] = useState(false);
  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("First name required"),
    lastName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Last name required"),
    ministry: Yup.string()
      .max(75, "Too Long!")
      .required("Ministry is required"),
    address: Yup.string().max(75, "Too Long!").required("Address is required"),
    age: Yup.string().max(2, "Too Long!").required("Age is required"),
    gender: Yup.string().max(8, "Too Long!").required("Gender is required"),
    role: Yup.string().max(12, "Too Long!").required("Role is required"),
    contact: Yup.string().max(12, "Too Long!").required("Contact is required"),
    employeeNumber: Yup.string()
      .max(12, "Too Long!")
      .required("Employee Number is required"),
    email: Yup.string()
      .email("Email must be a valid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: "",
      contact: "",
      employeeNumber: "",
      ministry: "",
      role: "",
      address: "",
      gender: "",
      password: "",
    },
    validationSchema: RegisterSchema,
  });

  const navigate = useNavigate();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  // const [showModal, setShowModal] = useState(false);
  const [userpic, setUserPic] = useState(null);

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

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userEmail = data.get("email");
    if (userEmail.endsWith("@mim.gov.zm")) {
      console.log("User verified, continue to create account:", userEmail);
      firebase
        .auth()
        .createUserWithEmailAndPassword(data.get("email"), data.get("password"))
        .then((userCredential) => {
          var user = userCredential.user;
          user
            .sendEmailVerification()
            .then(() => {
              console.log("Verification email sent");
              firebase
                .firestore()
                .collection("Users")
                .doc(user.uid)
                .set({
                  firstName: data.get("firstName"),
                  lastName: data.get("lastName"),
                  email: data.get("email"),
                  ministry: data.get("ministry"),
                  role: "reporter",
                  photoURL: userpic,
                  age: data.get("age"),
                  contact: data.get("contact"),
                  employeeNumber: data.get("employeeNumber"),
                  gender: data.get("gender"),
                  address: data.get("address"),
                  status: "Pending",
                  admin: false,
                })
                .then(() => {
                  setSubmitting(false);
                  firebase.auth().signOut();
                  navigate("/statuspage");
                  console.log("added to database");
                })
                .catch((e) => console.log(e));
            })
            .catch((error) => {
              console.error("Error sending verification email:", error);
            });
        })
        .catch((error) => {
          var errorMessage = error.message;
          alert(
            "Error sending verification email, " +
              errorMessage +
              " Please check your email for verification and wait for your account to be approved"
          );
        });
    } else {
      console.error(
        "Only users with email ending in '@mim.gov.zm' are allowed to register."
      );
      alert("Only users with government emails are allowed to register.");
    }
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

  const { errors, touched, getFieldProps } = formik;

  const Ministries = useGetMinistries().docs;

  return (
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
            Sign up
          </Typography>
          <Box sx={{ mt: 3 }}>
            <FormikProvider value={formik}>
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
                  src={userpic}
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
                  <i class="bi bi-pencil-fill"></i>
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
                  onClick={removeProfilePicture}
                  style={{
                    fontSize: "10px",
                    position: "absolute",
                    bottom: "5px",
                    color: "white",
                    backgroundColor: "rgba(0,0,0,0.8)",
                  }}
                >
                  Remove Picture
                </Button>
              </Stack>
              <br />
              {uploading && (
                <LinearProgress variant="determinate" value={uploadProgress} />
              )}
              <br />
              <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      autoComplete="given-name"
                      name="firstName"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                      {...getFieldProps("firstName")}
                      error={Boolean(touched.firstName && errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                      {...getFieldProps("lastName")}
                      error={Boolean(touched.lastName && errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="age"
                      type="number"
                      label="Age"
                      name="Age"
                      autoComplete="age"
                      {...getFieldProps("age")}
                      error={Boolean(touched.age && errors.age)}
                      helperText={touched.age && errors.age}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      id="gender"
                      required
                      label="Select Gender"
                      {...getFieldProps("gender")}
                      error={Boolean(touched.gender && errors.gender)}
                      helperText={touched.gender && errors.gender}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="contact"
                      type="number"
                      label="Contact Number"
                      name="contact"
                      autoComplete="phone"
                      {...getFieldProps("contact")}
                      error={Boolean(touched.contact && errors.contact)}
                      helperText={touched.contact && errors.contact}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="address"
                      label="Location"
                      name="address"
                      autoComplete="address"
                      {...getFieldProps("address")}
                      error={Boolean(touched.address && errors.address)}
                      helperText={touched.address && errors.address}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      required
                      fullWidth
                      id="employeeNumber"
                      type="number"
                      label="Employee Number"
                      name="employee number"
                      autoComplete="employee number"
                      {...getFieldProps("employeeNumber")}
                      error={Boolean(
                        touched.employeeNumber && errors.employeeNumber
                      )}
                      helperText={
                        touched.employeeNumber && errors.employeeNumber
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      required
                      label="Select Ministry"
                      {...getFieldProps("ministry")}
                      error={Boolean(touched.ministry && errors.ministry)}
                      helperText={touched.ministry && errors.ministry}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {Ministries.map((ministry) => (
                        <MenuItem value={ministry.name}>
                          {ministry.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      {...getFieldProps("email")}
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      {...getFieldProps("password")}
                      error={Boolean(touched.password && errors.password)}
                      helperText={touched.password && errors.password}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      align="center"
                      sx={{ color: "text.secondary", mt: 1 }}
                    >
                      By registering, I agree to Ministry of Information and
                      Media&nbsp;
                      <Link underline="always" color="textPrimary">
                        Terms of Service
                      </Link>
                      &nbsp;and&nbsp;
                      <Link underline="always" color="textPrimary">
                        Privacy Policy
                      </Link>
                      .
                    </Typography>
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Register"}
                </Button>
              </Form>
            </FormikProvider>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
              <br />
              <br />
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}
