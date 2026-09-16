import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Award, Download, Printer, ArrowLeft, GraduationCap, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/sertifikat")({
  head: () => ({
    meta: [
      { title: "Klaim Sertifikat — Belajar Bareng Nexora" },
      { name: "description", content: "Generate sertifikat kelulusan kamu secara gratis di Nexora." },
    ],
  }),
  component: CertificatePage,
});

function CertificatePage() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("Fullstack Web Development");
  const [generated, setGenerated] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setGenerated(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background print:bg-white">
      <div className="print:hidden">
        <SiteHeader />
      </div>

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {!generated ? (
          <section className="mx-auto max-w-xl">
             <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                   <Award className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-extrabold text-foreground">Klaim Sertifikat</h1>
                <p className="mt-2 text-muted-foreground">Selamat atas kerja kerasmu! Masukkan nama untuk generate sertifikat.</p>
             </div>

             <div className="rounded-3xl border border-border/50 bg-white p-8 shadow-card dark:bg-card">
                <form onSubmit={handleGenerate} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Nama Lengkap</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Misal: Ahmad Fauzi"
                        className="w-full rounded-xl border border-border/50 bg-slate-50 px-4 py-3.5 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-secondary/20"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Pilih Kelas</label>
                      <select 
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full rounded-xl border border-border/50 bg-slate-50 px-4 py-3.5 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-secondary/20"
                      >
                         <option>Fullstack Web Development</option>
                         <option>UI/UX Design Masterclass</option>
                         <option>Mobile App Development</option>
                         <option>Backend Engineering</option>
                         <option>DevOps & Cloud Computing</option>
                      </select>
                   </div>

                   <button 
                     type="submit"
                     className="w-full rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-1 active:scale-95"
                   >
                     Generate Sertifikat
                   </button>
                </form>
             </div>
          </section>
        ) : (
          <section className="mx-auto max-w-5xl">
             <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row print:hidden">
                <button 
                  onClick={() => setGenerated(false)}
                  className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"
                >
                   <ArrowLeft className="h-4 w-4" /> Edit Data
                </button>
                <div className="flex gap-3">
                   <button 
                     onClick={handlePrint}
                     className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold shadow-sm ring-1 ring-border transition-all hover:bg-slate-50 active:scale-95 dark:bg-card"
                   >
                      <Printer className="h-4 w-4" /> Print / PDF
                   </button>
                </div>
             </div>

             {/* Certificate Design */}
             <div 
               ref={certRef}
               className="relative aspect-[1.414/1] w-full overflow-hidden border-[1px] border-border/50 bg-white p-0 text-center shadow-2xl dark:text-slate-900"
             >
                {/* Techy Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
                <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-500/10 blur-[100px]" />
                <div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />
                
                {/* Gradient Border Overlay */}
                <div className="absolute inset-4 border-[1px] border-slate-200" />
                <div className="absolute inset-8 border-[2px] border-slate-100" />
                
                {/* Main Content Container */}
                <div className="relative z-10 flex h-full flex-col items-center justify-between p-16">
                   {/* Top Header */}
                   <div className="flex w-full items-start justify-between">
                      <div className="flex items-center gap-3">
                         <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 text-white shadow-lg">
                            <GraduationCap className="h-7 w-7" />
                         </div>
                         <div className="text-left">
                            <p className="text-sm font-black uppercase tracking-widest text-slate-800">Nexora</p>
                            <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Academy Platform</p>
                         </div>
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-white p-1">
                         {/* Placeholder QR Code */}
                         <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-0.5 opacity-20">
                            {[...Array(16)].map((_, i) => (
                               <div key={i} className={`bg-slate-800 ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`} />
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Certificate Text */}
                   <div className="flex flex-col items-center">
                      <h2 className="font-serif text-sm font-bold uppercase tracking-[0.5em] text-slate-400">Certificate of Achievement</h2>
                      <p className="mt-8 text-xl font-medium text-slate-500">This certifies that</p>
                      
                      <div className="relative mt-4">
                         <h1 className="font-serif text-6xl font-black italic bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent px-4">
                            {name}
                         </h1>
                         <div className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-blue-600/20" />
                      </div>

                      <p className="mt-10 max-w-lg text-lg font-medium text-slate-500">
                        has demonstrated exceptional proficiency and successfully completed the professional certification program in
                      </p>
                      <h3 className="mt-2 text-2xl font-black uppercase tracking-wide text-slate-800">
                         {course}
                      </h3>
                   </div>

                   {/* Bottom Signatures / Details */}
                   <div className="flex w-full items-end justify-between">
                      <div className="text-left">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verified Date</p>
                         <p className="mt-1 text-sm font-bold text-slate-800">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      
                      <div className="flex flex-col items-center pb-2">
                         <div className="relative mb-1">
                            <span className="font-serif text-3xl font-bold italic text-slate-700 opacity-80">Nexora Official</span>
                            <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-slate-300" />
                         </div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Program Director</p>
                      </div>

                      <div className="text-right">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Credential ID</p>
                         <p className="mt-1 font-mono text-[10px] font-bold text-slate-600">NX-CERT-{Math.random().toString(36).substring(2, 12).toUpperCase()}</p>
                      </div>
                   </div>
                </div>
                
                {/* Decorative Tech Corners */}
                <div className="absolute left-0 top-0 h-24 w-24 border-l-4 border-t-4 border-purple-600/30" />
                <div className="absolute right-0 top-0 h-24 w-24 border-r-4 border-t-4 border-blue-600/30" />
                <div className="absolute bottom-0 left-0 h-24 w-24 border-b-4 border-l-4 border-purple-600/30" />
                <div className="absolute bottom-0 right-0 h-24 w-24 border-b-4 border-r-4 border-blue-600/30" />
             </div>

             <div className="mt-10 text-center print:hidden">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600/10 to-blue-600/10 px-6 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                   <CheckCircle2 className="h-4 w-4 text-purple-600" /> Sertifikat digital ini telah diverifikasi oleh Nexora Learning System.
                </div>
             </div>
          </section>
        )}
      </main>

      <div className="print:hidden">
        <SiteFooter />
      </div>
      
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
