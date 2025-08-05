import { Meta } from "@/types/api-response";
import { AdminUser } from "@/types/user";
import { callAPI } from "./callAPI";

interface AdminUserWithMeta {
  items: AdminUser[];
  meta: Meta;
}

type TypeQuery = true | false;

type ObjectType<T> = T extends true
  ? AdminUserWithMeta
  : T extends false
  ? AdminUser[]
  : never;

export const getUsers = async <T extends TypeQuery>(
  query: {
    email?: string;
    phoneNumber?: string;
    fullName?: string;
    status?: string;
  },
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return await callAPI<ObjectType<T>>(`/api/admin`, {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};

export const getUserById = async (id: string) => {
  return await callAPI<AdminUser>(`/api/admin/${id}`);
};

export const updateUser = async (id: string, data: Partial<AdminUser>) => {
  delete data._id;
  delete data.deletedAt;
  delete data.email;

  return await callAPI<AdminUser>(`/api/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const createUser = async (data: Partial<AdminUser>) => {
  return await callAPI<AdminUser>(`/api/admin`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};
