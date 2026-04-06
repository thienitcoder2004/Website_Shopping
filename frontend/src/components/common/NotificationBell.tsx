import { useEffect, useState } from "react";
import axios from "../../api/axios.config";
import { socket } from "../../api/socket";

type Noti = {
  _id: string;
  title: string;
  message: string;
};

export default function NotificationBell() {
  const [list, setList] = useState<Noti[]>([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios.get("/notifications").then((res) => setList(res.data));

    axios.get("/notifications/unread").then((res) => setCount(res.data.count));

    const handler = (data: Noti) => {
      setList((prev) => [data, ...prev]);
      setCount((prev) => prev + 1);
    };

    socket.on("new_notification", handler);

    return () => {
      socket.off("new_notification", handler);
    };
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}>
        🔔 {count > 0 && <span>{count}</span>}
      </button>

      {open && (
        <div className="absolute right-0 w-80 bg-white shadow-lg">
          {list.map((n) => (
            <div key={n._id} className="p-3 border-b">
              <b>{n.title}</b>
              <p>{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
