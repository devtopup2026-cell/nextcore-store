export default function BuildPC() {
  return (
    <section className="bg-zinc-950 text-white py-24">

      <div className="max-w-7xl mx-auto px-6 text-center">

        <h2 className="text-5xl font-bold mb-6">
          CUSTOM PC BUILDER
        </h2>

        <p className="text-zinc-400 mb-10">
          เลือกสเปคคอมตามงบประมาณของคุณ
        </p>

        <div className="grid md:grid-cols-4 gap-4 mb-10">

          <div className="bg-zinc-900 p-6 rounded-xl">CPU</div>
          <div className="bg-zinc-900 p-6 rounded-xl">MAINBOARD</div>
          <div className="bg-zinc-900 p-6 rounded-xl">RAM</div>
          <div className="bg-zinc-900 p-6 rounded-xl">SSD</div>

          <div className="bg-zinc-900 p-6 rounded-xl">VGA</div>
          <div className="bg-zinc-900 p-6 rounded-xl">PSU</div>
          <div className="bg-zinc-900 p-6 rounded-xl">CASE</div>
          <div className="bg-zinc-900 p-6 rounded-xl">COOLER</div>

        </div>

        <button className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-xl">
          เริ่มจัดสเปค
        </button>

      </div>

    </section>
  );
}