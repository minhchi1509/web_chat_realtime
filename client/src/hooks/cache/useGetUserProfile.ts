import { useQuery } from '@tanstack/react-query';

import { EQueryKey } from 'src/constants/enum';
import { userService } from 'src/services';

const useGetUserProfile = () => {
  const query = useQuery({
    queryKey: [EQueryKey.USER_PROFILE],
    queryFn: userService.getUserProfile
  });
  return query;
};

export default useGetUserProfile;
