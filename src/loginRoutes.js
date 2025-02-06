import { Routes, Route, useLocation } from "react-router-dom";
import Landing from "./comps/pages/landingPage";
import Profile from "./comps/pages/profile";
import Header from "./comps/template/head";
import Navigation from "./comps/template/navigation";
import Story from "./comps/pages/story";
import ReportsTabs from "./comps/pages/reels";

function RoutesWrapper() {
  const location = useLocation();

  // Determine if Navigation should be displayed
  const shouldShowNavigation = !location.pathname.startsWith("/story/");

  return (
    <>
      {shouldShowNavigation && <Header />}
      <Routes>
        <Route exact path="/" element={<Landing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/story/:id" element={<Story />} />
        <Route path="/reels" element={<ReportsTabs />} />
      </Routes>
      {shouldShowNavigation && <Navigation />}
    </>
  );
}

function LoginRoutes() {
  return <RoutesWrapper />;
}

export default LoginRoutes;
