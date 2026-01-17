import { Navigate, Outlet, useNavigate } from "react-router"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../store/store"
import { signOut } from "../store/authSlice"

export default function BlogLayout() {
  const dispatch = useDispatch<AppDispatch>()
  const { session } = useSelector((state: RootState) => state.authReducer)
  const navigate = useNavigate()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = async () => {
    await dispatch(signOut())
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1
          className="text-xl font-semibold cursor-pointer hover:underline hover:tracking-wider duration-300"
          onClick={() => navigate("/blogs")}
        >
          Simple Blog Site
        </h1>

        <button
          onClick={handleLogout}
          className="rounded bg-indigo-500 px-3 py-1.5 text-sm text-white hover:bg-indigo-400 cursor-pointer"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 p-6 justify-center items-center">
        <Outlet />
      </main>
    </div>
  )
}
