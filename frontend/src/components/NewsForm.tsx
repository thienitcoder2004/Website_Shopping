import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createNews, getNewsById, updateNews } from "../api/news.api";

export default function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    content: "",
    author: "",
  });

  const [images, setImages] = useState<FileList | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Load dữ liệu khi edit
  useEffect(() => {
    if (id) {
      getNewsById(id).then((res) => {
        setForm({
          title: res.data.title,
          content: res.data.content,
          author: res.data.author,
        });

        // Set ảnh cũ
        if (res.data.thumbnail) {
          setPreview(`http://localhost:5000${res.data.thumbnail}`);
        }
      });
    }
  }, [id]);

  // Preview ảnh mới khi chọn file
  const handleImageChange = (e: any) => {
    const files = e.target.files;
    setImages(files);

    if (files && files[0]) {
      setPreview(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("author", form.author);

    if (images) {
      Array.from(images).forEach((file) => formData.append("images", file));
    }

    if (id) {
      await updateNews(id, formData);
    } else {
      await createNews(formData);
    }

    navigate("/admin/news");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-6">
      <h2 className="text-2xl font-bold mb-6">
        {id ? "Cập nhật tin tức" : "Thêm tin tức mới"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Tiêu đề</label>
          <input
            type="text"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium mb-2">Tác giả</label>
          <input
            type="text"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium mb-2">Ảnh đại diện</label>

          {preview && (
            <img
              src={preview}
              className="w-40 h-40 object-cover rounded-lg mb-4 border"
            />
          )}

          <input
            type="file"
            multiple
            onChange={handleImageChange}
            className="block"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-2">Nội dung</label>
          <textarea
            className="w-full border rounded-lg p-3 h-40 focus:ring-2 focus:ring-blue-500"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>

        {/* Button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
          {id ? "Cập nhật" : "Thêm mới"}
        </button>
      </form>
    </div>
  );
}
