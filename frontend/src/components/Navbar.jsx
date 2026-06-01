import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

const Navbar = () => {
    const {user, logout} = useAuth();

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link to="/" className="font-bold text-gray-800">Auctions</Link>
                <div className="flex items-center gap-4">
                    <Link to="/auctions/new" className="text-sm text-blue-600 hover:underline">
                        + New auction
                    </Link>
                    <span className="text-sm text-gray-600">{user?.first_name}</span>
                    <button
                        onClick={logout}
                        className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;