import { useState, useEffect } from 'react';
import API from '../api/axiosConfig'; // Zobaczy poniżej

const useHearings = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHearings = async () => {
      try {
        setLoading(true);
        const response = await API.get('/court/hearings/');
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Błąd przy pobieraniu rozpraw');
        console.error('Error fetching hearings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHearings();
  }, []);

  return { data, loading, error };
};

export default useHearings;