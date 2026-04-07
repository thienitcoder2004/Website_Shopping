import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createNews, getNewsById, updateNews } from "../../api/news.api";

type NewsFormState = {
  title: string;
  content: string;
  author: string;
};

type NewsResponseData = {
  _id?: string;
  title?: string;
  content?: string;
  author?: string;
  thumbnail?: string;
};

const API_BASE = "http://localhost:5000";

export default function NewsForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<NewsFormState>({
    title: "",
    content: "",
    author: "",
  });

  const [images, setImages] = useState<FileList | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchNewsDetail() {
      if (!id) return;

      try {
        const res = await getNewsById(id);
        const data: NewsResponseData =
          res.data?.data || res.data || {};

        if (!isMounted) return;

        setForm({
          title: data.title || "",
          content: data.content || "",
          author: data.author || "",
        });

        if (data.thumbnail) {
          setPreview(
            data.thumbnail.startsWith("http")
              ? data.thumbnail
              : `${API_BASE}${data.thumbnail}`,
          );
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết tin tức:", error);
      }
    }

    fetchNewsDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setImages(files);

    if (files && files[0]) {
      setPreview(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("author", form.author);

    if (images) {
      Array.from(images).forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      if (id) {
        await updateNews(id, formData);
      } else {
        await createNews(formData);
      }

      navigate("/admin/news");
    } catch (error) {
      console.error("Lỗi lưu tin tức:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-6">
      <h2 className="text-2xl font-bold mb-6">
        {id ? "Cập nhật tin tức" : "Thêm tin tức mới"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Tiêu đề</label>
          <input
            type="text"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tác giả</label>
          <input
            type="text"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ảnh đại diện</label>

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mb-4 h-40 w-40 rounded-lg border object-cover"
            />
          )}

          <input
            type="file"
            multiple
            onChange={handleImageChange}
            className="block"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nội dung</label>
          <textarea
            className="w-full border rounded-lg p-3 h-40 focus:ring-2 focus:ring-blue-500"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
          {id ? "Cập nhật" : "Thêm mới"}
        </button>
      </form>
    </div>
  );
}