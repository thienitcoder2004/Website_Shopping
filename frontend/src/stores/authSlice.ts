import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";

interface User {
  id?: string;
  _id?: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  shoppingPreference?: "male" | "female" | "both";
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

type AuthResponse = {
  user: User;
  token: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  shoppingPreference: "male" | "female" | "both";
};

type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  shoppingPreference?: "male" | "female" | "both";
};

type UpdateProfileResponse = {
  ok?: boolean;
  message: string;
  user: User;
};

function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeUser(user: User | null): User | null {
  if (!user) return null;

  return {
    ...user,
    role: String(user.role || "user").toLowerCase(),
  };
}

function getAxiosErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof err.message === "string" && err.message.trim()) {
      return err.message;
    }
  }

  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

function getProfileEndpointByRole(role?: string) {
  const normalizedRole = String(role || "").toLowerCase();
  return normalizedRole === "staff" || normalizedRole === "admin"
    ? "http://localhost:5000/api/staff/me"
    : "http://localhost:5000/api/users/me";
}

const initialState: AuthState = {
  user: normalizeUser(safeParseJSON<User>(localStorage.getItem("user"))),
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

export const login = createAsyncThunk<
  AuthResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post<AuthResponse>(
      "http://localhost:5000/api/auth/login",
      data,
    );
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getAxiosErrorMessage(err, "Đăng nhập thất bại"));
  }
});

export const register = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post<AuthResponse>(
      "http://localhost:5000/api/auth/register",
      data,
    );
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getAxiosErrorMessage(err, "Đăng ký thất bại"));
  }
});

export const updateProfile = createAsyncThunk<
  UpdateProfileResponse,
  UpdateProfilePayload,
  { state: { auth: AuthState }; rejectValue: string }
>("auth/updateProfile", async (data, { getState, rejectWithValue }) => {
  try {
    const state = getState().auth;
    const token = state.token;

    if (!token) {
      return rejectWithValue("Bạn chưa đăng nhập");
    }

    const endpoint = getProfileEndpointByRole(state.user?.role);

    const res = await axios.put<UpdateProfileResponse>(endpoint, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(
      getAxiosErrorMessage(err, "Cập nhật thông tin thất bại"),
    );
  }
});

export const getProfile = createAsyncThunk<
  { user: User },
  void,
  { state: { auth: AuthState }; rejectValue: string }
>("auth/getProfile", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState().auth;
    const token = state.token;

    if (!token) {
      return rejectWithValue("Bạn chưa đăng nhập");
    }

    const endpoint = getProfileEndpointByRole(state.user?.role);

    const res = await axios.get<{ ok?: boolean; user: User }>(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { user: res.data.user };
  } catch (err: unknown) {
    return rejectWithValue(
      getAxiosErrorMessage(err, "Lấy thông tin tài khoản thất bại"),
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = normalizeUser(action.payload.user);
          state.token = action.payload.token;
          state.error = null;

          localStorage.setItem("token", action.payload.token);
          localStorage.setItem("user", JSON.stringify(state.user));
        },
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Đăng nhập thất bại";
      })

      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        register.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = normalizeUser(action.payload.user);
          state.token = action.payload.token;
          state.error = null;

          localStorage.setItem("token", action.payload.token);
          localStorage.setItem("user", JSON.stringify(state.user));
        },
      )
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Đăng ký thất bại";
      })

      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getProfile.fulfilled,
        (state, action: PayloadAction<{ user: User }>) => {
          state.loading = false;
          state.user = normalizeUser(action.payload.user);
          state.error = null;

          localStorage.setItem("user", JSON.stringify(state.user));
        },
      )
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Lấy thông tin tài khoản thất bại";
      })

      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<UpdateProfileResponse>) => {
          state.loading = false;
          state.user = normalizeUser(action.payload.user);
          state.error = null;

          localStorage.setItem("user", JSON.stringify(state.user));
        },
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Cập nhật thông tin thất bại";
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;