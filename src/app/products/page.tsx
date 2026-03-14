export default function ProductsPage() {
  // TODO: DB에서 상품 목록 조회
  const products = [
    {
      id: "1",
      name: "프리미엄 티모시건초 1kg",
      price: 15000,
      image: null,
      slug: "premium-timothy-hay",
    },
    {
      id: "2",
      name: "토끼 전용 펠릿 사료 2kg",
      price: 22000,
      image: null,
      slug: "rabbit-pellet-food",
    },
    {
      id: "3",
      name: "당근 스틱 간식",
      price: 5000,
      image: null,
      slug: "carrot-stick-snack",
    },
  ];

  return (





    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">전체 상품</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <a
            key={product.id}
            href={`/products/${product.id}`}
            className="group rounded-xl border border-gray-200 p-4 transition hover:shadow-md"
          >
            <div className="mb-3 flex h-48 items-center justify-center rounded-lg bg-gray-100 text-4xl">
              🐰
            </div>
            <h3 className="font-medium text-gray-900 group-hover:text-orange-500">
              {product.name}
            </h3>
            <p className="mt-1 text-lg font-bold text-orange-500">
              {product.price.toLocaleString()}원
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
