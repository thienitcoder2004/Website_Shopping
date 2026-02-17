import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  address?: string;
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

type LoginPayload = { email: string; password: string };

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getAxiosErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof err.message === "string" && err.message.trim()) return err.message;
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

const initialState: AuthState = {
  user: safeParseJSON<User>(localStorage.getItem("user")),
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
      data
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
      data
    );
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(getAxiosErrorMessage(err, "Đăng ký thất bại"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    /* LOGIN */
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;

      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    });

    builder.addCase(
      login.rejected,
      (state, action: PayloadAction<string | undefined> & { error: { message?: string } }) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message ?? "Đăng nhập thất bại";
      }
    );

    /* REGISTER */
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;

      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    });

    builder.addCase(
      register.rejected,
      (state, action: PayloadAction<string | undefined> & { error: { message?: string } }) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message ?? "Đăng ký thất bại";
      }
    );
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
