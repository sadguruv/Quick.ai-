import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import ChatWorkspace from "./pages/ChatWorkspace";
import Dashboard from "./pages/Dashboard";
import Codex from "./pages/Codex";
import Library from "./pages/Library";
import WriteArticle from "./pages/WriteArticle";
import BlogTitles from "./pages/BlogTitles";
import GenerateImages from "./pages/GenerateImages";
import RemoveBackground from "./pages/RemoveBackground";
import ReviewResume from "./pages/ReviewResume";
import Community from "./pages/Community";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminLogin from "./pages/AdminLogin";
import StableDiffusionGenerator from "./pages/StableDiffusionGenerator";
import AdminPanel from "./pages/AdminPanel";
import RequireAuth from "./components/RequireAuth";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div>
      <Toaster position="top-center" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/" element={<Home />} />

        {/* Redirect Legacy Routes */}
        <Route path="/sign-in" element={<Navigate to="/login" replace />} />
        <Route path="/sign-up" element={<Navigate to="/signup" replace />} />

        {/* Protected Routes */}
        <Route
          path="/ai"
          element={
            <RequireAuth allowedRoles={['ai_user', 'service_provider']}>
              <Layout />
            </RequireAuth>
          }
        >
          {/* Main ChatGPT Go Unified Workspace Landing Page */}
          <Route index element={<ChatWorkspace />} />
          <Route path="chat" element={<ChatWorkspace />} />
          <Route path="codex" element={<Codex />} />
          <Route path="library" element={<Library />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="write-article" element={<WriteArticle />} />
          <Route path="blog-titles" element={<BlogTitles />} />
          <Route path="generate-images" element={<GenerateImages />} />
          <Route path="stable-diffusion" element={<StableDiffusionGenerator />} />
          <Route path="remove-background" element={<RemoveBackground />} />
          <Route path="review-resume" element={<ReviewResume />} />
          <Route path="community" element={<Community />} />
          <Route
            path="admin-panel"
            element={
              <RequireAuth allowedRoles={['service_provider']}>
                <AdminPanel />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
