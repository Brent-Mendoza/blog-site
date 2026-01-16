import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../store/store"
import { useEffect, useState } from "react"
import { deleteBlog, fetchBlogs } from "../../store/blogSlice"
import { useNavigate } from "react-router"

export default function BlogPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, user } = useSelector(
    (state: RootState) => state.authReducer
  )

  const { blogs, loading: blogLoading } = useSelector(
    (state: RootState) => state.blogReducer
  )
  const navigate = useNavigate()

  const [page, setPage] = useState(0)

  useEffect(() => {
    dispatch(fetchBlogs(page))
  }, [page, dispatch])

  if (loading) {
    return <div>Loading...</div>
  }

  if (blogLoading) {
    return <div>Loading...</div>
  }

  console.log(blogs)
  return (
    <section className="px-10">
      <h2 className="text-2xl font-bold mb-4">
        Hi {user?.user_metadata.username}
      </h2>
      <button
        className="rounded bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-700 cursor-pointer mb-5"
        onClick={() => navigate("/blogs/create")}
      >
        Add
      </button>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {blogs.length === 0 && <h3 className="text-2xl mt-4">No blogs found</h3>}
      {blogs.length > 0 &&
        blogs.map((blog) => (
          <div key={blog.id} className="mb-6 p-4 border rounded">
            <h2 className="text-xl font-bold mb-2">
              From:{" "}
              {Array.isArray(blog.profiles)
                ? blog.profiles?.[0]?.username
                : blog.profiles?.username ?? "Unknown User"}
            </h2>
            <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
            <p className="text-gray-700 mb-2">{blog.content}</p>
            {blog.image_url && (
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full max-h-150 object-contain mb-2 rounded"
              />
            )}
            <p className="text-xs text-gray-500">
              Posted{" "}
              {new Date(blog.created_at).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
              })}
            </p>

            {blog.updated_at !== blog.created_at && (
              <p className="text-xs text-gray-500">
                Updated{" "}
                {new Date(blog.updated_at).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZoneName: "short",
                })}
              </p>
            )}
            {user?.id === blog.user_id && (
              <div className="">
                <button
                  className="mt-2 mr-2 rounded bg-green-700 px-3 py-1.5 text-sm text-white hover:bg-green-400 cursor-pointer"
                  onClick={() => navigate(`/blogs/${blog.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="mt-2 rounded bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    await dispatch(deleteBlog(blog.id))
                    alert("Blog deleted successfully")
                    setPage(0)
                    await dispatch(fetchBlogs(page))
                  }}
                  disabled={blogLoading}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      {blogs.length > 0 && (
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="rounded bg-indigo-500 px-3 py-1.5 text-sm text-white hover:bg-indigo-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={blogs.length < 3}
            className="rounded bg-indigo-500 px-3 py-1.5 text-sm text-white hover:bg-indigo-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}
