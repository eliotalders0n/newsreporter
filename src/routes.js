import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// User Interface
import Landing from "./comps/pages/landingPage";
import ReelCard from "./comps/pages/reels";
import Profile from "./comps/pages/profile";
import Ministries from "./comps/pages/ministires";
import Story from "./comps/pages/story";
import Pending from "./comps/pages/pending";
import Approved from "./comps/pages/approved";
import All from "./comps/pages/all";
import Header from "./comps/template/head";
import Navigation from "./comps/template/navigation";

function Routers(props) {
  return (
    <>
    <Header/>
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Landing />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/reels" element={<ReelCard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ministries" element={<Ministries />} />
        <Route path="/story/:id" element={<Story />} />
        <Route path="/pending" element={<Pending />} />
        <Route path="/approved" element={<Approved />} />
        <Route path="/all" element={<All />} />
      </Routes>
      <Navigation />
    </BrowserRouter>
    
    </>
  );
}

export default Routers;
