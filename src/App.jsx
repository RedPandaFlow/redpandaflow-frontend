import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Workspaces from './pages/Workspaces';
import WorkspaceDetail from './pages/WorkspaceDetail';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/profile" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/profile" />} />
        
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/workspaces" element={user ? <Workspaces /> : <Navigate to="/login" />} />
        <Route path="/workspaces/:id" element={user ? <WorkspaceDetail /> : <Navigate to="/login" />} />

        <Route path="/" element={<Navigate to={user ? "/workspaces" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;