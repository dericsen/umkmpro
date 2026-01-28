export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 UMKMPRO
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Platform Super-App untuk UMKM Indonesia
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Keuangan</h3>
              <p className="text-gray-600">Kelola transaksi, kas, dan laporan keuangan</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">Inventory</h3>
              <p className="text-gray-600">Pantau stok dan kelola produk</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
              <p className="text-gray-600">Insight bisnis berbasis AI</p>
            </div>
          </div>
          
          <div className="mt-12">
            <a href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
              Mulai Sekarang →
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
