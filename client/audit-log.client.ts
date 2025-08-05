import { Meta } from "@/types/api-response";
import { callAPI } from "./callAPI";

export interface AuditLog {
  _id: {
    $oid: string;
  };
  userId: string;
  action: string;
  resource: string;
  success: boolean;
  resourceId: string;
  before: any;
  after: any;
  createdAt?: Date;
}

export interface AuditLogWithMeta {
  items: AuditLog[];
  meta: Meta;
}

type TypeQuery = true | false;

type ObjectType<T> = T extends true
  ? AuditLogWithMeta
  : T extends false
  ? AuditLog[]
  : never;

export type GetAuditLogQuery = {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
};

export const getAuditLogs = async <T extends boolean = false>(
  query?: Partial<GetAuditLogQuery>,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return await callAPI<ObjectType<T>>("/api/audit-logs", {
    query: {
      q: JSON.stringify(query),
      page,
      limit,
      getTotal,
    },
    next: {
      revalidate: 0,
    },
  });
};

export const getAuditLog = async (id: string) => {
  return await callAPI<AuditLog>(`/api/audit-logs/${id}`, {
    next: {
      revalidate: 0,
    },
  });
};
