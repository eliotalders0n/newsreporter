import React, { useState } from "react";
import { Row, Col, Button, Form, Modal } from "react-bootstrap";
import firebase from "../../firebase";
import { useNavigate } from "react-router-dom";
import useGetUser from "../hooks/useGetUser";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const AddArticle = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
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

                      // Redirect to another page or perform any other action
                      navigate("/reels");
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

  return (
    <>
      <Button onClick={() => handleSubmitModal("article")}>Add Article</Button>
      <Button onClick={() => handleSubmitModal("video")}>Add Video</Button>
      
      <Modal show={showModal} onHide={handleModalClose}>
      {uploading && <LinearProgress variant="determinate" value={uploadProgress} />}
        <Modal.Header closeButton>
          <Modal.Title>Select Post Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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

              <Form.Group className="mb-5" controlId="formGridContent">
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
              <Button variant="success" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
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
              <Form.Label>Upload images (up to 4)</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileChange}
                required
              />
            </Form.Group>
            <br />
            <Button variant="success" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </Form>
          ) : null}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddArticle;
