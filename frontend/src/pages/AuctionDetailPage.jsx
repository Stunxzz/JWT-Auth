import {useEffect, useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import api from '../api/axios';
import {parseError} from '../utils/parseError';

const STATUS_STYLES = {
    draft: 'bg-gray-100 text-gray-500',
    active: 'bg-green-100 text-green-700',
    ended: 'bg-red-100 text-red-500',
    canceled: 'bg-yellow-100 text-yellow-700',
};

const AuctionDetailPage = () => {
    const {id} = useParams();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [bidError, setBidError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeImage, setActiveImage] = useState(null);

    const fetchAuction = async () => {
        try {
            const res = await api.get(`auctions/${id}/`);
            setAuction(res.data);
            // Сетваме главната снимка като активна
            const primary = res.data.images?.find(img => img.is_primary) ?? res.data.images?.[0];
            setActiveImage(primary?.image ?? null);
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
            await api.post(`auctions/${id}/bid/`, {amount});
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
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
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
    const images = auction.images ?? [];

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="text-sm text-blue-600 hover:underline">← Back to auctions</Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">

                    {/* Images */}
                    {images.length > 0 ? (
                        <div className="mb-6">
                            {/* Main image */}
                            <img
                                src={activeImage}
                                alt={auction.title}
                                className="w-full h-72 object-cover rounded-xl"
                            />
                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-2 mt-2">
                                    {images.map((img) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImage(img.image)}
                                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                                                activeImage === img.image
                                                    ? 'border-blue-500'
                                                    : 'border-transparent'
                                            }`}
                                        >
                                            <img src={img.image} alt="" className="w-full h-full object-cover"/>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="w-full h-48 bg-gray-100 rounded-xl mb-6 flex items-center justify-center text-4xl text-gray-300">
                            🖼
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">{auction.title}</h1>
                        <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[auction.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {auction.status}
                        </span>
                    </div>

                    <p className="text-gray-600 mt-2">{auction.description}</p>
                    <p className="text-sm text-gray-400 mt-1">Sold by {auction.seller_name}</p>

                    {/* Price */}
                    <div className="mt-6 flex items-end justify-between border-t border-gray-100 pt-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Current price</p>
                            <p className="text-3xl font-bold text-gray-900">${auction.current_price}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Min increment: ${auction.min_increment}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Ends</p>
                            <p className="text-sm text-gray-600 font-medium">
                                {new Date(auction.end_time).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Bid form */}
                    {isActive ? (
                        <form onSubmit={handleBid} className="mt-6 flex gap-3">
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={`Min $${(parseFloat(auction.current_price) + parseFloat(auction.min_increment)).toFixed(2)}`}
                                required
                                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <p className="mt-6 text-sm text-gray-400 italic">This auction is not open for bidding.</p>
                    )}

                    {bidError && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mt-3">
                            {bidError}
                        </div>
                    )}
                </div>

                {/* Bid history */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-800">Bid history</h2>
                        <span className="text-sm text-gray-400">{auction.bids.length} bids</span>
                    </div>
                    {auction.bids.length === 0 ? (
                        <p className="text-sm text-gray-400">No bids yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {auction.bids.map((bid, i) => (
                                <li key={bid.id}
                                    className={`flex justify-between items-center text-sm py-2 ${i !== auction.bids.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        {i === 0 && <span
                                            className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">top</span>}
                                        <span className="text-gray-700">{bid.bidder_name}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">${bid.amount}</span>
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