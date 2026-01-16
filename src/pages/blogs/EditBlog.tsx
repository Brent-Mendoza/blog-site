import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router"
import type { AppDispatch, RootState } from "../../store/store"
import { useEffect, useState } from "react"
import { updateBlog } from "../../store/blogSlice"
import supabaseClient from "../../supabaseClient"

export default function EditBlog() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { blogs, loading, error } = useSelector(
    (state: RootState) => state.blogReducer
  )
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [oldImageUrl, setOldImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const blog = blogs.find((b) => b.id === Number(id))
    if (blog) {
      setTitle(blog.title)
      setContent(blog.content)
      setImagePreview(blog.image_url ?? null)
      setOldImageUrl(blog.image_url ?? null)
    }
  }, [blogs, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let imageUrl: string | null = oldImageUrl

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop()
      const filePath = `blogs/${crypto.randomUUID()}.${fileExt}`

      const { error } = await supabaseClient.storage
        .from("blog-images")
        .upload(filePath, imageFile)

      if (error) {
        alert(error.message)
        return
      }

      const { data } = supabaseClient.storage
        .from("blog-images")
        .getPublicUrl(filePath)

      imageUrl = data.publicUrl

      if (oldImageUrl) {
        const oldPath = oldImageUrl.split("/blog-images/")[1]
        if (oldPath) {
          await supabaseClient.storage.from("blog-images").remove([oldPath])
        }
      }
    }

    if (!imagePreview) {
      imageUrl = null

      if (oldImageUrl) {
        const oldPath = oldImageUrl.split("/blog-images/")[1]
        if (oldPath) {
          await supabaseClient.storage.from("blog-images").remove([oldPath])
        }
      }
    }

    const result = await dispatch(
      updateBlog({
        id: Number(id),
        title,
        content,
        image_url: imageUrl,
      })
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
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Blog Image</label>

          {!imagePreview && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return

                setImageFile(file)
                setImagePreview(URL.createObjectURL(file))
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          )}

          {imagePreview && (
            <div className="relative mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null)
                  setImagePreview(null)
                }}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          )}
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
