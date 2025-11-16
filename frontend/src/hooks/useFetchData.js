import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosinstance';

const useFetchData = (url, options = {}) => {
  const { initialData = null, skip = false, method = 'get', body = null, dependencies = [] } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (fetchBody = body) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance({
        method,
        url,
        data: fetchBody,
      });
      setData(response.data);
      return response.data; // Allow caller to use the data immediately
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [url, method, body, ...dependencies]); // Include body and dependencies in useCallback

  useEffect(() => {
    if (!skip) {
      fetchData();
    }
  }, [skip, fetchData]);

  return { data, loading, error, fetchData, setData, setLoading, setError };
};

export default useFetchData;
