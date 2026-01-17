import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import supabaseClient from "../supabaseClient"

interface Comment {
  id: number
  blog_id: number
  comment: string
  image_url: string | null
  created_at: string
  updated_at: string
  user_id: string
  profiles:
    | {
        username: string
      }
    | {
        username: string
      }[]
    | null
}

interface CommentState {
  comments: Comment[]
  loading: boolean
  error: string | null
}

const initialState: CommentState = {
  comments: [],
  loading: true,
  error: null,
}

export const fetchComments = createAsyncThunk(
  "comment/fetchComments",
  async (blogId: number, { rejectWithValue }) => {
    try {
      const { data, error } = await supabaseClient
        .from("comments")
        .select(
          "id, blog_id, comment, created_at, updated_at, image_url, user_id, profiles:profiles!inner(username)"
        )
        .eq("blog_id", blogId)
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const createComment = createAsyncThunk(
  "comment/createComment",
  async (
    {
      blog_id,
      comment,
      image_url,
    }: {
      blog_id: number
      comment: string
      image_url?: string | null
    },
    { rejectWithValue }
  ) => {
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      const { data, error } = await supabaseClient
        .from("comments")
        .insert({
          blog_id,
          comment,
          image_url,
          user_id: user?.id,
        })
        .select()
      if (error) throw error
      return data?.[0]
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateComment = createAsyncThunk(
  "comment/editComment",
  async (
    {
      id,
      comment,
      image_url,
    }: {
      id: number
      comment: string
      image_url?: string | null
    },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabaseClient
        .from("comments")
        .update({
          comment,
          image_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
      if (error) throw error
      return data?.[0]
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteComment = createAsyncThunk(
  "comment/deleteComment",
  async (id: number, { rejectWithValue }) => {
    try {
      const { error } = await supabaseClient
        .from("comments")
        .delete()
        .eq("id", id)
      if (error) throw error
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload
        state.loading = false
        state.error = null
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.comments = []
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(createComment.pending, (state) => {
        state.loading = true
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.comments.unshift(action.payload as Comment)
        state.loading = false
        state.error = null
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(updateComment.pending, (state) => {
        state.loading = true
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.comments = state.comments.map((comment) => {
          if (comment.id === action.payload?.id) {
            return action.payload
          }
          return comment
        })
        state.loading = false
        state.error = null
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(deleteComment.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(
          (comment) => comment.id !== action.meta.arg
        )
        state.loading = false
        state.error = null
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default commentSlice.reducer
