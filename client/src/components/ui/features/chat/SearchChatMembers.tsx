'use client';

import { useMutation } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useRouter } from 'next-nprogress-bar';
import React, { useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

import ChatAvatarStatus from 'src/components/ui/features/chat/ChatAvatarStatus';
import { Input } from 'src/components/ui/shadcn-ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent
} from 'src/components/ui/shadcn-ui/popover';
import InfiniteScroller from 'src/components/ui/shared/infinite-scrollers';
import LoadingSpinner from 'src/components/ui/shared/LoadingSpinner';
import useSearchChatMembers from 'src/hooks/cache/useSearchChatMembers';
import { chatService } from 'src/services';
import { TErrorResponse } from 'src/types/error-response.type';
import { showErrorToast } from 'src/utils/toast.util';

const SearchChatMembers = () => {
  const { push } = useRouter();
  const [page, setPage] = useState(1);
  const [searchMemberKey, setSearchMemberKey] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const debouncedSearchMember = useDebounceCallback((value) => {
    setSearchMemberKey(value);
    setPage(1);
  }, 500);

  const {
    data: allFetchedChatMembers,
    fetchNextPage,
    hasNextPage,
    isLoading
  } = useSearchChatMembers({ page, searchKey: searchMemberKey }, isOpen);

  const {
    isPending: isCreatingPrivateConversation,
    mutate: triggerCreatePrivateConversation
  } = useMutation({
    mutationFn: (partnerId: string) =>
      chatService.createPrivateConversation(partnerId),
    onSuccess: (responseData) => {
      push(`/messages/${responseData.createdConversation.id}`);
    },
    onError: (error: TErrorResponse) => {
      showErrorToast(error.message);
    }
  });

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          <Input
            prefixIcon={Search}
            placeholder="Search member to start conversation"
            className="w-full focus-visible:ring-transparent"
            onFocus={() => setIsOpen(true)}
            defaultValue={searchMemberKey}
            onChange={(e) => debouncedSearchMember(e.target.value)}
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-80 p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          side="bottom"
          align="start"
        >
          {isLoading && <LoadingSpinner className="my-8" />}
          {allFetchedChatMembers && (
            <InfiniteScroller
              className="h-72 overflow-auto p-2"
              hasNextPage={hasNextPage}
              fetchNextPage={fetchNextPage}
            >
              <div className="flex flex-col gap-2">
                {allFetchedChatMembers.pages.map((page, i) =>
                  page.data.map(({ profile, isOnline }) => (
                    <button
                      onClick={() => {
                        triggerCreatePrivateConversation(profile.id);
                        setIsOpen(false);
                      }}
                      disabled={isCreatingPrivateConversation}
                      key={profile.id}
                      className="flex items-center gap-2 rounded-md p-2 duration-200 hover:cursor-pointer hover:bg-muted"
                    >
                      <div className="relative">
                        <ChatAvatarStatus
                          size={32}
                          src={profile.avatar}
                          isOnline={isOnline}
                          className="mr-2"
                        />
                      </div>
                      <p>{profile.fullName}</p>
                    </button>
                  ))
                )}
              </div>
            </InfiniteScroller>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchChatMembers;
