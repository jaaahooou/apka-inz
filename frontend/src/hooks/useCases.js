import { useState, useEffect } from 'react';
import API from '../api/axiosConfig';

const useCases = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCases = async () => {
    try {
      setLoading(true);
      // PRZYWRÓCONO: /court/cases/
      const response = await API.get('/court/cases/');
      
      const casesWithCounts = response.data.map((caseItem) => ({
        ...caseItem,
        hearings_count: caseItem.hearings?.length || 0,
        participants_count: caseItem.participants?.length || 0,
      }));
      setData(casesWithCounts);
      setError(null);
    } catch (err) {
      setError(err.message || 'Błąd przy pobieraniu spraw');
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const refetch = async () => {
    await fetchCases();
  };

  return { data, loading, error, refetch };
};

export default useCases;