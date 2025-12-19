import { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosConfig';

const useHearings = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHearings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchHearings();
  }, [fetchHearings]);

  const refetch = async () => {
    await fetchHearings();
  };

  // ✅ Nowa funkcja: Tworzenie rozprawy
  const createHearing = async (hearingData) => {
    try {
      const response = await API.post('/court/hearings/', hearingData);
      setData(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error("Błąd tworzenia rozprawy:", err);
      throw err;
    }
  };

  const updateHearing = (updatedHearing) => {
    setData((prevData) =>
      prevData.map((hearing) =>
        hearing.id === updatedHearing.id ? updatedHearing : hearing
      )
    );
  };

  return { data, loading, error, refetch, createHearing, updateHearing };
};

export default useHearings;