import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/cabinet/i18n";
import { api, formatApiError } from "@/cabinet/lib/api";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const BLANK_QUIZ = {
  time_per_day: "",
  pets_at_home: "",
  food_type: "",
  snack_frequency: "",
  has_allergies: "",
  allergies_notes: "",
  flavor_preference: "",
};

function RadioRow({ name, value, onChange, options, testIdPrefix }) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((opt) => (
        <label key={opt.value} htmlFor={`${name}-${opt.value}`} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${value === opt.value ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))]" : "border-[hsl(var(--border))] bg-paper hover:bg-[hsl(var(--muted))]"}`}>
          <RadioGroupItem id={`${name}-${opt.value}`} value={opt.value} data-testid={`${testIdPrefix}-${opt.value}`} />
          <span className="truncate">{opt.label}</span>
        </label>
      ))}
    </RadioGroup>
  );
}

export default function PetQuizDialog({ open, onOpenChange, pet, onSaved }) {
  const { t } = useI18n();
  const [quiz, setQuiz] = useState(pet?.quiz || BLANK_QUIZ);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => { setQuiz(pet?.quiz || BLANK_QUIZ); }, [pet]);

  const update = (patch) => setQuiz((q) => ({ ...q, ...patch }));

  const submit = async () => {
    if (saving || !pet) return;
    setSaving(true);
    try {
      const payload = {
        name: pet.name, species: pet.species, breed: pet.breed,
        birth_date: pet.birth_date, approx_age: pet.approx_age,
        weight_kg: pet.weight_kg, photo_url: pet.photo_url,
        birth_certificate_url: pet.birth_certificate_url,
        dietary_notes: pet.dietary_notes,
        quiz: { ...quiz, completed_at: new Date().toISOString() },
      };
      const { data } = await api.patch(`/pets/${pet.pet_id}`, payload);
      onSaved?.(data);
      toast.success(t("quiz.saved_toast"));
      onOpenChange(false);
    } catch (e) { toast.error(formatApiError(e)); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="pet-quiz-dialog">
        <DialogHeader>
          <DialogTitle>{t("quiz.title")} — {pet?.name}</DialogTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t("quiz.subtitle")}</p>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label>{t("quiz.q1")}</Label>
            <RadioRow name="time" value={quiz.time_per_day} onChange={(v) => update({ time_per_day: v })} testIdPrefix="quiz-time"
              options={[
                { value: "lt1", label: t("quiz.time_lt1") },
                { value: "1to3", label: t("quiz.time_1to3") },
                { value: "3to6", label: t("quiz.time_3to6") },
                { value: "gt6", label: t("quiz.time_gt6") },
              ]} />
          </div>
          <div className="space-y-2">
            <Label>{t("quiz.q2")}</Label>
            <Input type="number" min={1} max={20} value={quiz.pets_at_home} onChange={(e) => update({ pets_at_home: e.target.value })} data-testid="quiz-pets-at-home" className="h-10 max-w-[120px] rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>{t("quiz.q3")}</Label>
            <RadioRow name="food" value={quiz.food_type} onChange={(v) => update({ food_type: v })} testIdPrefix="quiz-food"
              options={[
                { value: "dry_only", label: t("quiz.food_dry_only") },
                { value: "dry_wet", label: t("quiz.food_dry_wet") },
                { value: "dry_snacks", label: t("quiz.food_dry_snacks") },
                { value: "dry_wet_snacks", label: t("quiz.food_dry_wet_snacks") },
              ]} />
          </div>
          <div className="space-y-2">
            <Label>{t("quiz.q4")}</Label>
            <RadioRow name="snack" value={quiz.snack_frequency} onChange={(v) => update({ snack_frequency: v })} testIdPrefix="quiz-snack"
              options={[
                { value: "never", label: t("quiz.snack_never") },
                { value: "weekly", label: t("quiz.snack_weekly") },
                { value: "daily", label: t("quiz.snack_daily") },
                { value: "multiple_daily", label: t("quiz.snack_multiple_daily") },
              ]} />
          </div>
          <div className="space-y-2">
            <Label>{t("quiz.q5")}</Label>
            <RadioRow name="allergies" value={quiz.has_allergies} onChange={(v) => update({ has_allergies: v })} testIdPrefix="quiz-allergies"
              options={[
                { value: "no", label: t("quiz.allergies_no") },
                { value: "yes", label: t("quiz.allergies_yes") },
                { value: "unknown", label: t("quiz.allergies_unknown") },
              ]} />
            {quiz.has_allergies === "yes" && (
              <Textarea rows={2} placeholder={t("quiz.allergies_placeholder")} value={quiz.allergies_notes} onChange={(e) => update({ allergies_notes: e.target.value })} data-testid="quiz-allergies-notes" />
            )}
          </div>
          <div className="space-y-2">
            <Label>{t("quiz.q6")}</Label>
            <RadioRow name="flavor" value={quiz.flavor_preference} onChange={(v) => update({ flavor_preference: v })} testIdPrefix="quiz-flavor"
              options={[
                { value: "chicken", label: t("quiz.flavor_chicken") },
                { value: "beef", label: t("quiz.flavor_beef") },
                { value: "fish", label: t("quiz.flavor_fish") },
                { value: "lamb", label: t("quiz.flavor_lamb") },
                { value: "turkey", label: t("quiz.flavor_turkey") },
                { value: "mixed", label: t("quiz.flavor_mixed") },
                { value: "no_preference", label: t("quiz.flavor_none") },
              ]} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl" data-testid="quiz-cancel">{t("common.close")}</Button>
          <Button onClick={submit} disabled={saving} className="rounded-xl" data-testid="quiz-save">
            {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.saving")}</>) : t("quiz.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
