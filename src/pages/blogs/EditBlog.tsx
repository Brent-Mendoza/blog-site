import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router"
import type { AppDispatch, RootState } from "../../store/store"
import { useEffect, useState } from "react"
import { updateBlog } from "../../store/blogSlice"

export default function EditBlog() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { blogs, loading, error } = useSelector(
    (state: RootState) => state.blogReducer
  )
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    const blog = blogs.find((b) => b.id === Number(id))
    if (blog) {
      setTitle(blog.title)
      setContent(blog.content)
    }
  }, [blogs, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(
      updateBlog({ id: Number(id), title, content })
    )

    if (updateBlog.fulfilled.match(result)) {
      alert("Blog updated successfully")
      navigate("/blogs")
    }
  }
  return (
    <section className="px-10">
      <h2 className="text-2xl font-bold mb-4">Update Blog</h2>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="title">
            Title
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="content">
            Content
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="content"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <button
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Blog"}
        </button>
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </form>
    </section>
  )
}
