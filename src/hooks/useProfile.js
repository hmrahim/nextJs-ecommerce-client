// 📁 PATH: src/hooks/useProfile.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { profileService } from '@/services/profileService';
import { useAuth } from '@/hooks/useAuth';

export function useProfile() {
  const { user: sessionUser } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [error,   setError]     = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfile(data.user ?? data);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = async (data) => {
    try {
      setSaving(true);
      setError(null);
      const res = await profileService.updateProfile(data);
      setProfile(prev => ({ ...prev, ...res.user }));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (passwords) => {
    try {
      setSaving(true);
      setError(null);
      await profileService.changePassword(passwords);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async (address) => {
    try {
      const res = await profileService.addAddress(address);
      setProfile(prev => ({ ...prev, addresses: res.addresses }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateAddress = async (id, address) => {
    try {
      const res = await profileService.updateAddress(id, address);
      setProfile(prev => ({ ...prev, addresses: res.addresses }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteAddress = async (id) => {
    try {
      const res = await profileService.deleteAddress(id);
      setProfile(prev => ({ ...prev, addresses: res.addresses }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      const res = await profileService.setDefaultAddress(id);
      setProfile(prev => ({ ...prev, addresses: res.addresses }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteCard = async (cardType) => {
    try {
      const res = await profileService.deleteCard(cardType);
      setProfile(prev => ({ ...prev, savedCards: res.savedCards }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const requestDeletion = async (reason) => {
    try {
      await profileService.requestDeletion(reason);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    profile,
    loading,
    saving,
    error,
    refetch: fetchProfile,
    updateProfile,
    changePassword,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    deleteCard,
    requestDeletion,
  };
}
