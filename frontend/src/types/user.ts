export type UserRole = "admin" | "staff" | "user";

export type TUser = {
  _id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UserRow = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export type EditableUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
};