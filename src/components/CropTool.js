"use client";

import { useState, useRef, useEffect } from "react";

function solveAffine(src, dst) {
  const [p0, p1, p2] = src;
  const [q0, q1, q2] = dst;
  const denom = p0.x * (p1.y - p2.y) - p1.x * (p0.y - p2.y) + p2.x * (p0.y - p1.y);

  const solveFor = (v0, v1, v2) => {
    const a = (v0 * (p1.y - p2.y) - v1 * (p0.y - p2.y) + v2 * (p0.y - p1.y)) / denom;
    const b = (p0.x * (v1 - v2) - p1.x * (v0 - v2) + p2.x * (v0 - v1)) / denom;
    const c = (p0.x * (p1.y * v2 - p2.y * v1) - p1.x * (p0.y * v2 - p2.y * v0) + p2.x * (p0.y * v1 - p1.y * v0)) / denom;
    return { a, b, c };
  };

  const X = solveFor(q0.x, q1.x, q2.x);
  const Y = solveFor(q0.y, q1.y, q2.y);

  return { a: X.a, b: Y.a, c: X.b, d: Y.b, e: X.c, f: Y.c };
}

function drawTriangle(ctx, img, srcTri, dstTri) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dstTri[0].x, dstTri[0].y);
  ctx.lineTo(dstTri[1].x, dstTri[1].y);
  ctx.lineTo(dstTri[2].x, dstTri[2].y);
  ctx.closePath();
  ctx.clip();
  const { a, b, c, d, e, f } = solveAffine(srcTri, dstTri);
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

export default function CropTool({ file, onDone, onCancel }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [corners, setCorners] = useState([
    { x: 0.08, y: 0.08 },
    { x: 0.92, y: 0.08 },
    { x: 0.92, y: 0.92 },
    { x: 0.08, y: 0.92 },
  ]);
  const [dragIndex, setDragIndex] = useState(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handlePointerMove = (e) => {
    if (dragIndex === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));
    setCorners((prev) => prev.map((c, i) => (i === dragIndex ? { x, y } : c)));
  };

  const handlePointerUp = () => setDragIndex(null);

  const handleApply = () => {
    const img = imgRef.current;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    const src = corners.map((c) => ({ x: c.x * nw, y: c.y * nh }));
    const [TL, TR, BR, BL] = src;

    const topW = Math.hypot(TR.x - TL.x, TR.y - TL.y);
    const bottomW = Math.hypot(BR.x - BL.x, BR.y - BL.y);
    const leftH = Math.hypot(BL.x - TL.x, BL.y - TL.y);
    const rightH = Math.hypot(BR.x - TR.x, BR.y - TR.y);

    const outW = Math.round(Math.max(topW, bottomW));
    const outH = Math.round(Math.max(leftH, rightH));

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");

    drawTriangle(ctx, img, [TL, TR, BL], [{ x: 0, y: 0 }, { x: outW, y: 0 }, { x: 0, y: outH }]);
    drawTriangle(ctx, img, [BR, TR, BL], [{ x: outW, y: outH }, { x: outW, y: 0 }, { x: 0, y: outH }]);

    canvas.toBlob(
      (blob) => {
        const croppedFile = new File([blob], file.name, { type: "image/jpeg" });
        onDone(croppedFile);
      },
      "image/jpeg",
      0.95
    );
  };

  if (!imgSrc) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <p style={{ color: "white", fontSize: "0.9rem", marginBottom: "0.75rem", textAlign: "center" }}>
        Drag the corners to match the document edges
      </p>
      <div
        ref={containerRef}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{ position: "relative", maxWidth: "90vw", maxHeight: "60vh", touchAction: "none" }}
      >
        <img
          ref={imgRef}
          src={imgSrc}
          alt="To crop"
          onLoad={(e) => setNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
          style={{ maxWidth: "90vw", maxHeight: "60vh", display: "block" }}
        />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <polygon
            points={corners.map((c) => `${c.x * 100},${c.y * 100}`).join(" ")}
            fill="rgba(26,86,219,0.2)"
            stroke="#1a56db"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {corners.map((c, i) => (
          <div
            key={i}
            onMouseDown={() => setDragIndex(i)}
            onTouchStart={() => setDragIndex(i)}
            style={{
              position: "absolute",
              left: `${c.x * 100}%`,
              top: `${c.y * 100}%`,
              width: "24px",
              height: "24px",
              marginLeft: "-12px",
              marginTop: "-12px",
              backgroundColor: "#1a56db",
              border: "3px solid white",
              borderRadius: "50%",
              cursor: "grab",
              touchAction: "none",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
        <button
          onClick={onCancel}
          style={{ padding: "0.7rem 1.25rem", backgroundColor: "#666", color: "white", border: "none", borderRadius: "6px", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer" }}
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          style={{ padding: "0.7rem 1.25rem", backgroundColor: "#1a56db", color: "white", border: "none", borderRadius: "6px", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer" }}
        >
          Apply Crop
        </button>
      </div>
    </div>
  );
}