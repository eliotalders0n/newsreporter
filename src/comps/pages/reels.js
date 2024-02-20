import React from "react";
// import { Nav } from "react-bootstrap";
// import ReportsHeader from "../template/reportsHeader";
import Pending from "./pending";

const ReelCard = () => {
  return (
    <div
      style={{
        backgroundColor: "black",
        height: "auto",
        // padding: "12vh 1vh 12vh 1vh",
      }}
    >
      {/* <ReportsHeader /> */}
      <Pending/>
    </div>
  );
};

export default ReelCard;
