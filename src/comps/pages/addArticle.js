import React, { useState } from "react";
import { Row, Col, Form, Modal, Stack } from "react-bootstrap";
import firebase from "../../firebase";
import { useNavigate } from "react-router-dom";
import useGetUser from "../hooks/useGetUser";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, LinearProgress } from "@mui/material";
import { useTheme } from "../template/themeContext";

const AddArticle = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [postType, setPostType] = useState(null); // 'video' or 'article'

  const author = useGetUser(firebase.auth().currentUser.uid).docs;

  const handleFileChange = (event) => {
    const files = event.target.files;
    const filesArray = Array.from(files);
    // Limit number of images to 4
    if (filesArray.length <= 4) {
      setImages(filesArray);
    } else {
      alert("You can only select up to 4 images.");
    }
  };

  const handleAddArticle = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    try {
      setSubmitting(true);
      const storageRef = firebase.storage().ref();
      const articleImagesRef = storageRef.child(`article_images`);

      const promises = [];
      const imagesUrls = [];

      for (const image of images) {
        const uploadTask = articleImagesRef.child(image.name).put(image);

        // Pushing the upload task promise to the promises array
        promises.push(uploadTask);

        // Listening for the completion of each upload task
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
          },
          () => {
            // Upload completed successfully, get download URL
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
              imagesUrls.push(downloadURL);
              setUploading(false);

              // If all images are uploaded, proceed to add article data to Firestore
              if (imagesUrls.length === images.length) {
                Promise.all(promises).then(() => {
                  firebase
                    .firestore()
                    .collection("Articles")
                    .add({
                      title,
                      content,
                      imagesUrls,
                      location,
                      video: postType === "video" ? true : false,
                      ministry: author.ministry,
                      author: firebase.auth().currentUser.uid,
                      createdAt:
                        firebase.firestore.FieldValue.serverTimestamp(),
                      published: false,
                      status: "pending",
                    })
                    .then(() => {
                      // Reset form fields after successful submission
                      setTitle("");
                      setLocation("");
                      setContent("");
                      setImages([]);
                      setSubmitting(false);
                      setUploadProgress(0);
                      setShowModal(true);
                      // setUploading(true);

                      // Redirect to another page or perform any other action
                      navigate("/pending");
                    })
                    .catch((error) => {
                      console.error("Error adding article:", error);
                      alert("Failed to add article. Please try again.");
                    });
                });
              }
            });
          }
        );
      }
    } catch (error) {
      console.error("Error adding article:", error);
      alert("Failed to add article. Please try again.");
      setSubmitting(false);
    }
  };

  const handleSubmitModal = (type) => {
    setPostType(type);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setPostType(null);
  };

  const { theme } = useTheme();

  return (
    <>
    <Stack direction="horizontal">
      <Button
        onClick={() => handleSubmitModal("article")}
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        style={{backgroundColor: theme === "light" ? "black" : "white",
        color: theme === "light" ? "white" : "black", fontWeight: "900"}}
      >
        Add Article
      </Button>
      <h3 className="text-center" style={{padding: "20px"}}> or </h3>
      <Button
        onClick={() => handleSubmitModal("video")}
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        style={{backgroundColor: theme === "light" ? "black" : "white",
        color: theme === "light" ? "white" : "black", fontWeight: "900"}}
      >
        Add Video
      </Button>
      </Stack>
      <Modal
        show={showModal}
        onHide={handleModalClose}
        style={{
          backgroundColor: theme === "light" ? "white" : "black",
          color: theme === "light" ? "black" : "white",
        }}
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: theme === "light" ? "white" : "black",
            color: theme === "light" ? "black" : "white",
          }}
        >
          <Modal.Title
            style={{
              backgroundColor: theme === "light" ? "white" : "black",
              color: theme === "light" ? "black" : "white",
            }}
          >
            Select Post Type
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: theme === "light" ? "white" : "black",
            color: theme === "light" ? "black" : "white",
          }}
        >
          {postType === "article" ? (
            <Form onSubmit={handleAddArticle}>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridHeadline">
                  <Form.Label>Headline</Form.Label>
                  <Form.Control
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Headline"
                    required
                  />
                </Form.Group>
              </Row>

              <Form.Group className="mb-2" controlId="formGridContent">
                <Form.Label>Details</Form.Label>
                <ReactQuill
                  value={content}
                  onChange={(value) => setContent(value)}
                  placeholder="Detailed story"
                  required
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formGridLocation">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter Location"
                  required
                />
              </Form.Group>
              <br />
              <Form.Group as={Col} controlId="formGridFiles">
                <Form.Label>Upload images (up to 4)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  required
                />
              </Form.Group>
              <br />
              <Button variant="success" type="submit" disabled={submitting} style={{backgroundColor: theme === "light" ? "black" : "white",
        color: theme === "light" ? "white" : "black"}} >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
              {uploading && (
                <LinearProgress variant="determinate" value={uploadProgress} />
              )}
            </Form>
          ) : postType === "video" ? (
            <Form onSubmit={handleAddArticle}>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridHeadline">
                  <Form.Label>Headline</Form.Label>
                  <Form.Control
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Headline"
                    required
                  />
                </Form.Group>
              </Row>

              <Form.Group as={Col} controlId="formGridLocation">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter Location"
                  required
                />
              </Form.Group>
              <br />
              <Form.Group as={Col} controlId="formGridFiles">
                <Form.Label>Upload Video (up to 2)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  required
                />
              </Form.Group>
              <br />
              <Button variant="success" type="submit" disabled={submitting} style={{backgroundColor: theme === "light" ? "black" : "white",
        color: theme === "light" ? "white" : "black"}}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
              {uploading && (
                <LinearProgress variant="determinate" value={uploadProgress} />
              )}
            </Form>
          ) : null}
        </Modal.Body>
        {uploading && (
          <LinearProgress variant="determinate" value={uploadProgress} />
        )}
      </Modal>
    </>
  );
};

export default AddArticle;
