import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router"
import type { AppDispatch, RootState } from "../../store/store"
import { useEffect, useState } from "react"
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from "../../store/commentSlice"
import supabaseClient from "../../supabaseClient"

export default function ViewBlog() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { blogs } = useSelector((state: RootState) => state.blogReducer)
  const { comments, loading: commentLoading } = useSelector(
    (state: RootState) => state.commentReducer
  )
  const { user } = useSelector((state: RootState) => state.authReducer)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [createdAt, setCreatedAt] = useState("")
  const [updatedAt, setUpdatedAt] = useState("")

  const [commentContent, setCommentContent] = useState("")
  const [commentImage, setCommentImage] = useState<File | null>(null)
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(
    null
  )
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [uploadingComment, setUploadingComment] = useState(false)
  const [deletingComment, setDeletingComment] = useState(false)

  useEffect(() => {
    const blog = blogs.find((b) => b.id === Number(id))
    if (blog) {
      setTitle(blog.title)
      setContent(blog.content)
      setImagePreview(blog.image_url ?? null)
      setCreatedAt(
        new Date(blog.created_at).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      )
      setUpdatedAt(
        new Date(blog.updated_at).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      )
    } else {
      navigate("/blogs")
    }
  }, [blogs, id])

  useEffect(() => {
    if (id) {
      dispatch(fetchComments(Number(id)))
    }
  }, [id, dispatch])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCommentImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCommentImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const filePath = `comments/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabaseClient.storage
        .from("blog-images")
        .upload(filePath, file)

      if (uploadError) {
        alert("Image upload failed")
        return null
      }

      const { data } = supabaseClient.storage
        .from("blog-images")
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Image upload failed")
      return null
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!commentContent.trim()) {
      alert("Please enter a comment")
      return
    }

    setUploadingComment(true)

    try {
      let imageUrl: string | null = null
      const currentComment = comments.find((c) => c.id === editingCommentId)
      const oldImageUrl = currentComment?.image_url || null

      if (commentImage) {
        imageUrl = await uploadImage(commentImage)

        if (!imageUrl) {
          setUploadingComment(false)
          return
        }

        if (editingCommentId && oldImageUrl) {
          const oldPath = oldImageUrl.split("/blog-images/")[1]
          if (oldPath) {
            await supabaseClient.storage.from("blog-images").remove([oldPath])
          }
        }
      } else if (editingCommentId) {
        imageUrl = commentImagePreview
      }

      if (editingCommentId && !commentImagePreview && oldImageUrl) {
        const oldPath = oldImageUrl.split("/blog-images/")[1]
        if (oldPath) {
          await supabaseClient.storage.from("blog-images").remove([oldPath])
        }
        imageUrl = null
      }

      if (editingCommentId) {
        const result = await dispatch(
          updateComment({
            id: editingCommentId,
            comment: commentContent,
            image_url: imageUrl,
          })
        )

        if (updateComment.fulfilled.match(result)) {
          alert("Comment updated successfully")
        }
      } else {
        const result = await dispatch(
          createComment({
            blog_id: Number(id),
            comment: commentContent,
            image_url: imageUrl,
          })
        )

        if (createComment.fulfilled.match(result)) {
          alert("Comment added successfully")
        }
      }

      setCommentContent("")
      setCommentImage(null)
      setCommentImagePreview(null)
      setEditingCommentId(null)

      dispatch(fetchComments(Number(id)))
    } catch (error) {
      console.error("Error submitting comment:", error)
      alert("Failed to submit comment")
    } finally {
      setUploadingComment(false)
    }
  }

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id)
    setCommentContent(comment.comment)
    setCommentImagePreview(comment.image_url)
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
  }

  const handleDeleteComment = async (commentId: number) => {
    setDeletingComment(true)
    try {
      const comment = comments.find((c) => c.id === commentId)

      if (comment?.image_url) {
        const imagePath = comment.image_url.split("/blog-images/")[1]
        if (imagePath) {
          await supabaseClient.storage.from("blog-images").remove([imagePath])
        }
      }

      const result = await dispatch(deleteComment(commentId))

      if (deleteComment.fulfilled.match(result)) {
        alert("Comment deleted successfully")
        dispatch(fetchComments(Number(id)))
      }

      setDeletingComment(false)
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Failed to delete comment")
      setDeletingComment(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setCommentContent("")
    setCommentImage(null)
    setCommentImagePreview(null)
  }

  return (
    <section className="px-10">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-xs text-gray-500">Posted: {createdAt}</p>
      {updatedAt !== createdAt && (
        <p className="text-xs text-gray-500">Updated: {updatedAt}</p>
      )}
      <p className="mb-4 mt-4">{content}</p>

      {imagePreview && (
        <img
          src={imagePreview}
          alt={title}
          className="h-150 object-contain mb-8"
        />
      )}

      <hr className="my-8" />

      {/* Comments Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Comments ({comments.length})</h3>

        {commentLoading && <p>Loading comments...</p>}

        {!commentLoading && comments.length === 0 && (
          <p className="text-gray-500 mb-6">
            No comments yet. Be the first to comment!
          </p>
        )}

        {!commentLoading && comments.length > 0 && (
          <div className="space-y-4 mb-8">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 border rounded bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-sm">
                    {Array.isArray(comment.profiles)
                      ? comment.profiles?.[0]?.username
                      : comment.profiles?.username ?? "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {comment.created_at == comment.updated_at
                      ? new Date(comment.created_at).toLocaleDateString(
                          "en-PH",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : new Date(comment.updated_at).toLocaleDateString(
                          "en-PH",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                  </p>
                </div>

                <p className="text-gray-700 mb-2">{comment.comment}</p>

                {comment.image_url && (
                  <img
                    src={comment.image_url}
                    alt="Comment attachment"
                    className="max-h-64 object-contain rounded mb-2"
                  />
                )}

                {comment.updated_at !== comment.created_at && (
                  <p className="text-xs text-gray-400 italic">Edited</p>
                )}

                {user?.id === comment.user_id && (
                  <div className="mt-2">
                    <button
                      className="mr-2 text-sm text-indigo-600 hover:text-indigo-800 hover:underline duration-300 cursor-pointer"
                      onClick={() => handleEditComment(comment)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-sm text-red-600 hover:text-red-800 hover:underline duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingComment}
                    >
                      {deletingComment ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/*  Comment Form */}

        <form
          onSubmit={handleSubmitComment}
          className="border rounded p-4 bg-white"
        >
          <h4 className="font-semibold mb-3">
            {editingCommentId ? "Edit Comment" : "Add a Comment"}
          </h4>

          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write your comment..."
            className="w-full p-2 border rounded mb-3 min-h-24"
            disabled={uploadingComment}
          />

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Add Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={uploadingComment}
            />
          </div>

          {commentImagePreview && (
            <div className="mb-3">
              <img
                src={commentImagePreview}
                alt="Preview"
                className="max-h-48 object-contain rounded"
              />
              <button
                type="button"
                onClick={() => {
                  setCommentImage(null)
                  setCommentImagePreview(null)
                }}
                className="text-sm text-red-600 mt-1"
                disabled={uploadingComment}
              >
                Remove image
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploadingComment}
            >
              {uploadingComment
                ? "Submitting..."
                : editingCommentId
                ? "Update Comment"
                : "Post Comment"}
            </button>

            {editingCommentId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded bg-gray-400 px-4 py-2 text-sm text-white hover:bg-gray-500"
                disabled={uploadingComment}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
