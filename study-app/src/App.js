import './styles/global-styles.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Menu from './components/Menu';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';
import IntervalTimer from './components/IntervalTimer';
import CreateDeck from './components/CreateDeck';
import ManageDecks from './components/ManageDecks';
import StudyMenu from './components/StudyMenu';
import SelectDeck from './components/SelectDeck';
import Flashcards from './components/Flashcards';
import MemoryGame from './components/MemoryGame';
import Test from './components/Test';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/menu"
            element={
              <ProtectedRoute>
                <Layout>
                  <Menu />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/timer" element={<IntervalTimer />}
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateDeck />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-menu"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudyMenu />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/select-deck"
            element={
              <ProtectedRoute>
                <Layout>
                  <SelectDeck />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage"
            element={
              <ProtectedRoute>
                <Layout>
                  <ManageDecks />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcards"
            element={
              <ProtectedRoute>
                <Layout>
                  <Flashcards />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/memory-game"
            element={
              <ProtectedRoute>
                <Layout>
                  <MemoryGame />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <Layout>
                  <Test />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
