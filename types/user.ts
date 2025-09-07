export interface AdminUser {
  _id: string;
  deletedAt: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  status: string;
  dateOfBirth?: string;
  gender: string;
  photo: string;
  facebookId: string;
  telegramId: string;
  quote: string;
  permissions: string[];
}
