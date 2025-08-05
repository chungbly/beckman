"use client";;
import { use } from "react";
import { APIStatus } from "@/client/callAPI";
import { getUsers } from "@/client/user.client";
import { Meta } from "@/types/api-response";
import { AdminUser } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import UserFilter from "./user-filter";
import UserTable from "./user-table";
import UserTableSkeleton from "./user-table-skeleton";

function Page(
  props: {
    searchParams: Promise<{
      email?: string;
      phoneNumber?: string;
      fullName?: string;
      status?: string;
      page?: number;
      limit?: number;
    }>;
  }
) {
  const searchParams = use(props.searchParams);
  const { email, phoneNumber, fullName, status, limit, page } = searchParams;
  const { data: data, isLoading } = useQuery({
    queryKey: ["user", email, phoneNumber, fullName, status],
    queryFn: async () => {
      const res = await getUsers(
        {
          email,
          phoneNumber,
          fullName,
          status,
        },
        limit,
        page,
        true
      );
      if (res.status !== APIStatus.OK || !res.data?.items)
        return {} as {
          items: AdminUser[];
          meta: Meta;
        };
      return res.data;
    },
  });
  const users = data?.items || [];
  const meta = data?.meta || {} as Meta;

  return (
    <div className="p-2 sm:p-6 flex flex-col gap-4">
      <UserFilter />
      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <UserTable users={users!} meta={meta!} />
      )}
    </div>
  );
}

export default Page;
