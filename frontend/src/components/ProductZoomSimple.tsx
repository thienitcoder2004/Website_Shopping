import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { TProduct } from "../types/product.type";
import { apiFile } from ".././utils/apiFile"; // sửa path đúng project bạn

type Props = { product: TProduct };

const PREVIEW_SIZE = 420;
const ZOOM = 2.5;

export default function ProductZoomSimple({ product }: Props) {
  const mainRef = useRef<HTMLDivElement | null>(null);

  // ✅ gộp primary + gallery
  const allImages = useMemo(() => {
    const primary = (product as any).primaryImage || "";
    const gallery = product.images || [];
    const list = [primary, ...gallery].filter(Boolean);
    return Array.from(new Set(list));
  }, [product]);

  const [activeImg, setActiveImg] = useState<string>(allImages[0] || "");

  // ✅ khi product đổi (load xong) thì set active về ảnh đầu
  useEffect(() => {
    setActiveImg(allImages[0] || "");
  }, [allImages]);

  const LENS_SIZE = Math.round(PREVIEW_SIZE / ZOOM);

  const [hover, setHover] = useState(false);
  const [lens, setLens] = useState({ x: 0, y: 0 });

  // vị trí preview box trên viewport (fixed)
  const [previewPos, setPreviewPos] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const updatePreviewPos = () => {
    const box = mainRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    setPreviewPos({
      left: rect.right + 24, // cách ảnh 24px
      top: rect.top, // canh top với ảnh
    });
  };

  useEffect(() => {
    if (!hover) return;
    updatePreviewPos();

    const onScroll = () => updatePreviewPos();
    const onResize = () => updatePreviewPos();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [hover]);

  const handleMove = (e: React.MouseEvent) => {
    const box = mainRef.current;
    if (!box) return;

    const rect = box.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    let x = cx - LENS_SIZE / 2;
    let y = cy - LENS_SIZE / 2;

    x = clamp(x, 0, w - LENS_SIZE);
    y = clamp(y, 0, h - LENS_SIZE);

    setLens({ x, y });
  };

  const onEnter = (e: React.MouseEvent) => {
    setHover(true);
    updatePreviewPos();
    handleMove(e);
  };

  const onLeave = () => setHover(false);

  const mainHasImage = !!activeImg;

  const previewTransform = `scale(${ZOOM}) translate(${-lens.x}px, ${-lens.y}px)`;

  return (
    <div>
      {/* MAIN IMAGE */}
      <div
        ref={mainRef}
        onMouseEnter={onEnter}
        onMouseMove={handleMove}
        onMouseLeave={onLeave}
        className="relative border bg-white overflow-hidden cursor-crosshair"
        style={{ width: 520, height: 520 }}
      >
        {mainHasImage ? (
          <img
            src={apiFile(activeImg)}
            alt={product.name}
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        {/* LENS */}
        {hover && mainHasImage && (
          <div
            className="absolute pointer-events-none border border-black/40 bg-white/35"
            style={{
              left: lens.x,
              top: lens.y,
              width: LENS_SIZE,
              height: LENS_SIZE,
            }}
          />
        )}
      </div>

      {/* PREVIEW BOX PORTAL */}
      {hover &&
        mainHasImage &&
        createPortal(
          <div
            className="fixed z-[9999] border-[3px] border-gray-400 bg-white overflow-hidden shadow-2xl"
            style={{
              width: PREVIEW_SIZE,
              height: PREVIEW_SIZE,
              left: previewPos.left,
              top: previewPos.top,
            }}
          >
            <div className="w-full h-full overflow-hidden">
              <img
                src={apiFile(activeImg)}
                alt="preview"
                draggable={false}
                className="w-full h-full object-cover origin-top-left select-none"
                style={{ transform: previewTransform, transition: "none" }}
              />
            </div>
          </div>,
          document.body,
        )}

      {/* thumbnails */}
      <div className="flex gap-2 mt-3">
        {(allImages.length ? allImages : [""]).slice(0, 8).map((src, idx) => (
          <button
            key={`${src}-${idx}`}
            onClick={() => src && setActiveImg(src)}
            className={`w-[72px] h-[72px] border bg-white overflow-hidden rounded-md ${
              src === activeImg ? "border-black border-2" : "border-gray-200"
            }`}
            type="button"
          >
            {src ? (
              <img
                src={apiFile(src)}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-50" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
