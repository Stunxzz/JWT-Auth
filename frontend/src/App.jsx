import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuctionListPage from "./pages/AuctionListPage.jsx";
import Layout from "./components/Layout.jsx";
import AuctionDetailPage from "./pages/AuctionDetailPage.jsx";
import CreateAuctionPage from "./pages/CreateAuctionPage.jsx";


const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>

                    <Route
                        element={
                            <ProtectedRoute>
                                <Layout/>
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/" element={<AuctionListPage/>}/>
                        <Route path="/auctions/:id" element={<AuctionDetailPage/>}/>
                        <Route path="/auctions/new" element={<CreateAuctionPage/>}/>

                    </Route>

                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;