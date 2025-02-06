import { Routes, Route } from "react-router-dom";
import LoginForm from "./comps/template/signinform";
import Registerform from "./comps/template/registerform";
import StatusPage from "./comps/template/status";
import ResetPasswordForm from "./comps/template/resetPassword";

function Routers() {
  return (
    <Routes>
      <Route exact path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/resetPassword" element={<ResetPasswordForm />} />
        <Route path="/register" element={<Registerform />} />
        <Route path="/statuspage" element={<StatusPage />} />
    </Routes>
  );
}

export default Routers;
