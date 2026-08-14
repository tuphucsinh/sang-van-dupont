"use client";

import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export interface ProductMedia {
  id: string;
  url: string;
  kind: string;
  sort_order: number;
}

export interface ProductRow {
  id: string;
  slug: string;
  name_vi: string;
  name_en: string;
  line: string | null;
  material: string | null;
  condition: string | null;
  desc_vi: string | null;
  desc_en: string | null;
  price: number | null;
  status: string;
  created_at?: string;
  product_media: ProductMedia[];
}

interface ProductFormData {
  slug: string;
  name_vi: string;
  name_en: string;
  line: string;
  material: string;
  condition: string;
  desc_vi: string;
  desc_en: string;
  price: string;
  status: string;
}

const INITIAL_FORM: ProductFormData = {
  slug: "",
  name_vi: "",
  name_en: "",
  line: "",
  material: "",
  condition: "",
  desc_vi: "",
  desc_en: "",
  price: "",
  status: "available",
};

function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM);
  const [isSlugManual, setIsSlugManual] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingMedia, setUploadingMedia] = useState<boolean>(false);
  const [staticImgPath, setStaticImgPath] = useState<string>("");
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const showToastMsg = useCallback((type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => {
      setToast((prev) => (prev?.msg === msg ? null : prev));
    }, 3000);
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_media(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts((data as ProductRow[]) || []);
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm:", err);
      showToastMsg("err", errMsg(err) || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [showToastMsg]);

  useEffect(() => {
    // defer — tránh react-hooks/set-state-in-effect (loadProducts chứa setState)
    const t = setTimeout(() => {
      loadProducts();
    }, 0);
    return () => clearTimeout(t);
  }, [loadProducts]);

  const handleOpenCreate = () => {
    setEditing(null);
    setFormData(INITIAL_FORM);
    setIsSlugManual(false);
    setStaticImgPath("");
    setShowForm(true);
  };

  const handleOpenEdit = (p: ProductRow) => {
    setEditing(p);
    setFormData({
      slug: p.slug || "",
      name_vi: p.name_vi || "",
      name_en: p.name_en || "",
      line: p.line || "",
      material: p.material || "",
      condition: p.condition || "",
      desc_vi: p.desc_vi || "",
      desc_en: p.desc_en || "",
      price: p.price !== null && p.price !== undefined ? String(p.price) : "",
      status: p.status || "available",
    });
    setIsSlugManual(true);
    setStaticImgPath("");
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormData(INITIAL_FORM);
    setIsSlugManual(false);
    setStaticImgPath("");
  };

  const handleNameViChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name_vi: val,
      slug: !editing && !isSlugManual ? slugify(val) : prev.slug,
    }));
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManual(true);
    setFormData((prev) => ({ ...prev, slug: val }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_vi.trim() || !formData.name_en.trim() || !formData.slug.trim()) {
      showToastMsg("err", "Vui lòng nhập đầy đủ tên tiếng Việt, tiếng Anh và slug!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name_vi: formData.name_vi.trim(),
        name_en: formData.name_en.trim(),
        slug: formData.slug.trim(),
        line: formData.line.trim() || null,
        material: formData.material.trim() || null,
        condition: formData.condition.trim() || null,
        desc_vi: formData.desc_vi.trim() || null,
        desc_en: formData.desc_en.trim() || null,
        price: formData.price.trim() !== "" ? Number(formData.price) : null,
        status: formData.status || "available",
      };

      if (editing) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editing.id);

        if (error) throw error;
        showToastMsg("ok", `Đã cập nhật sản phẩm "${payload.name_vi}"`);
      } else {
        const { error } = await supabase.from("products").insert([payload]);

        if (error) throw error;
        showToastMsg("ok", `Đã tạo sản phẩm mới "${payload.name_vi}"`);
      }

      handleCloseForm();
      await loadProducts();
    } catch (err) {
      console.error("Lỗi khi lưu sản phẩm:", err);
      showToastMsg("err", errMsg(err) || "Không thể lưu sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (p: ProductRow) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa "${p.name_vi}"?`);
    if (!ok) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", p.id);
      if (error) throw error;

      showToastMsg("ok", `Đã xóa sản phẩm "${p.name_vi}"`);
      await loadProducts();
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      showToastMsg("err", errMsg(err) || "Không thể xóa sản phẩm");
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    if (file.size > 2 * 1024 * 1024) {
      showToastMsg("err", "Ảnh tối đa 2MB");
      e.target.value = "";
      return;
    }

    setUploadingMedia(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const slugClean = formData.slug.trim() || "item";
      const path = `products/${slugClean}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path);

      const nextSortOrder = (editing.product_media?.length || 0) + 1;
      const isFirst = (editing.product_media?.length || 0) === 0;

      const { data: insertedMedia, error: insertError } = await supabase
        .from("product_media")
        .insert([
          {
            product_id: editing.id,
            url: publicUrl,
            kind: isFirst ? "cover" : "gallery",
            sort_order: nextSortOrder,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const updatedMediaList = [...(editing.product_media || []), insertedMedia as ProductMedia].filter(
        (m): m is ProductMedia => !!m
      );
      setEditing({ ...editing, product_media: updatedMediaList });
      showToastMsg("ok", "Đã tải lên và gắn ảnh mới thành công");
      await loadProducts();
    } catch (err) {
      console.error("Lỗi khi tải ảnh lên:", err);
      showToastMsg("err", errMsg(err) || "Lỗi tải ảnh lên storage");
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const handleAddStaticImage = async () => {
    if (!staticImgPath.trim() || !editing) return;

    setUploadingMedia(true);
    try {
      const nextSortOrder = (editing.product_media?.length || 0) + 1;
      const isFirst = (editing.product_media?.length || 0) === 0;

      const { data: insertedMedia, error } = await supabase
        .from("product_media")
        .insert([
          {
            product_id: editing.id,
            url: staticImgPath.trim(),
            kind: isFirst ? "cover" : "gallery",
            sort_order: nextSortOrder,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const updatedMediaList = [...(editing.product_media || []), insertedMedia as ProductMedia].filter(
        (m): m is ProductMedia => !!m
      );
      setEditing({ ...editing, product_media: updatedMediaList });
      setStaticImgPath("");
      showToastMsg("ok", "Đã thêm ảnh có sẵn thành công");
      await loadProducts();
    } catch (err) {
      console.error("Lỗi khi thêm ảnh tĩnh:", err);
      showToastMsg("err", errMsg(err) || "Không thể thêm ảnh tĩnh");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!editing) return;
    try {
      const { error } = await supabase
        .from("product_media")
        .delete()
        .eq("id", mediaId);

      if (error) throw error;

      const updatedList = (editing.product_media || []).filter((m) => m.id !== mediaId);
      setEditing({ ...editing, product_media: updatedList });
      showToastMsg("ok", "Đã xóa ảnh");
      await loadProducts();
    } catch (err) {
      console.error("Lỗi khi xóa media:", err);
      showToastMsg("err", errMsg(err) || "Không thể xóa ảnh");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <span
            style={{
              fontSize: "12px",
              padding: "2px 8px",
              borderRadius: "4px",
              background: "rgba(212, 175, 55, 0.15)",
              color: "#d4af37",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              fontWeight: 500,
            }}
          >
            Có sẵn
          </span>
        );
      case "reserved":
        return (
          <span
            style={{
              fontSize: "12px",
              padding: "2px 8px",
              borderRadius: "4px",
              background: "rgba(249, 115, 22, 0.15)",
              color: "#f97316",
              border: "1px solid rgba(249, 115, 22, 0.4)",
              fontWeight: 500,
            }}
          >
            Đã giữ
          </span>
        );
      case "sold":
        return (
          <span
            style={{
              fontSize: "12px",
              padding: "2px 8px",
              borderRadius: "4px",
              background: "rgba(156, 163, 175, 0.15)",
              color: "#9ca3af",
              border: "1px solid rgba(156, 163, 175, 0.4)",
              fontWeight: 500,
            }}
          >
            Đã bán
          </span>
        );
      case "draft":
        return (
          <span
            style={{
              fontSize: "12px",
              padding: "2px 8px",
              borderRadius: "4px",
              background: "rgba(120, 113, 108, 0.15)",
              color: "#a8a29e",
              border: "1px solid rgba(120, 113, 108, 0.4)",
              fontWeight: 500,
            }}
          >
            Nháp
          </span>
        );
      case "archived":
        return (
          <span
            style={{
              fontSize: "12px",
              padding: "2px 8px",
              borderRadius: "4px",
              background: "rgba(120, 113, 108, 0.15)",
              color: "#78716c",
              border: "1px solid rgba(120, 113, 108, 0.4)",
              fontWeight: 500,
            }}
          >
            Ẩn
          </span>
        );
      default:
        return (
          <span
            style={{
              fontSize: "12px",
              padding: "2px 8px",
              borderRadius: "4px",
              background: "rgba(255, 255, 255, 0.1)",
              color: "#f3ecd9",
            }}
          >
            {status}
          </span>
        );
    }
  };

  return (
    <AdminGuard>
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0d",
          color: "#f3ecd9",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "32px 24px 80px",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {/* Header */}
          <header
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "32px",
              paddingBottom: "20px",
              borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "Cinzel, serif",
                  color: "#d4af37",
                  fontSize: "28px",
                  margin: 0,
                  letterSpacing: "0.04em",
                }}
              >
                Quản lý sản phẩm
              </h1>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "14px",
                  color: "rgba(243, 236, 217, 0.6)",
                }}
              >
                Tổng số {products.length} sản phẩm trong cơ sở dữ liệu
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={handleOpenCreate}
                style={{
                  background: "#d4af37",
                  color: "#0a0a0d",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 18px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 8px rgba(212, 175, 55, 0.3)",
                }}
              >
                <span>＋</span> Thêm sản phẩm
              </button>

              <Link
                href="/admin/leads"
                style={{
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  color: "#d4af37",
                  background: "transparent",
                  padding: "9px 16px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  textDecoration: "none",
                  fontWeight: 500,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Xem lead
              </Link>

              <button
                onClick={handleSignOut}
                style={{
                  border: "1px solid rgba(220, 38, 38, 0.4)",
                  color: "#ef4444",
                  background: "transparent",
                  padding: "9px 16px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Đăng xuất
              </button>
            </div>
          </header>

          {/* Product list */}
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "rgba(243, 236, 217, 0.6)",
                fontSize: "16px",
              }}
            >
              Đang tải danh sách sản phẩm…
            </div>
          ) : products.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#101014",
                borderRadius: "12px",
                border: "1px dashed rgba(212, 175, 55, 0.25)",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  color: "rgba(243, 236, 217, 0.7)",
                  marginBottom: "16px",
                }}
              >
                Chưa có sản phẩm nào trong hệ thống.
              </p>
              <button
                onClick={handleOpenCreate}
                style={{
                  background: "#d4af37",
                  color: "#0a0a0d",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 20px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ＋ Thêm sản phẩm đầu tiên
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {products.map((p) => {
                const coverMedia =
                  p.product_media?.find((m) => m.kind === "cover") ||
                  p.product_media?.[0];
                const thumbUrl = coverMedia?.url || "/assets/img/img_01.jpg";

                return (
                  <div
                    key={p.id}
                    style={{
                      background: "#101014",
                      border: "1px solid rgba(212, 175, 55, 0.15)",
                      borderRadius: "8px",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        background: "#0a0a0d",
                        border: "1px solid rgba(212, 175, 55, 0.1)",
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <img
                        src={thumbUrl}
                        alt={p.name_vi}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/assets/img/img_01.jpg";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: "15px",
                            color: "#f3ecd9",
                          }}
                        >
                          {p.name_vi}
                        </span>
                        {renderStatusBadge(p.status)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "13px",
                          color: "rgba(243, 236, 217, 0.6)",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontFamily: "monospace", color: "#a8a29e" }}>
                          /{p.slug}
                        </span>
                        <span>•</span>
                        <span>{p.name_en}</span>
                        {p.line && (
                          <>
                            <span>•</span>
                            <span style={{ color: "#d4af37" }}>{p.line}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div
                      style={{
                        textAlign: "right",
                        minWidth: "110px",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: p.price ? "#d4af37" : "rgba(243, 236, 217, 0.7)",
                        }}
                      >
                        {p.price !== null && p.price !== undefined
                          ? p.price.toLocaleString("vi-VN") + " ₫"
                          : "Liên hệ"}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "rgba(243, 236, 217, 0.5)",
                          marginTop: "2px",
                        }}
                      >
                        {p.product_media?.length || 0} ảnh
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() => handleOpenEdit(p)}
                        style={{
                          border: "1px solid #d4af37",
                          color: "#d4af37",
                          background: "transparent",
                          borderRadius: "4px",
                          padding: "6px 14px",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        style={{
                          border: "1px solid #dc2626",
                          color: "#ef4444",
                          background: "transparent",
                          borderRadius: "4px",
                          padding: "6px 14px",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Form */}
        {(editing || showForm) && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "20px",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                background: "#101014",
                border: "1px solid rgba(212, 175, 55, 0.35)",
                borderRadius: "12px",
                padding: "24px",
                maxWidth: "640px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 16px 48px rgba(0, 0, 0, 0.8)",
                color: "#f3ecd9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
                  paddingBottom: "12px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    color: "#d4af37",
                    fontFamily: "Cinzel, serif",
                  }}
                >
                  {editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(243, 236, 217, 0.6)",
                    fontSize: "20px",
                    cursor: "pointer",
                    padding: "4px 8px",
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct}>
                {/* 2-column grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        marginBottom: "4px",
                        color: "rgba(243, 236, 217, 0.85)",
                      }}
                    >
                      Tên tiếng Việt <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name_vi}
                      onChange={(e) => handleNameViChange(e.target.value)}
                      placeholder="VD: Dupont Ligne 2 Vàng Kẻ Sọc"
                      style={{
                        width: "100%",
                        background: "#18181e",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "#f3ecd9",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        marginBottom: "4px",
                        color: "rgba(243, 236, 217, 0.85)",
                      }}
                    >
                      Tên tiếng Anh <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name_en}
                      onChange={(e) =>
                        setFormData({ ...formData, name_en: e.target.value })
                      }
                      placeholder="VD: Dupont Ligne 2 Gold Lines"
                      style={{
                        width: "100%",
                        background: "#18181e",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "#f3ecd9",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        marginBottom: "4px",
                        color: "rgba(243, 236, 217, 0.85)",
                      }}
                    >
                      Slug URL <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="vd: dupont-ligne-2-vang-ke-soc"
                      style={{
                        width: "100%",
                        background: "#18181e",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "#d4af37",
                        fontFamily: "monospace",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        marginBottom: "4px",
                        color: "rgba(243, 236, 217, 0.85)",
                      }}
                    >
                      Dòng sản phẩm (Line)
                    </label>
                    <input
                      type="text"
                      value={formData.line}
                      onChange={(e) =>
                        setFormData({ ...formData, line: e.target.value })
                      }
                      placeholder="VD: Ligne 2, Gatsby, Ligne 1..."
                      style={{
                        width: "100%",
                        background: "#18181e",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "#f3ecd9",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        marginBottom: "4px",
                        color: "rgba(243, 236, 217, 0.85)",
                      }}
                    >
                      Chất liệu (Material)
                    </label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) =>
                        setFormData({ ...formData, material: e.target.value })
                      }
                      placeholder="VD: Mạ vàng 20μ, Sơn mài tự nhiên..."
                      style={{
                        width: "100%",
                        background: "#18181e",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "#f3ecd9",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        marginBottom: "4px",
                        color: "rgba(243, 236, 217, 0.85)",
                      }}
                    >
                      Tình trạng (Condition)
                    </label>
                    <input
                      type="text"
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData({ ...formData, condition: e.target.value })
                      }
                      placeholder="VD: NOS full box, Like New 98%..."
                      style={{
                        width: "100%",
                        background: "#18181e",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "#f3ecd9",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        marginBottom: "4px",
                        color: "rgba(243, 236, 217, 0.85)",
                      }}
                    >
                      Giá bán (VND)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="Để trống = Liên hệ"
                      style={{
                        width: "100%",
                        background: "#18181e",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "#f3ecd9",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        marginBottom: "4px",
                        color: "rgba(243, 236, 217, 0.85)",
                      }}
                    >
                      Trạng thái hiển thị
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      style={{
                        width: "100%",
                        background: "#18181e",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "#f3ecd9",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="available">Có sẵn (available)</option>
                      <option value="reserved">Đã giữ (reserved)</option>
                      <option value="sold">Đã bán (sold)</option>
                      <option value="draft">Bản nháp (draft)</option>
                      <option value="archived">Lưu trữ / Ẩn (archived)</option>
                    </select>
                  </div>
                </div>

                {/* Textareas */}
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      marginBottom: "4px",
                      color: "rgba(243, 236, 217, 0.85)",
                    }}
                  >
                    Mô tả tiếng Việt
                  </label>
                  <textarea
                    rows={3}
                    value={formData.desc_vi}
                    onChange={(e) =>
                      setFormData({ ...formData, desc_vi: e.target.value })
                    }
                    placeholder="Mô tả chi tiết nguồn gốc, tình trạng, âm thanh mở nắp clack..."
                    style={{
                      width: "100%",
                      background: "#18181e",
                      border: "1px solid rgba(212, 175, 55, 0.25)",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: "#f3ecd9",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      marginBottom: "4px",
                      color: "rgba(243, 236, 217, 0.85)",
                    }}
                  >
                    Mô tả tiếng Anh
                  </label>
                  <textarea
                    rows={3}
                    value={formData.desc_en}
                    onChange={(e) =>
                      setFormData({ ...formData, desc_en: e.target.value })
                    }
                    placeholder="Detailed description in English..."
                    style={{
                      width: "100%",
                      background: "#18181e",
                      border: "1px solid rgba(212, 175, 55, 0.25)",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: "#f3ecd9",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Media Manager Section */}
                <div
                  style={{
                    background: "#0a0a0d",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: "#d4af37",
                      }}
                    >
                      Quản lý hình ảnh (Product Media)
                    </span>
                    {uploadingMedia && (
                      <span style={{ fontSize: "12px", color: "#d4af37" }}>
                        Đang xử lý ảnh…
                      </span>
                    )}
                  </div>

                  {editing ? (
                    <div>
                      {/* Current media list */}
                      {editing.product_media && editing.product_media.length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            marginBottom: "14px",
                          }}
                        >
                          {editing.product_media.map((m, idx) => (
                            <div
                              key={m.id || idx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                background: "#14141a",
                                padding: "8px 10px",
                                borderRadius: "6px",
                                border: "1px solid rgba(212, 175, 55, 0.1)",
                              }}
                            >
                              <img
                                src={m.url}
                                alt="thumb"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  background: "#000",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/assets/img/img_01.jpg";
                                }}
                              />
                              <div
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  fontSize: "12px",
                                }}
                              >
                                <div
                                  style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    color: "#f3ecd9",
                                  }}
                                >
                                  {m.url}
                                </div>
                                <div
                                  style={{
                                    color: "rgba(243, 236, 217, 0.5)",
                                    marginTop: "2px",
                                  }}
                                >
                                  Loại: <span style={{ color: "#d4af37" }}>{m.kind}</span> • Thứ tự: {m.sort_order}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteMedia(m.id)}
                                style={{
                                  background: "transparent",
                                  border: "1px solid rgba(220, 38, 38, 0.4)",
                                  color: "#ef4444",
                                  borderRadius: "4px",
                                  padding: "4px 8px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                }}
                              >
                                Xóa
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p
                          style={{
                            fontSize: "13px",
                            color: "rgba(243, 236, 217, 0.5)",
                            margin: "0 0 12px",
                          }}
                        >
                          Chưa có ảnh nào được gán cho sản phẩm này.
                        </p>
                      )}

                      {/* Add media actions */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {/* File Upload */}
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "12px",
                              marginBottom: "4px",
                              color: "rgba(243, 236, 217, 0.7)",
                            }}
                          >
                            Tải ảnh mới từ máy (tối đa 2MB, lưu vào storage product-images):
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingMedia}
                            onChange={handleUploadImage}
                            style={{
                              fontSize: "13px",
                              color: "rgba(243, 236, 217, 0.8)",
                            }}
                          />
                        </div>

                        {/* Static Path Input */}
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "12px",
                              marginBottom: "4px",
                              color: "rgba(243, 236, 217, 0.7)",
                            }}
                          >
                            Hoặc dùng đường dẫn ảnh có sẵn trong dự án:
                          </label>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input
                              type="text"
                              value={staticImgPath}
                              onChange={(e) => setStaticImgPath(e.target.value)}
                              placeholder="/assets/img/img_01.jpg"
                              style={{
                                flex: 1,
                                background: "#18181e",
                                border: "1px solid rgba(212, 175, 55, 0.25)",
                                borderRadius: "6px",
                                padding: "6px 10px",
                                color: "#f3ecd9",
                                fontSize: "13px",
                                outline: "none",
                              }}
                            />
                            <button
                              type="button"
                              disabled={uploadingMedia || !staticImgPath.trim()}
                              onClick={handleAddStaticImage}
                              style={{
                                background: "rgba(212, 175, 55, 0.2)",
                                border: "1px solid #d4af37",
                                color: "#d4af37",
                                borderRadius: "6px",
                                padding: "6px 14px",
                                fontSize: "13px",
                                cursor: "pointer",
                                fontWeight: 500,
                              }}
                            >
                              Thêm
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "rgba(243, 236, 217, 0.6)",
                        lineHeight: 1.5,
                      }}
                    >
                      ℹ️ Hãy lưu thông tin sản phẩm trước. Sau đó bạn có thể bấm{" "}
                      <strong style={{ color: "#d4af37" }}>Sửa</strong> để thêm và
                      quản lý danh sách hình ảnh.
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    borderTop: "1px solid rgba(212, 175, 55, 0.15)",
                    paddingTop: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    disabled={saving}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(243, 236, 217, 0.2)",
                      color: "#f3ecd9",
                      borderRadius: "6px",
                      padding: "9px 18px",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      background: "#d4af37",
                      color: "#0a0a0d",
                      border: "none",
                      borderRadius: "6px",
                      padding: "9px 24px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.7 : 1,
                      boxShadow: "0 2px 8px rgba(212, 175, 55, 0.3)",
                    }}
                  >
                    {saving ? "Đang lưu…" : "Lưu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              background: toast.type === "ok" ? "#16a34a" : "#dc2626",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              fontSize: "14px",
              fontWeight: 500,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              maxWidth: "400px",
            }}
          >
            <span>{toast.type === "ok" ? "✓" : "✕"}</span>
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
