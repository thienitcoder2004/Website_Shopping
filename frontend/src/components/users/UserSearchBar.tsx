import { UserPlus } from "lucide-react";

type UserSearchBarProps = {
  keyword: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
  onSearch: () => void | Promise<void>;
  onAdd: () => void;
};

export default function UserSearchBar({
  keyword,
  setKeyword,
  onSearch,
  onAdd,
}: UserSearchBarProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-700">Quản lý người dùng</h2>

      <div className="flex gap-3">
        <input
          placeholder="Tìm email hoặc SĐT..."
          className="border px-4 py-2 rounded-lg"
          value={keyword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setKeyword(e.target.value)
          }
        />

        <button
          type="button"
          onClick={() => void onSearch()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          Tìm
        </button>

        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          <UserPlus size={18} /> Thêm
        </button>
      </div>
    </div>
  );
}
