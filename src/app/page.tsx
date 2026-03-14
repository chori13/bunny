"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-2xl font-bold">상품 등록</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              상품명
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="상품명을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="image" className="mb-1 block text-sm font-medium text-gray-700">
              첨부파일
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-orange-50 file:px-4 file:py-1 file:text-sm file:font-medium file:text-orange-500 hover:file:bg-orange-100"
            />
          </div>

          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium text-gray-700">
              가격
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="가격을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="remarks" className="mb-1 block text-sm font-medium text-gray-700">
              비고
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="비고를 입력하세요"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 py-2.5 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "등록 중..." : "상품 등록"}
          </button>
        </form>
      </div>
    </div>
  );
}
