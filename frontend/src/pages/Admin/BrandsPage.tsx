import { useEffect, useState } from "react";
import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
} from "../../api/brand.api";

interface Brand {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
}

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    const res = await getBrands();
    setBrands(res.data);
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchBrands();
    };
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    if (editingId) {
      await updateBrand(editingId, { name, description });
      setEditingId(null);
    } else {
      await createBrand({ name, description });
    }

    setName("");
    setDescription("");
    fetchBrands();
  };

  const handleEdit = (brand: Brand) => {
    setEditingId(brand._id);
    setName(brand.name);
    setDescription(brand.description || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá?")) return;
    await deleteBrand(id);
    fetchBrands();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">
          Quản lý thương hiệu
        </h2>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Tên thương hiệu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <input
            type="text"
            placeholder="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <button
            onClick={handleSubmit}
            className={`rounded-lg px-4 py-2 text-white font-medium transition ${
              editingId
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {editingId ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-600 text-left">
                <th className="p-3">Tên</th>
                <th className="p-3">Mô tả</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center p-6">
                    Đang tải...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-6 text-gray-400">
                    Chưa có thương hiệu nào
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr
                    key={brand._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium">{brand.name}</td>
                    <td className="p-3 text-gray-600">{brand.description}</td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(brand._id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BrandsPage;
