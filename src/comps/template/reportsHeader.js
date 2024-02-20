import React from "react";
import { Nav } from "react-bootstrap";

const ReportsHeader = () => {
  return (
    <div
      style={{
        backgroundColor: "black",
        height: "auto",
        color:"white"
      }}
    >
      <Nav className="justify-content-center" variant="underline" style={{color: "white"}} >
        <Nav.Item>
          <Nav.Link href="/pending" style={{color: "white",}}>Pending</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/approved" style={{color: "white"}}>Approved</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/all" style={{color: "white"}}>All</Nav.Link>
        </Nav.Item>
      </Nav>
      <hr style={{color: "white"}}/>
    </div>
  );
};

export default ReportsHeader;
