"use client";

import { useState, useRef } from "react";

export default function ProductRegisterPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      alert("상품명과 가격을 입력해주세요.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    if (remarks) formData.append("remarks", remarks);
    if (file) formData.append("image", file);

    const res = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }

    alert("상품이 등록되었습니다.");
    setName("");
    setPrice("");
    setRemarks("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold gradient-text">상품 등록</h1>
          <p className="mt-2 text-sm text-white/40">새로운 상품 정보를 입력하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white/70">
              상품명
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-dark w-full rounded-xl px-4 py-3"
              placeholder="상품명을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="image" className="mb-1.5 block text-sm font-medium text-white/70">
              첨부파일
            </label>
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="input-dark w-full rounded-xl px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-violet-500/20 file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-violet-400 hover:file:bg-violet-500/30"
            />
          </div>

          <div>
            <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-white/70">
              가격
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="input-dark w-full rounded-xl px-4 py-3"
              placeholder="가격을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="remarks" className="mb-1.5 block text-sm font-medium text-white/70">
              비고
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="input-dark w-full rounded-xl px-4 py-3 resize-none"
              placeholder="비고를 입력하세요"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "등록 중..." : "상품 등록"}
          </button>
        </form>
      </div>
    </div>
  );
}
