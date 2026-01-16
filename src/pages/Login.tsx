import { useState, type FormEvent } from "react"
import { useDispatch, useSelector } from "react-redux"
import { type AppDispatch, type RootState } from "../store/store"
import { clearError, signIn } from "../store/authSlice"
import { useNavigate } from "react-router"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector(
    (state: RootState) => state.authReducer
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    await dispatch(signIn({ email: String(email), password: String(password) }))
  }

  return (
    <main className="flex min-h-screen flex-col justify-center items-center px-6 py-12 lg:px-0">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
          Login
        </h2>
      </div>
      <section className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm/6 font-medium">Email Address</label>
            <div className="mt-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-black/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm/6 font-medium ">Password</label>
            <div className="mt-2">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-black/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {error && <p className="text-red-500">{error}</p>}
        </form>
        <p className="mt-2 text-end text-sm/6 text-gray-400">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            Register
          </button>
        </p>
      </section>
    </main>
  )
}
