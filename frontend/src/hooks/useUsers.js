import { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosConfig';

const useUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // PRZYWRÓCONO: /court/users/
      const response = await API.get('/court/users/');
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Błąd przy pobieraniu użytkowników');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = async () => {
    await fetchUsers();
  };

  const updateUser = useCallback((updatedUser) => {
    setData((prevData) =>
      prevData.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  }, []);

  const addUser = useCallback((newUser) => {
    setData((prevData) => [...prevData, newUser]);
  }, []);

  const removeUser = useCallback((userId) => {
    setData((prevData) => prevData.filter((user) => user.id !== userId));
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    updateUser,
    addUser,
    removeUser,
  };
};

export default useUsers;