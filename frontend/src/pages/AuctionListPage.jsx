import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import api from '../api/axios.js'

const AuctionListPage = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const result = await api.get('/auctions');
                setAuctions(result.data);
            } catch {
                setError('Could not load auctions.');
            } finally {
                setLoading(false);
            }
        };
        fetchAuctions();
    }, []);
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">Auctions</h1>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {auctions.length === 0 ? (
                    <p className="text-gray-500">No auctions yet.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {auctions.map((auction) => (
                            <Link
                                key={auction.id}
                                to={`/auctions/${auction.id}`}
                                className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="font-medium text-gray-800 truncate">{auction.title}</h2>
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                                        {auction.status}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">${auction.current_price}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Ends {new Date(auction.end_time).toLocaleString()}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default AuctionListPage;