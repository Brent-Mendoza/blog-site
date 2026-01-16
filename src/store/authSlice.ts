import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { Session, User } from "@supabase/supabase-js"
import supabaseClient from "../supabaseClient"

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  session: null,
  user: null,
  loading: true,
  error: null,
}

export const checkSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession()
      if (error) throw error
      return session
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

interface SignUpParameters {
  email: string
  password: string
  username: string
}

interface SignInParameters {
  email: string
  password: string
}

export const signUp = createAsyncThunk(
  "auth/signUp",
  async (
    { email, password, username }: SignUpParameters,
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })
      if (error) throw error

      const user = data.user
      if (!user) throw new Error("User not created")

      const { error: profileError } = await supabaseClient
        .from("profiles")
        .insert({
          id: user.id,
          username,
        })

      if (profileError) throw profileError

      return data.session
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const signIn = createAsyncThunk(
  "auth/signIn",
  async ({ email, password }: SignInParameters, { rejectWithValue }) => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data.session
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabaseClient.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.session = action.payload
      state.user = action.payload?.user || null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSession.pending, (state) => {
        state.loading = true
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.session = action.payload
        state.user = action.payload?.user || null
        state.loading = false
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.session = action.payload
        state.user = action.payload?.user || null
        state.loading = false
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.session = action.payload
        state.user = action.payload?.user || null
        state.loading = false
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(signOut.fulfilled, (state) => {
        state.session = null
        state.user = null
        state.loading = false
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setSession, clearError } = authSlice.actions
export default authSlice.reducer
