"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/Loader";

/**
 * Profile page (customers and admins). Only name, phone, and the profile
 * image can change — role, email, and blocked status are never sent, so
 * nobody can escalate their own account from this form.
 */
export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fill the form from the freshest profile data.
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    api
      .getProfile()
      .then(({ user: me }) => {
        if (cancelled) return;
        setName(me.name);
        setPhone(me.phone ?? "");
        setImageUrl(me.image ?? "");
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        // Fall back to the auth context's copy if the fetch fails.
        if (user) {
          setName(user.name);
          setPhone(user.phone ?? "");
          setImageUrl(user.image ?? "");
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageFile(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (imageMode === "url" && imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      setFormError("Profile image must be a valid image URL.");
      return;
    }

    setSaving(true);
    try {
      if (imageMode === "upload" && imageFile) {
        // Multipart: the server uploads the file to ImgBB.
        const form = new FormData();
        form.append("name", name.trim());
        form.append("phone", phone.trim());
        form.append("image", imageFile);
        await api.updateProfileWithImage(form);
      } else {
        await api.updateProfile({
          name: name.trim(),
          phone: phone.trim(),
          image: imageMode === "url" ? imageUrl.trim() || undefined : undefined,
        });
      }
      await refreshUser();
      toast.success("Profile updated.");
      setImageFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : "Could not update your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !loaded || !user) {
    return <PageLoader label="Loading your profile…" />;
  }

  const shownImage = previewUrl ?? imageUrl ?? user.image ?? null;
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-stone-900">
        My Profile
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Update your name, phone number, and profile photo.
      </p>

      <div className="mt-8 max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-4">
          {shownImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownImage}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-600 text-3xl font-bold text-white">
              {initial}
            </span>
          )}
          <div>
            <p className="font-display text-xl font-semibold text-stone-900">
              {user.name}
            </p>
            <p className="text-sm text-stone-500">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 capitalize">
              {user.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user.email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-500"
            />
            <p className="mt-1.5 text-xs text-stone-400">
              Your email address cannot be changed here.
            </p>
          </div>

          <div>
            <label
              htmlFor="profile-phone"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+880 1XXX-XXXXXX"
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none placeholder:text-stone-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              Profile Photo
            </span>
            <div className="flex gap-2" role="tablist" aria-label="Photo source">
              {(
                [
                  { value: "url", label: "Image URL" },
                  { value: "upload", label: "Upload a photo" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={imageMode === option.value}
                  onClick={() => setImageMode(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    imageMode === option.value
                      ? "bg-rose-600 text-white shadow-sm"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-rose-200 hover:text-rose-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {imageMode === "url" ? (
              <input
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/your-photo.jpg"
                className="mt-3 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none placeholder:text-stone-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            ) : (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] ?? null)
                }
                className="mt-3 w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-rose-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-rose-700"
              />
            )}
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
