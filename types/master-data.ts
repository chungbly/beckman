export interface Province {
  ProvinceID: number;
  ProvinceName: string;
  CountryID: number;
  Code: string;
  NameExtension: string[];
  IsEnable: number;
  RegionID: number;
  RegionCPN: number;
  UpdatedBy: number;
  CreatedAt: string;
  UpdatedAt: string;
  AreaID: number;
  CanUpdateCOD: boolean;
  Status: number;
  UpdatedIP: string;
  UpdatedEmployee: number;
  UpdatedSource: string;
  UpdatedDate: Date;
}

export interface District {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  Code: string;
  Type: number;
  SupportType: number;
  NameExtension: string[];
  IsEnable: number;
  UpdatedBy: number;
  CreatedAt: string;
  UpdatedAt: string;
  CanUpdateCOD: boolean;
  Status: number;
  PickType: number;
  DeliverType: number;
  WhiteListClient: WhiteListClient;
  WhiteListDistrict: WhiteListDistrict;
  ReasonCode: string;
  ReasonMessage: string;
  OnDates: string;
  UpdatedEmployee: number;
  UpdatedDate: Date;
}

interface WhiteListClient {
  From: any[];
  To: any[];
  Return: any[];
}

interface WhiteListDistrict {
  From: string;
  To: string;
}

export interface Ward {
  WardCode: string;
  DistrictID: number;
  WardName: string;
  NameExtension: string[];
  IsEnable: number;
  CanUpdateCOD: boolean;
  UpdatedBy: number;
  CreatedAt: string;
  UpdatedAt: string;
  SupportType: number;
  PickType: number;
  DeliverType: number;
  WhiteListClient: WhiteListClient;
  WhiteListWard: WhiteListWard;
  Status: number;
  ReasonCode: string;
  ReasonMessage: string;
  OnDates: Date[];
  UpdatedEmployee: number;
  UpdatedDate: Date;
}

interface WhiteListWard {
  From: null;
  To: null;
}
