import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { parseError } from '../utils/parseError';

const CreateAuctionPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
        starting_price: '',
        min_increment: '1',
        start_time: '',
        end_time: '',
    });
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                start_time: new Date(form.start_time).toISOString(),
                end_time: new Date(form.end_time).toISOString(),
            };
            const res = await api.post('auctions/', payload);
            navigate(`/auctions/${res.data.id}`);
        } catch (err) {
            setError(parseError(err.response?.data));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="px-4 py-8">
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">New auction</h1>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text" name="title" value={form.title} onChange={handleChange} required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description" value={form.description} onChange={handleChange} rows={3}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Starting price</label>
                            <input
                                type="number" step="0.01" name="starting_price"
                                value={form.starting_price} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min increment</label>
                            <input
                                type="number" step="0.01" name="min_increment"
                                value={form.min_increment} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                            <input
                                type="datetime-local" name="start_time"
                                value={form.start_time} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                            <input
                                type="datetime-local" name="end_time"
                                value={form.end_time} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={submitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
                    >
                        {submitting ? 'Creating…' : 'Create auction'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAuctionPage;