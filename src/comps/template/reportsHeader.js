import React from "react";
import { Nav } from "react-bootstrap";
import { useTheme } from "../template/themeContext";

const ReportsHeader = () => {
  const { theme } = useTheme();
  return (
    <div
      style={{
        backgroundColor: theme === "light" ? "white" : "black",
        color: theme === "light" ? "black" : "white",
        height: "auto",
      }}
    >
      <Nav className="justify-content-center" variant="underline" style={{backgroundColor: theme === "light" ? "white" : "black",
        color: theme === "light" ? "black" : "white",}} >
        <Nav.Item>
          <Nav.Link href="/pending" style={{backgroundColor: theme === "light" ? "white" : "black",
        color: theme === "light" ? "black" : "white",}}>Pending</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/approved" style={{backgroundColor: theme === "light" ? "white" : "black",
        color: theme === "light" ? "black" : "white",}}>Approved</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/all" style={{backgroundColor: theme === "light" ? "white" : "black",
        color: theme === "light" ? "black" : "white",}}>All</Nav.Link>
        </Nav.Item>
      </Nav>
      <hr style={{backgroundColor: theme === "light" ? "white" : "black",
        color: theme === "light" ? "black" : "white",}}/>
    </div>
  );
};

export default ReportsHeader;
