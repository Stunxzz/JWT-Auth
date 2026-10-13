export const parseError = (data) => {
    if (!data) return 'Something went wrong.';
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data[0];
    if (data.detail) return data.detail;
    const first = Object.values(data)[0];
    return Array.isArray(first) ? first[0] : String(first);
};