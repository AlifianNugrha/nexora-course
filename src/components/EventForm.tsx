import { useState, useEffect } from "react";
import { z } from "zod";
import { Calendar, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitForm } from "@/hooks/use-supabase";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

const schema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  email: z.string().trim().email("Email tidak valid").max(120),
  phone: z
    .string()
    .trim()
    .min(8, "No. HP minimal 8 digit")
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "No. HP hanya boleh angka"),
  className: z.string().trim().min(1, "Asal Sekolah/Kelas wajib diisi").max(40),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  eventId?: string;
};

export function EventForm({ open, onOpenChange, eventTitle, eventId }: Props) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", className: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setForm(prev => ({
        ...prev,
        name: profile.full_name || prev.name,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
      }));
    }
  }, [open, profile]);

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

    // Submit ke form_submissions dengan 'course' diisi "Event Registration"
    await submitForm({
      course: "Event Registration",
      event_name: eventTitle,
      name: form.name,
      email: form.email,
      phone: form.phone,
      class_name: form.className,
    });

    // Mark as registered in localStorage
    const registered = JSON.parse(localStorage.getItem("registered_events") || "[]");
    if (!registered.includes(eventTitle)) {
      registered.push(eventTitle);
      localStorage.setItem("registered_events", JSON.stringify(registered));
    }

    setSubmitting(false);
    onOpenChange(false);
    navigate({ to: "/event/success" });
  };

  const reset = () => {
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
          <div className="p-5">
            <DialogHeader className="space-y-1.5 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-soft">
                <Calendar className="h-4 w-4" />
              </div>
              <DialogTitle className="text-xl font-extrabold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Daftar Event
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Isi data diri kamu untuk mendaftar di event{" "}
                <span className="font-semibold text-foreground">{eventTitle}</span>.
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
                  <Label htmlFor="className">Asal Sekolah</Label>
                  <Input
                    id="className"
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    placeholder="SMA N 1..."
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
                className="group w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-all hover:opacity-90 active:scale-95 mt-2"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    <span className="font-bold">Memproses...</span>
                  </>
                ) : (
                  <span className="font-bold">Daftar Sekarang</span>
                )}
              </Button>
            </form>
          </div>
      </DialogContent>
    </Dialog>
  );
}
