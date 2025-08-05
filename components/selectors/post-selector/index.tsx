import { APIStatus } from "@/client/callAPI";
import { getPosts } from "@/client/post.client";
import { AutoComplete } from "@/components/ui/auto-complete";
import { Post } from "@/types/post";
import { debounce } from "@/utils/debounce";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function PostSelector<T extends boolean = false>({
  value,
  onChange,
  disabled,
  multiple,
  className,
}: {
  value?: T extends true ? string[] : string;
  onChange?: (value: T extends true ? string[] : string) => void;
  disabled?: boolean;
  multiple?: T;
  className?: string;
}) {
  const [name, setName] = useState("");
  const [selectedPosts, setSelectedPosts] = useState<
    { value: string; label: string }[]
  >([]);
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", name],
    queryFn: async () => {
      const query = {
        title: name,
        isShow: true,
      };
      const res = await getPosts(query, 100, 1, false);
      if (res.status !== APIStatus.OK && !res.data?.length) return [];
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const fetchPosts = async (ids: string[]): Promise<Post[]> => {
    if (!ids.length) return [];
    const res = await getPosts(
      {
        ids,
      },
      ids.length,
      1,
      false
    );
    if (res.status !== APIStatus.OK || !res.data?.length) return [];
    return res.data;
  };

  const handleSetCode = debounce((v: string) => setName(v), 300);

  useEffect(() => {
    if (!value) return;
    const init = async () => {
      if (
        selectedPosts.every((prd) =>
          Array.isArray(value) ? value.includes(prd.value) : value === prd.value
        ) &&
        selectedPosts.length === (Array.isArray(value) ? value.length : 1)
      ) {
        return;
      }
      const vouchers = await fetchPosts(Array.isArray(value) ? value : [value]);
      setSelectedPosts(
        vouchers.map((voucher) => ({
          value: voucher._id,
          label: voucher.title,
        }))
      );
    };
    init();
  }, [value]);

  if (multiple) {
    return (
      <AutoComplete
        className={className}
        disabled={disabled}
        value={selectedPosts}
        onInputChange={(v) => handleSetCode(v)}
        options={(posts ?? [])
          .map((post) => ({
            value: post._id,
            label: post.title,
          }))
          .concat(selectedPosts)
          .reduce((acc, current) => {
            const x = acc.find((item) => item.value === current.value);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, [] as typeof selectedPosts)}
        isLoading={isLoading}
        multiple
        placeholder="Chọn bài viết"
        onChange={(v) => {
          if (!v) {
            onChange?.([] as any);
            setSelectedPosts([]);
            return;
          }
          onChange?.(
            v.map((c) => c.value) as T extends true ? string[] : string
          );
          setSelectedPosts(v);
        }}
      />
    );
  }

  return (
    <AutoComplete
      className={className}
      disabled={disabled}
      value={selectedPosts[0]}
      onInputChange={(v) => handleSetCode(v)}
      options={(posts ?? [])
        .map((post) => ({
          value: post._id,
          label: post.title,
        }))
        .concat(selectedPosts)
        .reduce((acc, current) => {
          const x = acc.find((item) => item.value === current.value);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, [] as typeof selectedPosts)}
      isLoading={isLoading}
      multiple={false}
      placeholder="Chọn bài viết"
      onChange={(v) => {
        if (!v) {
          onChange?.(0 as any);
          setSelectedPosts([]);
          return;
        }
        onChange?.(v.value as T extends true ? string[] : string);
        setSelectedPosts([v]);
      }}
    />
  );
}

export default PostSelector;
