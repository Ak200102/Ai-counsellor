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
          <Layout>
            <Onboarding/>
          </Layout>
        }/>
        <Route path="/dashboard" element={
          <Layout>
            <DashboardEnhanced/>
          </Layout>
        }/>
        <Route path="/dashboard-old" element={
          <Layout>
            <Dashboard/>
          </Layout>
        }/>
        <Route path="/profile" element={
          <Layout>
            <Profile/>
          </Layout>
        }/>
        <Route path="/counsellor" element={
          <Layout>
            <AICounsellor/>
          </Layout>
        }/>
        <Route path="/ai-counsellor" element={
          <Layout>
            <AICounsellor/>
          </Layout>
        }/>
        <Route path="/universities" element={
          <Layout>
            <Universities/>
          </Layout>
        }/>
        <Route path="/universities/:id" element={
          <Layout>
            <UniversityDetail/>
          </Layout>
        }/>
        <Route path="/university/:id" element={
          <Layout>
            <UniversityDetails/>
          </Layout>
        }/>
        <Route path="/compare" element={
          <Layout>
            <UniversityComparison/>
          </Layout>
        }/>
        <Route path="/tasks" element={
          <Layout>
            <Tasks/>
          </Layout>
        }/>
        <Route path="/application-guidance" element={
          <Layout>
            <ApplicationGuidance/>
          </Layout>
        }/>
        <Route path="/application" element={
          <Layout>
            <Application/>
          </Layout>
        }/>
        <Route path="/applications" element={
          <Layout>
            <Application/>
          </Layout>
        }/>
        <Route path="/analytics" element={
          <Layout>
            <Analytics/>
          </Layout>
        }/>
        <Route path="/settings" element={
          <Layout>
            <Settings/>
          </Layout>
        }/>
      </Routes>
    </div>
  );
}
