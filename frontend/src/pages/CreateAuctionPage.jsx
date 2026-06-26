import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { parseError } from '../utils/parseError';

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            {...props}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
    </div>
);

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
    const [images, setImages] = useState([]);      // файловете
    const [previews, setPreviews] = useState([]);  // preview URLs
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 10) {
            setError('Maximum 10 images allowed.');
            return;
        }
        setImages(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            // 1. Създаваме аукциона
            const payload = {
                ...form,
                start_time: new Date(form.start_time).toISOString(),
                end_time: new Date(form.end_time).toISOString(),
            };
            const res = await api.post('auctions/', payload);
            const auctionId = res.data.id;

            // 2. Качваме снимките една по една
            for (let i = 0; i < images.length; i++) {
                const formData = new FormData();
                formData.append('image', images[i]);
                formData.append('is_primary', i === 0); // първата е главна
                formData.append('order', i);
                await api.post(`auctions/${auctionId}/images/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            navigate(`/auctions/${auctionId}`);
        } catch (err) {
            setError(parseError(err.response?.data));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">New auction</h1>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Title" type="text" name="title" value={form.title} onChange={handleChange} required />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description" value={form.description} onChange={handleChange} rows={3}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <InputField label="Starting price" type="number" step="0.01" name="starting_price" value={form.starting_price} onChange={handleChange} required />
                        <InputField label="Min increment" type="number" step="0.01" name="min_increment" value={form.min_increment} onChange={handleChange} required />
                    </div>

                    <div className="flex gap-3">
                        <InputField label="Start" type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange} required />
                        <InputField label="End" type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange} required />
                    </div>

                    {/* Image upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Images <span className="text-gray-400 font-normal">({images.length}/10)</span>
                        </label>

                        {/* Previews */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {previews.map((src, i) => (
                                    <div key={i} className="relative group">
                                        <img src={src} alt="" className="w-full h-20 object-cover rounded-lg" />
                                        {i === 0 && (
                                            <span className="absolute top-1 left-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">
                                                Main
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload zone */}
                        {images.length < 10 && (
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                <span className="text-2xl mb-1">📷</span>
                                <span className="text-xs text-gray-400">Click to add images</span>
                                <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
                            </label>
                        )}
                    </div>

                    <button
                        type="submit" disabled={submitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
                    >
                        {submitting ? 'Creating…' : 'Create auction'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAuctionPage;