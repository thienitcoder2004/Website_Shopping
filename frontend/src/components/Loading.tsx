import loadingImg from "../assets/images/loading.gif";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <img
        src={loadingImg}
        alt="Loading..."
        className="w-20 h-20 object-contain"
      />
    </div>
  );
}
