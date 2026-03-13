import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Calendar, Clock, Share2, Download, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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

interface MeetingData {
  id: string;
  title: string;
  date: string;
  duration: string | null;
  summary: string | null;
  action_items: string | null;
  transcript: string | null;
  recording_url: string | null;
  status: string;
}

const MeetingNotes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Meeting not found");
        navigate("/dashboard");
        return;
      }
      setMeeting(data as MeetingData);
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  const handleDelete = async () => {
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete meeting");
    } else {
      toast.success("Meeting deleted");
      navigate("/dashboard");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleDownload = () => {
    if (!meeting) return;
    const text = `${meeting.title}\nDate: ${meeting.date}\n\nSummary:\n${meeting.summary}\n\nAction Items:\n${meeting.action_items}\n\nTranscript:\n${meeting.transcript ?? "N/A"}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !meeting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
      </div>
    );
  }

  const actionItems = meeting.action_items?.split("\n").filter((item) => item.trim()) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/dashboard"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard</Link>
        </Button>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">{meeting.title}</h1>
              <div className="mt-3 flex flex-wrap gap-3">
                <Badge variant="secondary" className="gap-1"><Calendar className="h-3 w-3" /> {meeting.date}</Badge>
                {meeting.duration && <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> {meeting.duration}</Badge>}
              </div>
            </div>

            {/* Audio/Video player */}
            {meeting.recording_url && (
              <div className="rounded-2xl bg-card p-4 shadow-card">
                {meeting.recording_url.includes(".mp4") ? (
                  <video controls className="w-full rounded-xl" src={meeting.recording_url} />
                ) : (
                  <audio controls className="w-full" src={meeting.recording_url} />
                )}
              </div>
            )}

            {/* Summary */}
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <h2 className="font-heading text-lg font-bold text-foreground">📝 AI Summary</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{meeting.summary || "No summary available."}</p>
            </div>

            {/* Action Items */}
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <h2 className="font-heading text-lg font-bold text-foreground">✅ Action Items</h2>
              {actionItems.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {actionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Checkbox
                        checked={!!checkedItems[i]}
                        onCheckedChange={(checked) => setCheckedItems((prev) => ({ ...prev, [i]: !!checked }))}
                        className="mt-0.5"
                      />
                      <span className={`text-sm ${checkedItems[i] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.replace(/^[-•*\d.]+\s*/, "")}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No action items found.</p>
              )}
            </div>

            {/* Transcript */}
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <button
                className="flex w-full items-center justify-between"
                onClick={() => setTranscriptOpen(!transcriptOpen)}
              >
                <h2 className="font-heading text-lg font-bold text-foreground">💬 Full Transcript</h2>
                {transcriptOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </button>
              {transcriptOpen && (
                <div className="mt-4 max-h-96 overflow-y-auto rounded-xl bg-secondary p-4">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-body">{meeting.transcript || "No transcript available."}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="w-full space-y-3 lg:w-56">
            <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download Notes
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Meeting
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this meeting?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingNotes;
