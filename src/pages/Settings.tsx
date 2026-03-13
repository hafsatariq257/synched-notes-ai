import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mic, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SettingsPage = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [summaryNotifications, setSummaryNotifications] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? "");
        setName(user.user_metadata?.full_name ?? "");
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleDeleteAccount = async () => {
    toast.error("Please contact support to delete your account.");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/dashboard"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard</Link>
        </Button>

        <h1 className="font-heading text-3xl font-bold text-foreground">Settings</h1>

        <div className="mt-8 space-y-8">
          {/* Profile */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="font-heading text-lg font-bold text-foreground">Profile</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} disabled className="mt-1 bg-muted" />
              </div>
              <Button variant="hero" size="sm" onClick={() => toast.success("Profile saved!")}>Save Changes</Button>
            </div>
          </div>

          {/* Calendar */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="font-heading text-lg font-bold text-foreground">Connected Calendar</h2>
            <p className="mt-2 text-sm text-muted-foreground">Connect your Google Calendar to auto-detect meetings.</p>
            <Button variant="outline" className="mt-4">
              <Mic className="mr-2 h-4 w-4" /> Connect Google Calendar
            </Button>
          </div>

          {/* Notifications */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="font-heading text-lg font-bold text-foreground">Notifications</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Receive emails when meetings are processed</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Summary notifications</p>
                  <p className="text-xs text-muted-foreground">Get weekly summary of your meetings</p>
                </div>
                <Switch checked={summaryNotifications} onCheckedChange={setSummaryNotifications} />
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border border-destructive/30 p-6">
            <h2 className="font-heading text-lg font-bold text-destructive">Danger Zone</h2>
            <p className="mt-2 text-sm text-muted-foreground">Once you delete your account, there is no going back.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-4">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete your account and all data.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>Delete Account</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
