import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, MapPin, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/cabinet/i18n";
import { api, formatApiError } from "@/cabinet/lib/api";
import PageHeader from "@/cabinet/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const BLANK = {
  label: "Home", recipient: "", phone: "", city: "Tbilisi", district: "", street: "", building: "",
  apartment: "", postal_code: "", notes: "", is_default: false,
};

export default function AddressesPage() {
  const { t } = useI18n();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = "SmartPaw — Addresses"; }, []);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get("/addresses"); setList(data); }
    catch (e) { toast.error(formatApiError(e)); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...BLANK, is_default: list.length === 0 }); setOpen(true); };
  const openEdit = (a) => { setEditing(a); setForm({ ...BLANK, ...a }); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (editing) await api.patch(`/addresses/${editing.address_id}`, form);
      else await api.post("/addresses", form);
      toast.success(t("addresses.saved_toast"));
      setOpen(false);
      await load();
    } catch (err) { toast.error(formatApiError(err)); }
    setSaving(false);
  };

  const remove = async (a) => {
    try { await api.delete(`/addresses/${a.address_id}`); toast.success(t("addresses.deleted_toast")); await load(); }
    catch (err) { toast.error(formatApiError(err)); }
  };

  const setDefault = async (a) => {
    try { const { data } = await api.post(`/addresses/${a.address_id}/default`); setList(data); }
    catch (err) { toast.error(formatApiError(err)); }
  };

  return (
    <div data-testid="addresses-page">
      <PageHeader
        title={t("addresses.title")} subtitle={t("addresses.subtitle")} testIdPrefix="addresses"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="rounded-xl" data-testid="addresses-add-address-button"><Plus className="mr-2 h-4 w-4" />{t("addresses.add")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{editing ? t("addresses.edit") : t("addresses.add")}</DialogTitle></DialogHeader>
              <form className="grid grid-cols-2 gap-3" onSubmit={submit}>
                <div className="space-y-1.5"><Label>{t("addresses.label")}</Label><Input value={form.label} onChange={(e)=>setForm({...form,label:e.target.value})} required data-testid="addresses-form-label" /></div>
                <div className="space-y-1.5"><Label>{t("addresses.recipient")}</Label><Input value={form.recipient} onChange={(e)=>setForm({...form,recipient:e.target.value})} required data-testid="addresses-form-recipient" /></div>
                <div className="space-y-1.5"><Label>{t("addresses.phone")}</Label><Input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} required data-testid="addresses-form-phone" /></div>
                <div className="space-y-1.5"><Label>{t("addresses.city")}</Label><Input value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})} required data-testid="addresses-form-city" /></div>
                <div className="space-y-1.5"><Label>{t("addresses.district")}</Label><Input value={form.district || ""} onChange={(e)=>setForm({...form,district:e.target.value})} data-testid="addresses-form-district" /></div>
                <div className="space-y-1.5"><Label>{t("addresses.street")}</Label><Input value={form.street} onChange={(e)=>setForm({...form,street:e.target.value})} required data-testid="addresses-form-street" /></div>
                <div className="space-y-1.5"><Label>{t("addresses.building")}</Label><Input value={form.building || ""} onChange={(e)=>setForm({...form,building:e.target.value})} data-testid="addresses-form-building" /></div>
                <div className="space-y-1.5"><Label>{t("addresses.apartment")}</Label><Input value={form.apartment || ""} onChange={(e)=>setForm({...form,apartment:e.target.value})} data-testid="addresses-form-apartment" /></div>
                <div className="space-y-1.5"><Label>{t("addresses.postal_code")}</Label><Input value={form.postal_code || ""} onChange={(e)=>setForm({...form,postal_code:e.target.value})} data-testid="addresses-form-postal" /></div>
                <div className="col-span-2 space-y-1.5"><Label>{t("addresses.notes")}</Label><Textarea rows={2} value={form.notes || ""} onChange={(e)=>setForm({...form,notes:e.target.value})} data-testid="addresses-form-notes" /></div>
                <div className="col-span-2 flex items-center gap-2 text-sm">
                  <input id="isDefault" type="checkbox" checked={!!form.is_default} onChange={(e)=>setForm({...form,is_default:e.target.checked})} data-testid="addresses-form-default" className="h-4 w-4 rounded border-[hsl(var(--border))]" />
                  <Label htmlFor="isDefault">{t("addresses.set_default")}</Label>
                </div>
                <DialogFooter className="col-span-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl" data-testid="addresses-form-cancel">{t("addresses.cancel")}</Button>
                  <Button type="submit" disabled={saving} className="rounded-xl" data-testid="addresses-save-address-button">{saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.saving")}</>) : t("addresses.save")}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({length:2}).map((_,i)=><Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
      ) : list.length === 0 ? (
        <Card className="border-dashed bg-paper" data-testid="addresses-empty"><CardContent className="p-8 text-center"><MapPin className="mx-auto mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" /><p className="text-sm text-[hsl(var(--muted-foreground))]">{t("addresses.no_addresses")}</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <motion.div key={a.address_id} whileHover={{y:-2}} transition={{duration:0.18}}>
              <Card className="border-[hsl(var(--border))] bg-paper" data-testid={`address-card-${a.address_id}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{a.label}</h3>
                        {a.is_default && <Badge className="rounded-full bg-[rgba(169,184,154,0.45)] text-[hsl(var(--foreground))]" data-testid={`address-default-badge-${a.address_id}`}><Star className="mr-1 h-3 w-3" />{t("addresses.default")}</Badge>}
                      </div>
                      <p className="mt-2 text-sm font-medium">{a.recipient}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{a.phone}</p>
                      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{a.city}{a.district ? `, ${a.district}` : ""}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{a.street}{a.building ? `, ${a.building}` : ""}{a.apartment ? ` • ${a.apartment}` : ""}{a.postal_code ? ` • ${a.postal_code}` : ""}</p>
                      {a.notes && <p className="mt-1 text-xs italic text-[hsl(var(--muted-foreground))]">{a.notes}</p>}
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(a)} aria-label={t("addresses.edit")} data-testid={`address-edit-${a.address_id}`}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={t("addresses.delete")} data-testid={`address-delete-${a.address_id}`} className="text-[hsl(var(--destructive))]"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>{t("addresses.delete")}?</AlertDialogTitle><AlertDialogDescription>{a.label}</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("addresses.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(a)} data-testid={`address-delete-confirm-${a.address_id}`} className="bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/90">{t("addresses.delete")}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  {!a.is_default && (
                    <Button size="sm" variant="outline" onClick={() => setDefault(a)} className="mt-3 rounded-xl" data-testid={`address-set-default-button-${a.address_id}`}><Star className="mr-2 h-4 w-4" />{t("addresses.set_default")}</Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
