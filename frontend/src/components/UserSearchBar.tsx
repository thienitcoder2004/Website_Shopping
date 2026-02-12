import { UserPlus } from "lucide-react";

export default function UserSearchBar({
  keyword,
  setKeyword,
  onSearch,
  onAdd,
}: any) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-700">Quản lý người dùng</h2>

      <div className="flex gap-3">
        <input
          placeholder="Tìm email hoặc SĐT..."
          className="border px-4 py-2 rounded-lg"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <button
          onClick={onSearch}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          Tìm
        </button>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          <UserPlus size={18} /> Thêm
        </button>
      </div>
    </div>
  );
}
