import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Lock, CheckCircle2, ArrowRight, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitForm } from "@/hooks/use-supabase";

const schema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  email: z.string().trim().email("Email tidak valid").max(120),
  phone: z
    .string()
    .trim()
    .min(8, "No. HP minimal 8 digit")
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "No. HP hanya boleh angka"),
  className: z.string().trim().min(1, "Kelas wajib diisi").max(40),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  courseId: string;
  materialLink: string;
};

export function GateForm({ open, onOpenChange, courseTitle, courseId, materialLink }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", className: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    // Submit ke Supabase
    await submitForm({
      course: courseId,
      event_name: courseTitle,
      name: form.name,
      email: form.email,
      phone: form.phone,
      class_name: form.className,
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  const handleGoToMateri = () => {
    onOpenChange(false);
    navigate({ to: "/materi/$courseId", params: { courseId } });
  };

  const reset = () => {
    setSubmitted(false);
    setSubmitting(false);
    setForm({ name: "", email: "", phone: "", className: "" });
    setErrors({});
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setTimeout(reset, 200);
      }}
    >
      <DialogContent className="w-[92vw] max-w-sm rounded-[2rem] border-border/50 p-0 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
        {!submitted ? (
          <div className="p-5">
            <DialogHeader className="space-y-1.5 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-soft">
                <Lock className="h-4 w-4" />
              </div>
              <DialogTitle className="text-xl font-extrabold bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
                Akses Materi Course
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Isi data berikut untuk membuka materi{" "}
                <span className="font-semibold text-foreground">{courseTitle}</span>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Misal: Budi Santoso"
                  maxLength={80}
                  className="rounded-xl"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="kamu@email.com"
                  maxLength={120}
                  className="rounded-xl"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">No. HP</Label>
                  <Input
                    id="phone"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0812..."
                    maxLength={20}
                    className="rounded-xl"
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="className">Kelas</Label>
                  <Input
                    id="className"
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    placeholder="Misal: 12 IPA 1"
                    maxLength={40}
                    className="rounded-xl"
                  />
                  {errors.className && (
                    <p className="text-xs text-destructive">{errors.className}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="group w-full rounded-xl bg-white shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] ring-1 ring-border/50 transition-all hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> 
                    <span className="font-bold text-primary">Memproses...</span>
                  </>
                ) : (
                  <span className="font-bold text-primary transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent">
                    Buka Materi
                  </span>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Data kamu hanya digunakan untuk akses materi.
              </p>
            </form>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-primary-deep">
              Materi siap diakses!
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Halo <span className="font-semibold text-foreground">{form.name}</span>, kamu bisa langsung mengakses materi sekarang.
            </p>
            <button
              onClick={handleGoToMateri}
              className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] ring-1 ring-border/50 transition-all hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95"
            >
              <span className="text-primary transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent">
                Buka Halaman Materi
              </span>
              <ArrowRight className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1 group-hover:text-purple-600" />
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-2 inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Tutup
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
