import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { CITIES } from '../data/listings.js';

const inputCls =
  'w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-[13px] text-white placeholder:text-white/35 outline-none focus:border-bronze/50';
const labelCls = 'mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-white/45';

export default function ListYourPG() {
  const [sent, setSent] = useState(false);
  const [images, setImages] = useState(['']);

  function submit(e) {
    e.preventDefault();
    setSent(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-canvas text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-3 pb-4 pt-24 sm:pt-28">
        <div className="rounded-[24px] border border-white/[0.08] bg-surface p-6 sm:rounded-[28px] sm:p-10">
          {sent ? (
            <div className="py-16 text-center">
              <p className="text-4xl">🏡</p>
              <h1 className="mt-4 font-serif text-3xl">Listing received!</h1>
              <p className="mx-auto mt-3 max-w-md text-[13.5px] text-white/60">
                Our verification team will call you within 24 hours to schedule an in-person check. Once verified, your PG
                goes live to thousands of searching tenants.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-bronze">For owners</p>
              <h1 className="mt-3 font-serif text-3xl sm:text-4xl">List your PG with us.</h1>
              <p className="mt-3 text-[13.5px] text-white/60">
                Free to list. Verified badge after an in-person check. Direct enquiries from real tenants — no agents.
              </p>

              <form onSubmit={submit} className="mt-8 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>PG name</label>
                    <input required placeholder="Sunrise House PG" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>City</label>
                    <select required className={inputCls} defaultValue="">
                      <option value="" disabled>Select city</option>
                      {CITIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Full address</label>
                  <input required placeholder="Area, street, landmark" className={inputCls} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelCls}>Monthly rent (₹)</label>
                    <input required type="number" min="1000" placeholder="8500" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>For</label>
                    <select className={inputCls} defaultValue="any">
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                      <option value="any">Co-ed</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Available beds</label>
                    <input required type="number" min="1" placeholder="3" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Amenities (comma separated)</label>
                  <input placeholder="WiFi, Meals, AC, Laundry" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Photo URLs</label>
                  {images.map((u, i) => (
                    <div key={i} className="mb-2 flex gap-2">
                      <input
                        type="url"
                        value={u}
                        onChange={(e) => setImages((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                        placeholder="https://images.unsplash.com/…"
                        className={inputCls}
                      />
                      {images.length > 1 && (
                        <button type="button" onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))} className="rounded-2xl border border-white/10 px-3 text-white/50 hover:border-white/30">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setImages((p) => [...p, ''])} className="text-[12.5px] font-medium text-bronze hover:underline">
                    + Add another photo
                  </button>
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea rows="4" placeholder="What makes your PG a great place to live?" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Your contact number</label>
                  <input required type="tel" placeholder="+91 …" className={inputCls} />
                </div>

                <button type="submit" className="w-full rounded-full bg-white py-3 text-[14px] font-semibold text-black transition hover:bg-white/90 sm:w-auto sm:px-10">
                  Submit for verification
                </button>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
