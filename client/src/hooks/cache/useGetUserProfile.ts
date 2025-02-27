import { useQuery } from '@tanstack/react-query';

import { getUserProfile } from 'src/actions/user.actions';
import { EQueryKey } from 'src/constants/enum';
import { executeServerAction } from 'src/utils/common.util';

const useGetUserProfile = () => {
  const query = useQuery({
    queryKey: [EQueryKey.USER_PROFILE],
    queryFn: () => executeServerAction(() => getUserProfile())
  });
  return query;
};

export default useGetUserProfile;
