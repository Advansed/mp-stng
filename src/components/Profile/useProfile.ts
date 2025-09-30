import { useLoginStore, useToken } from '../../Store/loginStore';

export const useProfile = () => {
  const { user, isLoading, error, getProfile, updateProfile } = useLoginStore();
  const token = useToken()
  
  const save = async (data: any) => {
    await updateProfile(data);
  };

  const refresh = async () => {
    await getProfile();
  };

  return {
    profile: user,
    isLoading,
    error,
    save,
    refresh
  };
};