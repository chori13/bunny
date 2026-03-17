"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [remarks, setRemarks] = useState("");
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setName(data.name);
        setPrice(String(data.price));
        setRemarks(data.remarks || "");
        setCurrentImage(data.image);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [id]);

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

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }

    alert("상품이 수정되었습니다.");
    router.push("/products");
    router.refresh();
  };

  if (fetching) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold gradient-text">상품 수정</h1>
          <p className="mt-2 text-sm text-white/40">상품 정보를 수정하세요</p>
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
            {currentImage && !file && (
              <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-lg border border-white/10">
                <Image src={currentImage} alt="현재 이미지" fill sizes="96px" className="object-cover" />
              </div>
            )}
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
