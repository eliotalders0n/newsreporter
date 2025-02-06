import React from "react";
import { Badge, Card, Nav } from "react-bootstrap";
import ReportsHeader from "../template/reportsHeader";
import { useState, useEffect } from "react";
import firebase from "./../../firebase";
import { useLocation } from "react-router-dom";
import { Skeleton, Stack } from "@mui/material";
import { useTheme } from "../template/themeContext";
import { ToastContainer, toast } from "react-toastify";

const ReportsTabs = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [articles, setArticles] = useState([]);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const currentUser = firebase.auth().currentUser;
  const uid = currentUser?.uid;

  const TABS = [
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "dismissed", label: "Dismissed" },
    { id: "all", label: "All" },
  ];

  useEffect(() => {
    if (!uid) return;

    setLoading(true);
    setArticles([]);

    let query = firebase
      .firestore()
      .collection("Articles")
      .where("author", "==", uid);

    if (activeTab !== "all") {
      query = query.where("status", "==", activeTab);
    }

    const unsubscribe = query
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          const articles = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setArticles(articles);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching articles:", error);
          toast.error("Error fetching articles");
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [activeTab, uid]);

  const getBadgeVariant = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "dismissed":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "primary";
    }
  };

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
      <Nav variant="tabs" defaultActiveKey="pending" className="mb-4">
        {TABS.map((tab) => (
          <Nav.Item key={tab.id}>
            <Nav.Link
              eventKey={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                color: activeTab === tab.id ? "white" : theme === "light" ? "black" : "white",
                backgroundColor: activeTab === tab.id ? "#007bff" : "transparent",
              }}
            >
              {tab.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <h6 className="display-6 text-center">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h6>
      <br />

      {loading ? (
        <Stack spacing={1}>
          <Skeleton variant="rounded" sx={{ fontSize: "3rem", bgcolor: "grey" }} />
          <Skeleton variant="circular" sx={{ bgcolor: "grey" }} width={40} height={40} />
          <Skeleton variant="rectangular" sx={{ bgcolor: "grey" }} width={210} height={60} />
          <Skeleton variant="rounded" sx={{ bgcolor: "grey" }} width={210} height={60} />
        </Stack>
      ) : (
        articles.map((article) => (
          <div key={article.id}>
            <h4>{article.title}</h4>
            <p className="lead" style={{ fontSize: "14px" }}>
              Submitted on{" "}
              {article.createdAt?.toDate().toLocaleString()}
            </p>
            <Badge bg={getBadgeVariant(activeTab === "all" ? article.status : activeTab)}>
              {activeTab === "all" ? article.status : activeTab}
            </Badge>
            <hr style={{ color: theme === "light" ? "black" : "white" }} />
          </div>
        ))
      )}

      {!loading && articles.length === 0 && (
        <p className="text-center">No articles found in this category</p>
      )}
    </div>
  );
};

export default ReportsTabs;