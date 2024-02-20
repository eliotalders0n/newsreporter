import { BrowserRouter, Route, Routes } from "react-router-dom";
import Registerform from "./comps/template/registerform";
import LoginForm from "./comps/template/signinform";
import StatusPage from "./comps/template/status";
import ResetPasswordForm from "./comps/template/resetPassword";

// ----------------------------------------------------------------------

export default function LoginRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/resetPassword" element={<ResetPasswordForm />} />
        <Route path="/register" element={<Registerform />} />
        <Route path="/statuspage" element={<StatusPage />} />
      </Routes>
    </BrowserRouter>
  );
}
