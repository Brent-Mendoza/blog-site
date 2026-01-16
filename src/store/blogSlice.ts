import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import supabaseClient from "../supabaseClient"

interface Blog {
  id: number
  title: string
  content: string
  user_id: string
  created_at: string
  updated_at: string
  profiles:
    | {
        username: string
      }
    | {
        username: string
      }[]
    | null
}

interface BlogState {
  blogs: Blog[]
  loading: boolean
  error: string | null
}

const initialState: BlogState = {
  blogs: [],
  loading: true,
  error: null,
}

export const fetchBlogs = createAsyncThunk(
  "blog/fetchBlogs",
  async (page: number, { rejectWithValue }) => {
    try {
      const { data, error } = await supabaseClient
        .from("blogs")
        .select(
          "id, title, content, user_id, created_at, updated_at, profiles:profiles!inner(username)"
        )
        .order("created_at", { ascending: false })
        .range(page * 3, page * 3 + 9)
        .limit(3)
      if (error) throw error
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const createBlog = createAsyncThunk(
  "blog/createBlog",
  async (
    { title, content }: { title: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      const { data, error } = await supabaseClient
        .from("blogs")
        .insert([{ title, content, user_id: user?.id }])
        .select()
      if (error) throw error
      return data?.[0]
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteBlog = createAsyncThunk(
  "blog/deleteBlog",
  async (id: number, { rejectWithValue }) => {
    try {
      const { error } = await supabaseClient.from("blogs").delete().eq("id", id)
      if (error) throw error
      return id
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateBlog = createAsyncThunk(
  "blog/updateBlog",
  async (
    { id, title, content }: { id: number; title: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabaseClient
        .from("blogs")
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
      if (error) throw error
      return data?.[0]
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.blogs = action.payload
        state.loading = false
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(createBlog.pending, (state) => {
        state.loading = true
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.blogs.unshift(action.payload as Blog)
        state.loading = false
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter((blog) => blog.id !== action.payload)
        state.loading = false
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(updateBlog.pending, (state) => {
        state.loading = true
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        const index = state.blogs.findIndex(
          (blog) => blog.id === action.payload?.id
        )
        state.blogs[index] = action.payload as Blog
        state.loading = false
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default blogSlice.reducer
