import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import DashboardEnhanced from "./pages/DashboardEnhanced";
import AICounsellor from "./pages/AICounsellor";
import Universities from "./pages/Universities";
import UniversityDetail from "./pages/UniversityDetail";
import UniversityDetails from "./pages/UniversityDetails";
import UniversityComparison from "./pages/UniversityComparison";
import Application from "./pages/Application";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import ApplicationGuidance from "./pages/ApplicationGuidance";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/3d-effects.css";

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public routes without navbar */}
        <Route path="/" element={<Landing/>}/>
        <Route path="/auth/signup" element={<Signup/>}/>
        <Route path="/auth/login" element={<Login/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        
        {/* Authenticated routes with navbar */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Layout>
              <Onboarding/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <DashboardEnhanced/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/dashboard-old" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/counsellor" element={
          <ProtectedRoute>
            <Layout>
              <AICounsellor/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/ai-counsellor" element={
          <ProtectedRoute>
            <Layout>
              <AICounsellor/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/universities" element={
          <ProtectedRoute>
            <Layout>
              <Universities/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/universities/:id" element={
          <ProtectedRoute>
            <Layout>
              <UniversityDetail/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/university/:id" element={
          <ProtectedRoute>
            <Layout>
              <UniversityDetails/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/compare" element={
          <ProtectedRoute>
            <Layout>
              <UniversityComparison/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Layout>
              <Tasks/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/application-guidance" element={
          <ProtectedRoute>
            <Layout>
              <ApplicationGuidance/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/application" element={
          <ProtectedRoute>
            <Layout>
              <Application/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/applications" element={
          <ProtectedRoute>
            <Layout>
              <Application/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout>
              <Analytics/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings/>
            </Layout>
          </ProtectedRoute>
        }/>
      </Routes>
    </div>
  );
}
