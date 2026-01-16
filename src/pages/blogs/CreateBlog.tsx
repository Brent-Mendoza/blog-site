import { useNavigate } from "react-router"
import type { AppDispatch, RootState } from "../../store/store"
import { useDispatch, useSelector } from "react-redux"
import { createBlog } from "../../store/blogSlice"
import { useState } from "react"
import supabaseClient from "../../supabaseClient"

export default function CreateBlog() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector(
    (state: RootState) => state.blogReducer
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let imageUrl: string | null = null

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `blogs/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabaseClient.storage
        .from("blog-images")
        .upload(fileName, imageFile)

      if (uploadError) {
        alert("Image upload failed")
        return
      }

      const { data } = supabaseClient.storage
        .from("blog-images")
        .getPublicUrl(fileName)

      imageUrl = data.publicUrl
    }

    const result = await dispatch(
      createBlog({
        title,
        content,
        image_url: imageUrl,
      })
    )

    if (createBlog.fulfilled.match(result)) {
      alert("Blog created successfully")
      navigate("/blogs")
    }
  }

  return (
    <section className="px-10">
      <h2 className="text-2xl font-bold mb-4">Create Blogs</h2>
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
          {loading ? "Creating..." : "Create Blog"}
        </button>
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </form>
    </section>
  )
}
