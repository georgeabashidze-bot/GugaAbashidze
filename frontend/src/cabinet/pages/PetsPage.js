import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, PawPrint, Loader2, ClipboardList, FileText } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/cabinet/i18n";
import { api, formatApiError } from "@/cabinet/lib/api";
import PageHeader from "@/cabinet/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import PhotoCapture from "@/cabinet/components/PhotoCapture";
import FileUpload from "@/cabinet/components/FileUpload";
import PetQuizDialog from "@/cabinet/components/PetQuizDialog";

const BLANK = { name: "", species: "dog", breed: "", birth_date: "", approx_age: "", weight_kg: "", photo_url: "", birth_certificate_url: "", dietary_notes: "" };

function computeAge(iso, t) {
  if (!iso) return "";
  const d = new Date(iso); if (isNaN(d)) return iso;
  const now = new Date();
  let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months -= 1;
  if (months < 0) months = 0;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}m`;
  if (m === 0) return `${y}y`;
  return `${y}y ${m}m`;
}

export default function PetsPage() {
  const { t } = useI18n();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = "SmartPaw — Pets"; }, []);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get("/pets"); setPets(data); }
    catch (e) { toast.error(formatApiError(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(BLANK); setOpen(true); };
  const openEdit = (pet) => {
    setEditing(pet);
    setForm({
      name: pet.name || "", species: pet.species || "dog", breed: pet.breed || "",
      birth_date: pet.birth_date || "", approx_age: pet.approx_age || "",
      weight_kg: pet.weight_kg ?? "",
      photo_url: pet.photo_url || "", birth_certificate_url: pet.birth_certificate_url || "",
      dietary_notes: pet.dietary_notes || "",
    });
    setOpen(true);
  };
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizPet, setQuizPet] = useState(null);
  const openQuiz = (pet) => { setQuizPet(pet); setQuizOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = { ...form, weight_kg: form.weight_kg === "" ? null : Number(form.weight_kg) };
    try {
      if (editing) await api.patch(`/pets/${editing.pet_id}`, payload);
      else await api.post("/pets", payload);
      toast.success(t("pets.saved_toast"));
      setOpen(false);
      await load();
    } catch (err) { toast.error(formatApiError(err)); }
    setSaving(false);
  };

  const remove = async (pet) => {
    try { await api.delete(`/pets/${pet.pet_id}`); toast.success(t("pets.deleted_toast")); await load(); }
    catch (err) { toast.error(formatApiError(err)); }
  };

  return (
    <div data-testid="pets-page">
      <PageHeader
        title={t("pets.title")} subtitle={t("pets.subtitle")} testIdPrefix="pets"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl" data-testid="pets-add-pet-button" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />{t("pets.add")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? t("pets.edit") : t("pets.add")}</DialogTitle></DialogHeader>
              <form className="grid grid-cols-2 gap-3" onSubmit={submit}>
                <div className="col-span-2 space-y-1.5">
                  <Label>{t("pets.name")}</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="pets-form-name" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("pets.species")}</Label>
                  <Select value={form.species} onValueChange={(v) => setForm({ ...form, species: v })}>
                    <SelectTrigger data-testid="pets-form-species"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">{t("pets.dog")}</SelectItem>
                      <SelectItem value="cat">{t("pets.cat")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("pets.breed")}</Label>
                  <Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} data-testid="pets-form-breed" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("pets.birth_date")}</Label>
                  <Input type="date" value={form.birth_date || ""} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} data-testid="pets-form-birth" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("pets.weight_kg")}</Label>
                  <Input type="number" step="0.1" min="0" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} data-testid="pets-form-weight" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>{t("pets.approx_age")}</Label>
                  <Input value={form.approx_age} onChange={(e) => setForm({ ...form, approx_age: e.target.value })} placeholder="e.g. 2y 3m" data-testid="pets-form-approx-age" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>{t("pets.photo")}</Label>
                  <PhotoCapture value={form.photo_url} onChange={(v)=>setForm({...form,photo_url:v})} testIdPrefix="pets-form-photo" aspect="4-3" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>{t("pets.birth_certificate")}</Label>
                  <FileUpload value={form.birth_certificate_url} onChange={(v)=>setForm({...form,birth_certificate_url:v})} testIdPrefix="pets-form-cert" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>{t("pets.dietary_notes")}</Label>
                  <Textarea rows={3} value={form.dietary_notes} onChange={(e) => setForm({ ...form, dietary_notes: e.target.value })} data-testid="pets-form-notes" />
                </div>
                <DialogFooter className="col-span-2 mt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="pets-form-cancel" className="rounded-xl">{t("pets.cancel")}</Button>
                  <Button type="submit" disabled={saving} className="rounded-xl" data-testid="pets-save-pet-button">
                    {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.saving")}</>) : t("pets.save")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
      ) : pets.length === 0 ? (
        <Card className="border-dashed bg-paper" data-testid="pets-empty">
          <CardContent className="p-10 text-center">
            <PawPrint className="mx-auto mb-3 h-10 w-10 text-[hsl(var(--muted-foreground))]" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t("pets.no_pets")}</p>
            <Button
              className="mt-5 rounded-xl"
              data-testid="pets-empty-add-pet-button"
              onClick={openCreate}
            >
              <Plus className="mr-2 h-4 w-4" />{t("pets.add")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((p) => (
            <motion.div key={p.pet_id} whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
              <Card className="overflow-hidden border-[hsl(var(--border))] bg-paper" data-testid={`pet-card-${p.pet_id}`}>
                <CardContent className="flex gap-4 p-4">
                  <Avatar className="h-16 w-16 shrink-0">
                    {p.photo_url && <AvatarImage src={p.photo_url} alt={p.name} />}
                    <AvatarFallback className="bg-[hsl(var(--secondary))] text-sm">{(p.name || "").slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{p.name}</h3>
                        <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{t(`pets.${p.species}`)} {p.breed ? `• ${p.breed}` : ""}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)} aria-label={t("pets.edit")} data-testid={`pet-edit-${p.pet_id}`}><Pencil className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label={t("pets.delete")} data-testid={`pet-delete-${p.pet_id}`} className="text-[hsl(var(--destructive))]"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>{t("pets.confirm_delete")}</AlertDialogTitle><AlertDialogDescription>{p.name}</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-testid={`pet-delete-cancel-${p.pet_id}`}>{t("pets.cancel")}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove(p)} data-testid={`pet-delete-confirm-${p.pet_id}`} className="bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/90">{t("pets.delete")}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[hsl(var(--muted-foreground))]">
                      {p.weight_kg ? <span>{p.weight_kg} kg</span> : null}
                      {p.birth_date ? <span>{t("pets.age_label")}: {computeAge(p.birth_date, t)}</span> : (p.approx_age ? <span>{t("pets.age_label")}: {p.approx_age}</span> : null)}
                      {p.birth_certificate_url ? <span className="inline-flex items-center gap-1 text-[hsl(var(--primary))]"><FileText className="h-3 w-3" /> certificate</span> : null}
                    </div>
                    {p.dietary_notes && <p className="mt-2 line-clamp-2 text-xs text-[hsl(var(--muted-foreground))]">{p.dietary_notes}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => openQuiz(p)} className="h-8 rounded-lg text-xs" data-testid={`pet-quiz-button-${p.pet_id}`}>
                        <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                        {p.quiz?.completed_at ? t("quiz.completed") : t("quiz.open_button")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      <PetQuizDialog
        open={quizOpen}
        onOpenChange={setQuizOpen}
        pet={quizPet}
        onSaved={(updated) => setPets((cur) => cur.map((p) => p.pet_id === updated.pet_id ? updated : p))}
      />
    </div>
  );
}
