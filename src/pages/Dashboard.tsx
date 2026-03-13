import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic, Search, Plus, LogOut, LayoutDashboard, Video, Settings, Calendar, Clock, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  summary: string;
  status: string;
}

const Dashboard = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load meetings");
      } else {
        setMeetings((data ?? []).map((m: any) => ({
          id: m.id,
          title: m.title,
          date: m.date,
          duration: m.duration ?? "—",
          summary: m.summary ?? "",
          status: m.status ?? "Ready",
        })));
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filtered = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card p-6 md:flex">
        <Link to="/" className="mb-10 flex items-center gap-2 font-heading text-xl font-bold text-foreground">
          <Mic className="h-5 w-5 text-primary-dark" />
          NoteTaker.AI
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          <Link to="/dashboard" className="flex items-center gap-3 rounded-xl bg-primary/30 px-4 py-3 text-sm font-medium text-foreground">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link to="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-primary/10">
            <Video className="h-4 w-4" /> My Meetings
          </Link>
          <Link to="/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-primary/10">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2 md:hidden">
            <Mic className="h-5 w-5 text-primary-dark" />
            <span className="font-heading font-bold">NoteTaker.AI</span>
          </div>
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meetings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-secondary"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{userEmail}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold text-foreground">My Meetings</h1>
            <Button variant="hero" asChild>
              <Link to="/new-meeting">
                <Plus className="mr-1 h-4 w-4" /> New Meeting
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-card p-12 text-center shadow-card">
              <Video className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">No meetings yet</h3>
              <p className="mt-2 text-muted-foreground">Add your first meeting!</p>
              <Button variant="hero" className="mt-6" asChild>
                <Link to="/new-meeting">
                  <Plus className="mr-1 h-4 w-4" /> New Meeting
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((meeting) => (
                <div key={meeting.id} className="rounded-2xl bg-card p-6 shadow-card transition-shadow hover:shadow-soft">
                  <div className="flex items-start justify-between">
                    <h3 className="font-heading font-semibold text-foreground line-clamp-1">🎥 {meeting.title}</h3>
                    <Badge variant={meeting.status === "Processing" ? "secondary" : "default"} className="ml-2 shrink-0">
                      {meeting.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {meeting.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {meeting.duration}</span>
                  </div>
                  {meeting.summary && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{meeting.summary}</p>
                  )}
                  <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                    <Link to={`/meeting/${meeting.id}`}>
                      <FileText className="mr-1 h-3 w-3" /> View Notes
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
