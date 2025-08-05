import { APIStatus } from "@/client/callAPI";
import { getUsers } from "@/client/user.client";
import { AutoComplete } from "@/components/ui/auto-complete";
import { AdminUser } from "@/types/user";
import { debounce } from "@/utils/debounce";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

function UserSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useQuery({
    queryKey: ["user", search],
    queryFn: async () => {
      const res = await getUsers(
        {
          fullName: search,
        },
        100,
        1,
        false
      );
      if (res.status !== APIStatus.OK || !res.data?.length)
        return [] as AdminUser[];
      return res.data;
    },
  });

  const handleSeach = useCallback(
    debounce((v: string) => setSearch(v), 300),
    []
  );

  return (
    <AutoComplete
      value={
        users?.find((u) => u._id === value)
          ? {
              value: value,
              label: users.find((u) => u._id === value)?.fullName!,
            }
          : undefined
      }
      options={
        users?.map((u) => ({
          value: u._id,
          label: u.fullName,
        })) ?? []
      }
      onInputChange={handleSeach}
      isLoading={isLoading}
      placeholder="Chọn người dùng"
      onChange={(v) => onChange(v.value)}
    />
  );
}

export default UserSelector;
