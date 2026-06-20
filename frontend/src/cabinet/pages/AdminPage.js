import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Users, Package, LogOut, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/cabinet/lib/api";
import { useAuth } from "@/cabinet/context/AuthContext";
import { useI18n, localized } from "@/cabinet/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import BrandMark from "@/cabinet/components/layout/BrandMark";
import LanguageToggle from "@/cabinet/components/layout/LanguageToggle";
import PhotoCapture from "@/cabinet/components/PhotoCapture";

const BLANK_PRODUCT = {
  slug: "", category: "food", brand: "", name_en: "", name_ka: "",
  description_en: "", description_ka: "", price_gel: 0, suitable_for: "both",
  weight: "", image_url: "", stock: 50,
};

function StatTile({ label, value, accent }) {
  return (
    <Card className="border-[hsl(var(--border))] bg-paper">
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{label}</div>
        <div className={`mt-1 text-3xl font-semibold tabular-nums ${accent === "primary" ? "text-[hsl(var(--primary))]" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function ProductForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initial || BLANK_PRODUCT);
  useEffect(() => { setForm(initial || BLANK_PRODUCT); }, [initial]);
  const submit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, price_gel: Number(form.price_gel) || 0, stock: Number(form.stock) || 0 });
  };
  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3" data-testid="admin-product-form">
      <div className="space-y-1.5">
        <Label>Slug *</Label>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required pattern="[a-z0-9-]+" placeholder="royal-canin-mini" data-testid="admin-product-slug" />
      </div>
      <div className="space-y-1.5">
        <Label>Category *</Label>
        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
          <SelectTrigger data-testid="admin-product-category"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="hygiene">Hygiene</SelectItem>
            <SelectItem value="vitamins">Vitamins</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Brand *</Label>
        <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required data-testid="admin-product-brand" />
      </div>
      <div className="space-y-1.5">
        <Label>Suitable for</Label>
        <Select value={form.suitable_for} onValueChange={(v) => setForm({ ...form, suitable_for: v })}>
          <SelectTrigger data-testid="admin-product-suitable"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="dog">Dogs</SelectItem>
            <SelectItem value="cat">Cats</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5 col-span-2">
        <Label>Name (English) *</Label>
        <Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} required data-testid="admin-product-name-en" />
      </div>
      <div className="space-y-1.5 col-span-2">
        <Label>Name (Georgian) *</Label>
        <Input value={form.name_ka} onChange={(e) => setForm({ ...form, name_ka: e.target.value })} required data-testid="admin-product-name-ka" />
      </div>
      <div className="space-y-1.5 col-span-2">
        <Label>Description (English)</Label>
        <Textarea rows={2} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} data-testid="admin-product-desc-en" />
      </div>
      <div className="space-y-1.5 col-span-2">
        <Label>Description (Georgian)</Label>
        <Textarea rows={2} value={form.description_ka} onChange={(e) => setForm({ ...form, description_ka: e.target.value })} data-testid="admin-product-desc-ka" />
      </div>
      <div className="space-y-1.5">
        <Label>Price (GEL) *</Label>
        <Input type="number" step="0.01" min="0" value={form.price_gel} onChange={(e) => setForm({ ...form, price_gel: e.target.value })} required data-testid="admin-product-price" />
      </div>
      <div className="space-y-1.5">
        <Label>Weight / size</Label>
        <Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="2kg, 6x85g, 500ml..." data-testid="admin-product-weight" />
      </div>
      <div className="space-y-1.5">
        <Label>Stock</Label>
        <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} data-testid="admin-product-stock" />
      </div>
      <div className="space-y-1.5 col-span-2">
        <Label>Product image</Label>
        <PhotoCapture value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} testIdPrefix="admin-product-image" aspect="4-3" />
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Upload from device or take a photo. Or paste a URL below.</p>
        <Input value={form.image_url?.startsWith("data:") ? "" : (form.image_url || "")} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." data-testid="admin-product-image-url" />
      </div>
      <DialogFooter className="col-span-2 mt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl" data-testid="admin-product-cancel">Cancel</Button>
        <Button type="submit" disabled={submitting} className="rounded-xl" data-testid="admin-product-save">
          {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>) : "Save product"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = "SmartPaw — Admin"; }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [s, p, u] = await Promise.all([api.get("/admin/stats"), api.get("/admin/products"), api.get("/admin/users")]);
      setStats(s.data); setProducts(p.data); setUsers(u.data);
    } catch (e) { toast.error(formatApiError(e)); }
    setLoading(false);
  };

  useEffect(() => { if (user?.role === "admin") load(); }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/cabinet/login" replace />;
  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <Card className="max-w-md border-[hsl(var(--border))] bg-paper">
          <CardContent className="p-6 text-center">
            <h2 className="font-serif text-xl font-semibold">Admin access required</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              You're signed in as <strong>{user.email}</strong> but this account does not have admin permissions.
              Please sign in as <code>admin@smartpaw.ge</code>.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" onClick={async () => { await logout(); navigate("/cabinet/login"); }} data-testid="admin-signout">Sign out</Button>
              <Button onClick={() => navigate("/cabinet/dashboard")} data-testid="admin-back-cabinet">Back to cabinet</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => `${p.name_en} ${p.name_ka} ${p.brand} ${p.slug}`.toLowerCase().includes(q));
  }, [products, search]);

  const startCreate = () => { setEditing(null); setOpen(true); };
  const startEdit = (p) => { setEditing(p); setOpen(true); };

  const submitProduct = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.patch(`/admin/products/${editing.product_id}`, payload);
        setProducts((cur) => cur.map((p) => p.product_id === data.product_id ? data : p));
        toast.success("Product updated");
      } else {
        const { data } = await api.post("/admin/products", payload);
        setProducts((cur) => [data, ...cur]);
        toast.success("Product added");
      }
      setOpen(false);
    } catch (e) { toast.error(formatApiError(e)); }
    setSaving(false);
  };

  const removeProduct = async (p) => {
    try {
      await api.delete(`/admin/products/${p.product_id}`);
      setProducts((cur) => cur.filter((x) => x.product_id !== p.product_id));
      toast.success("Product deleted");
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleString(lang === "ka" ? "ka-GE" : "en-GB", { dateStyle: "medium", timeStyle: "short" }); }
    catch (_) { return iso; }
  };

  return (
    <div className="min-h-screen bg-cream" data-testid="admin-page">
      <header className="sticky top-0 z-30 border-b border-[hsl(var(--border))] bg-cream/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1300px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandMark />
            <Badge variant="secondary" className="rounded-full bg-[hsl(var(--primary))] text-white">Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button variant="ghost" onClick={() => navigate("/cabinet/dashboard")} className="text-sm" data-testid="admin-back-cabinet-top">My cabinet</Button>
            <Button variant="ghost" onClick={async () => { await logout(); navigate("/cabinet/login"); }} data-testid="admin-logout"><LogOut className="mr-2 h-4 w-4" />Log out</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6">
        <div className="mb-5">
          <h1 className="font-serif text-3xl font-semibold">Admin dashboard</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Manage products and review registrants.</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" data-testid="admin-stats">
          {loading || !stats ? Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-24 rounded-2xl" />) : (<>
            <StatTile label="Total users" value={stats.total_users} accent="primary" />
            <StatTile label="New (7d)" value={stats.new_users_7d} />
            <StatTile label="Active subs" value={stats.active_subscriptions} />
            <StatTile label="Paused subs" value={stats.paused_subscriptions} />
            <StatTile label="Products" value={stats.total_products} />
            <StatTile label="Orders" value={stats.total_orders} />
          </>)}
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-5 bg-paper" data-testid="admin-tabs">
            <TabsTrigger value="products" data-testid="admin-tab-products" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white"><Package className="mr-2 h-4 w-4" />Products ({products.length})</TabsTrigger>
            <TabsTrigger value="users" data-testid="admin-tab-users" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white"><Users className="mr-2 h-4 w-4" />Registrants ({users.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" data-testid="admin-product-search" className="h-10 rounded-xl pl-10" />
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button onClick={startCreate} className="rounded-xl" data-testid="admin-product-add"><Plus className="mr-2 h-4 w-4" />Add product</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle></DialogHeader>
                  <ProductForm initial={editing} onSubmit={submitProduct} onCancel={() => setOpen(false)} submitting={saving} />
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
            ) : (
              <Card className="border-[hsl(var(--border))] bg-paper">
                <CardContent className="p-0">
                  <ul className="divide-y divide-[hsl(var(--border))]" data-testid="admin-products-table">
                    {filteredProducts.length === 0 ? (
                      <li className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">No products yet. Click "Add product" to upload your first one.</li>
                    ) : filteredProducts.map((p) => (
                      <li key={p.product_id} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 px-4 py-3" data-testid={`admin-product-row-${p.product_id}`}>
                        {p.image_url ? <img src={p.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-[hsl(var(--muted))]" />}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate font-semibold">{localized(p, lang, "name")}</span>
                            <Badge variant="secondary" className="rounded-full text-[10px] uppercase">{p.category}</Badge>
                            <Badge variant="secondary" className="rounded-full text-[10px]">{p.suitable_for}</Badge>
                          </div>
                          <div className="mt-1 truncate text-xs text-[hsl(var(--muted-foreground))]">{p.brand} • {p.weight || "—"} • slug: <code>{p.slug}</code></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-semibold tabular-nums">{Number(p.price_gel).toFixed(2)} ₾</div>
                            <div className="text-xs text-[hsl(var(--muted-foreground))]">stock: {p.stock ?? "—"}</div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => startEdit(p)} aria-label="Edit" data-testid={`admin-product-edit-${p.product_id}`}><Pencil className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-[hsl(var(--destructive))]" aria-label="Delete" data-testid={`admin-product-delete-${p.product_id}`}><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Delete this product?</AlertDialogTitle><AlertDialogDescription>{localized(p, lang, "name")} ({p.brand})</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeProduct(p)} className="bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/90" data-testid={`admin-product-delete-confirm-${p.product_id}`}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users">
            {loading ? (
              <div className="space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-14 rounded-2xl" />)}</div>
            ) : (
              <Card className="border-[hsl(var(--border))] bg-paper">
                <CardContent className="p-0">
                  <div className="grid grid-cols-[1.4fr_1fr_120px_90px_90px_140px] gap-3 border-b border-[hsl(var(--border))] px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    <span>Name / Email</span><span>Phone</span><span>Provider</span><span>Subs</span><span>Pets</span><span>Registered</span>
                  </div>
                  <ul className="divide-y divide-[hsl(var(--border))]" data-testid="admin-users-table">
                    {users.length === 0 ? (
                      <li className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">No users yet.</li>
                    ) : users.map((u) => (
                      <li key={u.user_id} className="grid grid-cols-[1.4fr_1fr_120px_90px_90px_140px] gap-3 px-4 py-3 text-sm" data-testid={`admin-user-row-${u.user_id}`}>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{u.name}{u.role === "admin" && <Badge className="ml-2 rounded-full bg-[hsl(var(--primary))] text-[10px]">admin</Badge>}</div>
                          <div className="truncate text-xs text-[hsl(var(--muted-foreground))]">{u.email}</div>
                        </div>
                        <div className="truncate">{u.phone || "—"}</div>
                        <div><Badge variant="secondary" className="rounded-full text-[10px]">{u.provider || "email"}</Badge></div>
                        <div className="tabular-nums">{u.subscription_count}</div>
                        <div className="tabular-nums">{u.pet_count}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(u.created_at)}</div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
