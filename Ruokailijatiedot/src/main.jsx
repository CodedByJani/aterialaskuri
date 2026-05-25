import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Login from './components/Login.jsx'
import Verify from './components/Verify.jsx'
import AdminLogs from './components/AdminLogs.jsx'
import './App.css'
import HistoryView from './components/HistoryView.jsx'

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('sessionToken')

    return token ? children: <Navigate to="/login" />
}

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/" element={<PrivateRoute><App /></PrivateRoute>}/>
            <Route 
                path="/logs"
                element={
                    <PrivateRoute>
                        <AdminLogs />
                    </PrivateRoute>
                }
            />
            <Route
                path="/history-view"
                element={
                    <PrivateRoute>
                        <HistoryView />
                    </PrivateRoute>
                }
            />
        </Routes>
    </BrowserRouter>
)
