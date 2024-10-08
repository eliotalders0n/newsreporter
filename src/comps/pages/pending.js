import React from "react";
import { Badge, Card, Nav } from "react-bootstrap";
import ReportsHeader from "../template/reportsHeader";
import { useState, useEffect } from "react";
import firebase from "./../../firebase";
import { useLocation } from "react-router-dom";
import { Skeleton, Stack } from "@mui/material";
import { useTheme } from "../template/themeContext";
import { ToastContainer, toast } from "react-toastify";

const Pending = () => {
  const [articles, setArticles] = useState([]);
  const [authors, setAuthors] = useState({});
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true); // State to track loading status

  useEffect(() => {
    // Load articles from Firestore on component mount
    const unsubscribeArticles = firebase
      .firestore()
      .collection("Articles")
      .where("author","==", firebase.auth().currentUser.uid)
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        const articles = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArticles(articles);
        setLoading(false);
      });

  }, []);

  return (
    <div
      style={{
        backgroundColor: theme === "light" ? "white" : "black",
        color: theme === "light" ? "black" : "white",
        minHeight: "100vh",
        padding: "12vh 1vh 12vh 1vh",
      }}
    >
      <ToastContainer
        position="top-center"
        autoClose={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="colored"
        transition="bounce"
      />
      <ReportsHeader />
      <h6 className="display-6 text-center">Pending</h6>
      <br />
      {loading ? ( // Render Skeleton while loading is true
        <Stack spacing={1}>
          {/* For variant="text", adjust the height via font-size */}
          <Skeleton
            variant="rounded"
            sx={{ fontSize: "3rem", bgcolor: "grey" }}
          />
          {/* For other variants, adjust the size with `width` and `height` */}
          <Skeleton
            variant="circular"
            sx={{ bgcolor: "grey" }}
            width={40}
            height={40}
          />
          <Skeleton
            variant="rectangular"
            sx={{ bgcolor: "grey" }}
            width={210}
            height={60}
          />
          <Skeleton
            variant="rounded"
            sx={{ bgcolor: "grey" }}
            width={210}
            height={60}
          />
        </Stack>
      ) : (
        articles.map((article) => (
          <div key={article.id}>
            <h4>{article.title}</h4>
            <p className="lead" style={{ fontSize: "14px" }}>
              Submitted on{" "}
              {article.createdAt && article.createdAt.toDate().toLocaleString()}
            </p>
            <Badge>Pending Approval</Badge>
            <hr style={{ color: "white" }} />
          </div>
        ))
      )}
    </div>
  );
};

export default Pending;
