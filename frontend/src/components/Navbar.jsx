import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

const Navbar = () => {
    const {user, logout} = useAuth();

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-xl">🔨</span>
                    <span className="font-bold text-gray-900 text-lg tracking-tight">Auctions</span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/auctions/new"
                        className="flex items-center gap-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <span>+</span>
                        <span>New auction</span>
                    </Link>

                    {/* User avatar placeholder */}
                    <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                            {user?.first_name?.[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user?.first_name}</span>
                    </div>

                    <button
                        onClick={logout}
                        className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;