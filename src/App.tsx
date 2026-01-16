import { useEffect } from "react"
import supabaseClient from "./supabaseClient.ts"
import { Navigate, Route, Routes } from "react-router"
import Login from "./pages/Login.tsx"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "./store/store.ts"
import { checkSession, setSession } from "./store/authSlice.ts"
import Register from "./pages/Register.tsx"
import BlogPage from "./pages/blogs/BlogsPage.tsx"
import BlogLayout from "./pages/BlogsLayout.tsx"
import CreateBlog from "./pages/blogs/CreateBlog.tsx"
import EditBlog from "./pages/blogs/EditBlog.tsx"

function App() {
  const dispatch = useDispatch<AppDispatch>()

  const { session, loading } = useSelector(
    (state: RootState) => state.authReducer
  )

  useEffect(() => {
    dispatch(checkSession())

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session))
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  if (loading) {
    return <div className="animation-spin">Loading...</div>
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/blogs" /> : <Login />}
      />
      <Route
        path="/register"
        element={session ? <Navigate to="/blogs" /> : <Register />}
      />
      <Route path="/blogs" element={<BlogLayout />}>
        <Route index element={<BlogPage />} />
        <Route path="create" element={<CreateBlog />} />
        <Route path=":id/edit" element={<EditBlog />} />
      </Route>
      <Route path="/" element={<Navigate to="/blogs" />} />
      <Route path="*" element={<Navigate to="/blogs" />} />
    </Routes>
  )
}

export default App
