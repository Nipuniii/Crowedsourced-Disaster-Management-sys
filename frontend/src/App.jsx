import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './components/ProfilePage'; 
// import StaticContentPage from '../pages/StaticContentPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path='/' element={<StaticContentPage />} /> */}
        <Route path='/home' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute role="user"/>}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/profile' element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route path='/admin-dashboard' element={<AdminDashboard />} />
        </Route>

        {/* Unauthorized Access Page */}
        <Route path='/unauthorized' element={<h2>Access Denied</h2>} />
      </Routes>
    </Router>
  );
}

export default App;