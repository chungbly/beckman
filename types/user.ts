export interface AdminUser {
  _id: string;
  deletedAt: string;
  fullName: string;
  email: string;
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
