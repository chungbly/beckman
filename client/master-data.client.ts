import { District, Province, Ward } from "@/types/master-data";
import { APIStatus } from "./callAPI";

export const getProvinces = async (): Promise<{
  status: APIStatus;
  message: string;
  data: Province[];
}> => {
  try {
    const res = await fetch(
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
      {
        headers: {
          token: process.env.NEXT_PUBLIC_GHN_TOKEN!,
        },
      }
    );
    const data = await res.json();
    if (data.code !== 200) {
      return {
        status: APIStatus.NOT_FOUND,
        message: data.message,
        data: [],
      };
    }
    return {
      status: APIStatus.OK,
      message: data.message,
      data: data.data,
    };
  } catch (e) {
    return {
      status: APIStatus.NOT_FOUND,
      message: (
        e as unknown as {
          message: string;
        }
      ).message,
      data: [],
    };
  }
};

export const getDistricts = async (
  provinceId: number
): Promise<{
  status: APIStatus;
  message: string;
  data: District[];
}> => {
  try {
    const res = await fetch(
      `https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provinceId}`,
      {
        headers: {
          token: process.env.NEXT_PUBLIC_GHN_TOKEN!,
        },
      }
    );
    const data = await res.json();
    if (data.code !== 200) {
      return {
        status: APIStatus.NOT_FOUND,
        message: data.message,
        data: [],
      };
    }
    return {
      status: APIStatus.OK,
      message: data.message,
      data: data.data,
    };
  } catch (e) {
    return {
      status: APIStatus.NOT_FOUND,
      message: (
        e as unknown as {
          message: string;
        }
      ).message,
      data: [],
    };
  }
};

export const getWards = async (
  districtId: number
): Promise<{
  status: APIStatus;
  message: string;
  data: Ward[];
}> => {
  try {
    const res = await fetch(
      `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtId}`,
      {
        headers: {
          token: process.env.NEXT_PUBLIC_GHN_TOKEN!,
        },
      }
    );
    const data = await res.json();
    if (data.code !== 200) {
      return {
        status: APIStatus.NOT_FOUND,
        message: data.message,
        data: [],
      };
    }
    return {
      status: APIStatus.OK,
      message: data.message,
      data: data.data,
    };
  } catch (e) {
    return {
      status: APIStatus.NOT_FOUND,
      message: (
        e as unknown as {
          message: string;
        }
      ).message,
      data: [],
    };
  }
};
