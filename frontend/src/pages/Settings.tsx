import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/layouts/AppLayout";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, changePasswordSchema, type ProfileFormData, type ChangePasswordFormData } from "@/utils/validations";
import { useToast } from "@/hooks/use-toast";
// TODO(BACKEND): Uncomment when backend profile endpoints are ready.
// import { authService } from "@/services/authService";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      preferred_style: user?.preferred_style || "casual",
      preferred_colors: user?.preferred_colors || "neutral",
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "" },
  });

  const handleProfileSave = (data: ProfileFormData) => {
    // TODO(BACKEND): Replace local-only update with backend persistence.
    // Example:
    // const updated = await authService.updateProfile(data);
    // updateUser(updated);
    if (user) {
      updateUser({ ...user, ...data });
    }
    toast({ title: "Profile updated", description: "Your changes have been saved." });
  };

  const handlePasswordChange = (_data: ChangePasswordFormData) => {
    // TODO(BACKEND): Call backend password endpoint instead of toast-only flow.
    // Example:
    // await authService.changePassword(_data);
    toast({ title: "Password updated", description: "Your password has been changed." });
    passwordForm.reset();
  };

  const handleLogout = () => {
    // TODO(BACKEND): Keep using logout() from useAuth; it already calls
    // authService.logout() when not in demo mode.
    logout();
    navigate("/");
  };

  const initials = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <form onSubmit={profileForm.handleSubmit(handleProfileSave)}>
          <section className="rounded-2xl bg-card shadow-card p-6 space-y-5">
            <h2 className="font-heading font-semibold text-lg text-card-foreground">Profile Information</h2>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-heading font-bold">
                {initials}
              </div>
              <div>
                <p className="font-medium text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Full Name</Label>
                <Input className="mt-1.5" {...profileForm.register("name")} />
                {profileForm.formState.errors.name && (
                  <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label className="text-foreground">Email</Label>
                <Input className="mt-1.5" {...profileForm.register("email")} />
                {profileForm.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <h3 className="font-medium text-foreground pt-2">Style Preferences</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Preferred Style</Label>
                <Controller name="preferred_style" control={profileForm.control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Casual", "Minimalist", "Classic", "Streetwear", "Bohemian"].map((s) => (
                        <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label className="text-foreground">Favorite Colors</Label>
                <Controller name="preferred_colors" control={profileForm.control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Neutral", "Earth Tones", "Pastels", "Bold Colors", "Monochrome"].map((c) => (
                        <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>

            <Button type="submit" variant="hero" size="sm">Save Changes</Button>
          </section>
        </form>

        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
          <section className="rounded-2xl bg-card shadow-card p-6 space-y-5">
            <h2 className="font-heading font-semibold text-lg text-card-foreground">Change Password</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Current Password</Label>
                <Input type="password" placeholder="••••••••" className="mt-1.5" {...passwordForm.register("current_password")} />
                {passwordForm.formState.errors.current_password && (
                  <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.current_password.message}</p>
                )}
              </div>
              <div>
                <Label className="text-foreground">New Password</Label>
                <Input type="password" placeholder="••••••••" className="mt-1.5" {...passwordForm.register("new_password")} />
                {passwordForm.formState.errors.new_password && (
                  <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.new_password.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" variant="outline" size="sm">Update Password</Button>
          </section>
        </form>

        <Separator />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Log out</h3>
              <p className="text-sm text-muted-foreground">Sign out of your account</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>Log out</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">Delete</Button>
            {/* TODO(BACKEND): Wire this button to authService.deleteAccount(),
                then clear auth state and navigate to landing/auth page. */}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
