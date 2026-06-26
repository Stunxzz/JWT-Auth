import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import api from '../api/axios.js'

const STATUS_STYLES = {
    draft: 'bg-gray-100 text-gray-500',
    active: 'bg-green-100 text-green-700',
    ended: 'bg-red-100 text-red-500',
    canceled: 'bg-yellow-100 text-yellow-700',
};

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
            <div className="max-w-6xl mx-auto">

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Auctions</h1>
                    <span className="text-sm text-gray-400">{auctions.length} total</span>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {auctions.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-4xl mb-3">🔨</p>
                        <p className="font-medium">No auctions yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {auctions.map((auction) => (
                            <Link
                                key={auction.id}
                                to={`/auctions/${auction.id}`}
                                className="block bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 border border-gray-100"
                            >
                                {/* Image placeholder */}
                                {auction.images?.find(img => img.is_primary) ? (
                                    <img
                                        src={auction.images.find(img => img.is_primary).image}
                                        alt={auction.title}
                                        className="w-full h-36 object-cover rounded-xl mb-4"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-36 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-300 text-3xl">
                                        🖼
                                    </div>
                                )}

                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <h2 className="font-semibold text-gray-800 truncate">{auction.title}</h2>
                                    <span
                                        className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[auction.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                        {auction.status}
                                    </span>
                                </div>

                                <p className="text-2xl font-bold text-gray-900 mb-1">
                                    ${auction.current_price}
                                </p>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">
                                        Ends {new Date(auction.end_time).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {auction.bids?.length ?? 0} bids
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionListPage;