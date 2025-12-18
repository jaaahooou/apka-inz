import { useState, useEffect } from 'react';
import API from '../api/axiosConfig';

const useHearings = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      // PRZYWRÓCONO: /court/hearings/
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

  useEffect(() => {
    fetchHearings();
  }, []);

  const refetch = async () => {
    await fetchHearings();
  };

  const updateHearing = (updatedHearing) => {
    setData((prevData) =>
      prevData.map((hearing) =>
        hearing.id === updatedHearing.id ? updatedHearing : hearing
      )
    );
  };

  return { data, loading, error, refetch, updateHearing };
};

export default useHearings;