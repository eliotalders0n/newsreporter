import React from "react";
// import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Image,
  Stack,
  Badge,
  Card,
  Container,
  Button,
  Modal,
} from "react-bootstrap";
import { useState, useEffect } from "react";
import firebase from "./../../firebase";
import AddArticle from "./addArticle";
import { Skeleton } from "@mui/material";
import DOMPurify from 'dompurify';

function Landing(props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // State to track loading status

  const [articles, setArticles] = useState([]);
  const [authors, setAuthors] = useState({});

  useEffect(() => {
    // Load articles from Firestore on component mount
    const unsubscribeArticles = firebase
      .firestore()
      .collection("Articles")
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        const articles = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLoading(false);
        setArticles(articles);
      });

    // Load authors from Firestore
    const unsubscribeAuthors = firebase
      .firestore()
      .collection("Users")
      .onSnapshot((snapshot) => {
        const authorsData = {};
        snapshot.docs.forEach((doc) => {
          authorsData[doc.id] = doc.data();
        });
        setLoading(false);
        setAuthors(authorsData);
      });

    return () => {
      unsubscribeArticles();
      unsubscribeAuthors();
    };
  }, []);

  const [showShare, setShowShare] = useState(false);

  const handleShareClose = () => setShowShare(false);
  const handleShareShow = () => setShowShare(true);

  const sanitizeHTML = (html) => {
    return {
      __html: DOMPurify.sanitize(html)
    };
  };

  return (
    <Container
      fluid
      style={{
        backgroundColor: "black",
        minHeight: "100vh",
        color: "white",
        padding: "12vh 3vh 12vh 3vh",
      }}
    >
      <Stack className="d-flex justify-content-center" gap={3}>
        <Button variant="secondary" onClick={handleShareShow}>
          Report News
        </Button>
      </Stack>
      <br />
      <Stack direction="horizontal" gap={3}>
        <h2>Your News</h2>
        <p className="p-2 ms-auto"></p>
      </Stack>
      <Row>
        {loading ? ( // Render Skeleton while loading is true
          <Stack spacing={1}>
            {/* For variant="text", adjust the height via font-size */}
            <Skeleton
              variant="rounded"
              sx={{ fontSize: "3rem", bgcolor: "grey" }}
            />
            <br />
            {/* For other variants, adjust the size with `width` and `height` */}
            <Skeleton
              variant="circular"
              sx={{ bgcolor: "grey" }}
              width={40}
              height={40}
            />
            <br />
            <Skeleton
              variant="rectangular"
              sx={{ bgcolor: "grey" }}
              width={320}
              height={118}
            />
            <br />
            <Skeleton
              variant="rounded"
              sx={{ bgcolor: "grey" }}
              width={320}
              height={60}
            />
            <br />
            {/* For variant="text", adjust the height via font-size */}
            <Skeleton
              variant="rounded"
              sx={{ fontSize: "3rem", bgcolor: "grey" }}
            />
            <br />
            {/* For other variants, adjust the size with `width` and `height` */}
            <Skeleton
              variant="circular"
              sx={{ bgcolor: "grey" }}
              width={40}
              height={40}
            />
            <br />
            <Skeleton
              variant="rectangular"
              sx={{ bgcolor: "grey" }}
              width={320}
              height={118}
            />
            <br />
            <Skeleton
              variant="rounded"
              sx={{ bgcolor: "grey" }}
              width={320}
              height={60}
            />
          </Stack>
        ) : (
          articles.map((article) => (
            <Col
              style={{ height: " 45vh", marginBottom: "10%", padding: "0 0" }}
            >
              <Link
                to={"/story/" + article.id}
                state={{ data: article }}
                style={{
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <Card
                  flex={{ base: "auto", md: 1 }}
                  style={{
                    height: "100%",
                    minWidth: "38vh",
                    border: "none",
                    backgroundColor: "black",
                  }}
                  onClick={() => navigate("/story")}
                >
                  <Card.Body
                    style={{
                      backgroundImage: `url("${article.imagesUrls[0]}")`,
                      color: "white",
                      backgroundSize: "cover",
                      borderRadius: "18px",
                    }}
                  >
                    {console.log(article.imagesUrls[0])}
                    <Card.Title
                      style={{
                        backgroundColor: "rgba(40,40,40,0.3)",
                        borderRadius: "10px",
                        padding: "1px",
                      }}
                    >
                      <b>{article.title}</b>
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      <Badge bg="danger">
                        {authors[article.author]?.ministry}
                      </Badge>
                    </Card.Subtitle>
                  </Card.Body>
                  <Card.Text
                    style={{
                      backgroundColor: "black",
                      color: "white",
                      fontSize: "14px",
                      margin: "5px 5px",
                    }}
                  >
                    {article.content.length > 100
                      ? (
                        <div dangerouslySetInnerHTML={sanitizeHTML(`${article.content.substring(0, 100)}...`)} />
                      ) : (
                        <div dangerouslySetInnerHTML={sanitizeHTML(article.content)} />
                      )}
                  </Card.Text>
                  <Stack
                    direction="horizontal"
                    gap={2}
                    style={{ color: "white" }}
                  >
                    <Image
                      src="assets/ministries/labour.png"
                      alt=""
                      style={{ width: "3vh" }}
                      roundedCircle
                    />
                    {authors[article.author]?.firstName}{" "}
                    {authors[article.author]?.lastName}
                  </Stack>
                  <Card.Text
                    style={{
                      backgroundColor: "black",
                      color: "white",
                      fontSize: "10px",
                      margin: "2px 5px",
                    }}
                  >
                    {article.createdAt &&
                      article.createdAt.toDate().toLocaleString()}
                  </Card.Text>
                </Card>
              </Link>
            </Col>
          ))
        )}
      </Row>
      <Modal show={showShare} onHide={handleShareClose}>
        <Modal.Body style={{ backgroundColor: "black", color: "white" }}>
          <h2 className="text-center display-3">Submit Report</h2>
          <br />
          <AddArticle />
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "black", color: "white" }}>
          <Button variant="dark" onClick={handleShareClose}>
            X
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Landing;
