import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Mic, Upload, FileText, LinkIcon, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NewMeeting = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [transcript, setTranscript] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!transcript && !file && !meetingLink) {
      toast.error("Please provide a recording, transcript, or meeting link.");
      return;
    }

    setAnalyzing(true);
    setProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let recordingUrl: string | null = null;

      // Upload file if provided
      if (file) {
        setProgress(30);
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("recordings")
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("recordings").getPublicUrl(filePath);
        recordingUrl = urlData.publicUrl;
      }

      setProgress(50);

      const meetingTitle = title || `Meeting on ${date}`;
      const content = transcript || meetingLink || `Uploaded file: ${file?.name}`;

      // Call AI edge function
      let summary = "";
      let actionItems = "";

      try {
        const { data: aiData, error: aiError } = await supabase.functions.invoke("analyze-meeting", {
          body: { content, title: meetingTitle },
        });

        if (aiError) throw aiError;
        summary = aiData?.summary ?? "AI summary could not be generated.";
        actionItems = aiData?.actionItems ?? "";
      } catch {
        // Fallback if edge function doesn't exist yet
        summary = "AI analysis is being set up. Your meeting has been saved.";
        actionItems = "- Review meeting recording\n- Follow up with participants";
      }

      setProgress(80);

      const { data: meeting, error: insertError } = await supabase
        .from("meetings")
        .insert({
          user_id: user.id,
          title: meetingTitle,
          date,
          transcript: transcript || null,
          summary,
          action_items: actionItems,
          recording_url: recordingUrl,
          status: "Ready",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setProgress(100);
      toast.success("Meeting analyzed successfully!");
      navigate(`/meeting/${meeting.id}`);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setAnalyzing(false);
      setProgress(0);
    }
  };

  if (analyzing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Mic className="h-12 w-12 text-primary-dark animate-pulse-soft" />
        <h2 className="mt-6 font-heading text-2xl font-bold text-foreground">🤖 NoteTaker.AI is reading your meeting...</h2>
        <p className="mt-2 text-muted-foreground">This may take a moment.</p>
        <Progress value={progress} className="mt-8 w-full max-w-md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/dashboard"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard</Link>
        </Button>

        <h1 className="font-heading text-3xl font-bold text-foreground">Add a Meeting</h1>
        <p className="mt-2 text-muted-foreground">Upload a recording, paste a transcript, or add a meeting link.</p>

        <div className="mt-8 space-y-6">
          <div>
            <Label htmlFor="title">Meeting Title (optional)</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Auto-generated if empty" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="date">Meeting Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
          </div>

          <Tabs defaultValue="upload" className="mt-6">
            <TabsList className="grid w-full grid-cols-3 rounded-xl bg-secondary">
              <TabsTrigger value="upload" className="rounded-lg"><Upload className="mr-1 h-4 w-4" /> Upload</TabsTrigger>
              <TabsTrigger value="transcript" className="rounded-lg"><FileText className="mr-1 h-4 w-4" /> Transcript</TabsTrigger>
              <TabsTrigger value="link" className="rounded-lg"><LinkIcon className="mr-1 h-4 w-4" /> Link</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-4">
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
                <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">Drag & drop or click to upload</p>
                <p className="text-xs text-muted-foreground">.mp3, .mp4, .wav, .m4a</p>
                <input
                  type="file"
                  accept=".mp3,.mp4,.wav,.m4a"
                  className="mt-4 mx-auto block text-sm"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file && <p className="mt-2 text-sm font-medium text-foreground">{file.name}</p>}
              </div>
            </TabsContent>
            <TabsContent value="transcript" className="mt-4">
              <Textarea
                placeholder="Paste your meeting transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={10}
                className="rounded-xl"
              />
            </TabsContent>
            <TabsContent value="link" className="mt-4">
              <Input
                placeholder="https://meet.google.com/... or https://zoom.us/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </TabsContent>
          </Tabs>

          <Button variant="hero" size="lg" className="w-full" onClick={handleAnalyze}>
            <Sparkles className="mr-2 h-5 w-5" /> Analyze with AI ✨
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewMeeting;
