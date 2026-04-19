"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { updateProfile, uploadAvatar } from "@/app/actions/profile";
import { logout } from "@/app/actions/auth";
import { Camera, LogOut } from "lucide-react";

interface Props {
  profile: {
    id: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
  };
  email: string;
}

export function AccountSettingsForm({ profile, email }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [logoutOpen, setLogoutOpen] = useState(false);

  async function handleSaveProfile() {
    setSavingProfile(true);
    const fd = new FormData();
    fd.append("full_name", fullName);
    fd.append("phone", phone);
    const result = await updateProfile(fd);
    setSavingProfile(false);
    if (result?.error) toast(result.error, "error");
    else { toast("Profile updated!"); router.refresh(); }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append("avatar", file);
    const result = await uploadAvatar(fd);
    setUploadingAvatar(false);
    if (result?.error) toast(result.error, "error");
    else { toast("Avatar updated!"); router.refresh(); }
  }

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Profile Photo</p>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={fullName} avatarUrl={avatarPreview} size="xl" />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-sky-500 rounded-full flex items-center justify-center shadow-md hover:bg-sky-600 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{fullName}</p>
            <p className="text-xs text-gray-400">{email}</p>
            {uploadingAvatar && (
              <p className="text-xs text-sky-500 mt-0.5">Uploading...</p>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Personal Info</p>
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Email"
            value={email}
            disabled
            hint="Email cannot be changed"
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
          />
          <Button
            onClick={handleSaveProfile}
            loading={savingProfile}
            disabled={!fullName.trim()}
          >
            Save changes
          </Button>
        </div>
      </div>

      {/* Sign out */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
        <Button
          variant="ghost"
          className="text-red-500 hover:text-red-600 gap-2"
          onClick={() => setLogoutOpen(true)}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={async () => { await logout(); }}
        title="Sign out?"
        description="You'll need to log back in to access your clubs."
        confirmText="Sign out"
      />
    </div>
  );
}
