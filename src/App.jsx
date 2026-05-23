import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { userWorkspacePath } from './lib/routes';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Workspaces from './pages/Workspaces';
import WorkspaceDetail from './pages/WorkspaceDetail';
import BoardDetail from './pages/BoardDetail';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFAF6]">
        <p className="text-sm text-[#9C8170]">Chargement…</p>
      </div>
    );
  }

  const homePath = user ? userWorkspacePath(user) : "/login";

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={homePath} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={homePath} />} />

        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/:username/workspaces" element={<Workspaces />} />
          <Route path="/workspace/:id" element={<WorkspaceDetail />} />
          <Route path="/workspace/:workspaceId/board/:boardId" element={<BoardDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to={homePath} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
