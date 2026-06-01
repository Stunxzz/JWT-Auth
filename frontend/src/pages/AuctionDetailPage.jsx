import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { parseError } from '../utils/parseError';


const AuctionDetailPage = () => {
    const { id } = useParams();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [bidError, setBidError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchAuction = async () => {
        try {
            const res = await api.get(`auctions/${id}/`);
            setAuction(res.data);
        } catch {
            setAuction(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuction();
    }, [id]);

    const handleBid = async (e) => {
        e.preventDefault();
        setBidError(null);
        setSubmitting(true);
        try {
            await api.post(`auctions/${id}/bid/`, { amount });
            setAmount('');
            await fetchAuction();
        } catch (err) {
            setBidError(parseError(err.response?.data));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="px-4 py-8 max-w-3xl mx-auto">
                <p className="text-gray-500">Auction not found.</p>
                <Link to="/" className="text-blue-600 hover:underline">← Back</Link>
            </div>
        );
    }

    const isActive = auction.status === 'active';

    return (
        <div className="px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="text-sm text-blue-600 hover:underline">← Back to auctions</Link>

                <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
                    <div className="flex items-start justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">{auction.title}</h1>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                            {auction.status}
                        </span>
                    </div>

                    <p className="text-gray-600 mt-2">{auction.description}</p>
                    <p className="text-sm text-gray-500 mt-1">Sold by {auction.seller_name}</p>

                    <div className="mt-6 flex items-end justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Current price</p>
                            <p className="text-3xl font-bold text-gray-900">${auction.current_price}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                            Ends {new Date(auction.end_time).toLocaleString()}
                        </p>
                    </div>

                    {isActive ? (
                        <form onSubmit={handleBid} className="mt-6 flex gap-3">
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Your bid"
                                required
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
                            >
                                {submitting ? 'Placing…' : 'Place bid'}
                            </button>
                        </form>
                    ) : (
                        <p className="mt-6 text-sm text-gray-500">This auction is not open for bidding.</p>
                    )}

                    {bidError && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mt-3">
                            {bidError}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
                    <h2 className="font-medium text-gray-800 mb-4">Bid history</h2>
                    {auction.bids.length === 0 ? (
                        <p className="text-sm text-gray-500">No bids yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {auction.bids.map((bid) => (
                                <li key={bid.id} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{bid.bidder_name}</span>
                                    <span className="font-medium text-gray-900">${bid.amount}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuctionDetailPage;