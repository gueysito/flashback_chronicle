import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Image, Mic, Sparkles, Upload, Music, MapPin, Flame, Plus, X, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface CreateCapsuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: any) => void;
}

export default function CreateCapsuleModal({
  open,
  onOpenChange,
  onSave
}: CreateCapsuleModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [spotifyQuery, setSpotifyQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [locationName, setLocationName] = useState("");
  const [selfDestruct, setSelfDestruct] = useState(false);
  const { toast } = useToast();

  const aiPromptMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/prompt");
      return await res.json();
    },
    onSuccess: (data: any) => {
      setContent(data.prompt + "\n\n");
    },
  });

  const spotifySearchMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await apiRequest("POST", "/api/spotify/search", { query });
      return await res.json();
    },
  });

  const aiScheduleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/suggest-date", { content, title });
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.suggestedDate) {
        setDeliveryDate(new Date(data.suggestedDate).toISOString().split('T')[0]);
        toast({
          title: "AI Scheduling Suggestion",
          description: data.reasoning || "Date suggested based on your capsule content",
        });
      }
    },
  });

  const handleAddRecipient = () => {
    if (recipientInput && recipientInput.includes('@')) {
      setRecipients([...recipients, recipientInput]);
      setRecipientInput("");
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title || !content || !deliveryDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const capsuleData: any = {
      title,
      content,
      scheduledFor: new Date(deliveryDate).toISOString(),
      status: 'scheduled',
      selfDestructOnView: selfDestruct,
    };

    if (selectedTrack) {
      capsuleData.spotifyTrackName = selectedTrack.name;
      capsuleData.spotifyArtistName = selectedTrack.artists?.[0]?.name;
      capsuleData.spotifyAlbumArt = selectedTrack.album?.images?.[0]?.url;
      capsuleData.spotifyPreviewUrl = selectedTrack.preview_url;
    }

    if (locationName) {
      capsuleData.locationName = locationName;
    }

    if (recipients.length > 0) {
      capsuleData.recipients = recipients;
    }

    onSave?.(capsuleData);
    
    setTitle("");
    setContent("");
    setDeliveryDate("");
    setRecipients([]);
    setSelectedTrack(null);
    setLocationName("");
    setSelfDestruct(false);
  };

  const presetDates = [
    { label: "3 Months", months: 3 },
    { label: "6 Months", months: 6 },
    { label: "1 Year", months: 12 },
    { label: "3 Years", months: 36 },
    { label: "5 Years", months: 60 },
  ];

  const aiPrompts = [
    "What are you grateful for today?",
    "Describe your biggest dream right now",
    "What would you tell your future self?",
    "A moment you never want to forget",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] sm:!w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden !p-3 sm:p-6 !gap-2">
        <DialogHeader className="pr-8">
          <DialogTitle className="font-serif text-lg sm:text-xl md:text-2xl">Create Time Capsule</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 w-full max-w-full">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your capsule a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-title"
              className="font-mono h-11"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Message</Label>
              <Button
                variant="ghost"
                data-testid="button-ai-prompt"
                onClick={() => aiPromptMutation.mutate()}
                disabled={aiPromptMutation.isPending}
                className="h-11"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {aiPromptMutation.isPending ? 'Generating...' : 'AI Prompt'}
              </Button>
            </div>
            <Textarea
              id="content"
              placeholder="Write your message to the future..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              data-testid="input-content"
              className="resize-none font-mono"
            />
            <div className="flex gap-2">
              {aiPrompts.slice(0, 2).map((prompt) => (
                <Badge
                  key={prompt}
                  variant="outline"
                  className="cursor-pointer hover-elevate"
                  onClick={() => setContent(prompt + "\n\n")}
                >
                  {prompt}
                </Badge>
              ))}
            </div>
          </div>

          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-11">
              <TabsTrigger value="text" className="h-11">Text Only</TabsTrigger>
              <TabsTrigger value="photo" className="h-11">
                <Image className="h-4 w-4 mr-1" />
                Photo
              </TabsTrigger>
              <TabsTrigger value="voice" className="h-11">
                <Mic className="h-4 w-4 mr-1" />
                Voice
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photo" className="space-y-4">
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-12 hover-elevate cursor-pointer">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <div className="flex flex-col items-center gap-4 rounded-lg border border-border p-8">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  onClick={() => setIsRecording(!isRecording)}
                  data-testid="button-record"
                  className="h-11"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
                {isRecording && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    Recording... 0:00 / 1:00
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Delivery Date</Label>
              <Button
                variant="ghost"
                onClick={() => aiScheduleMutation.mutate()}
                disabled={aiScheduleMutation.isPending || !content}
                data-testid="button-ai-schedule"
                className="h-11"
              >
                <Brain className="h-4 w-4 mr-1" />
                {aiScheduleMutation.isPending ? 'Suggesting...' : 'AI Suggest Date'}
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {presetDates.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  onClick={() => {
                    const date = new Date();
                    date.setMonth(date.getMonth() + preset.months);
                    setDeliveryDate(date.toISOString().split('T')[0]);
                  }}
                  data-testid={`button-preset-${preset.label.toLowerCase().replace(' ', '-')}`}
                  className="h-11 text-xs sm:text-sm"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                data-testid="input-delivery-date"
                className="flex-1 font-mono h-11"
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4 sm:pt-6">
            <h3 className="text-sm font-medium">Advanced Options</h3>

            <div className="space-y-2">
              <Label htmlFor="recipients">Additional Recipients (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="recipients"
                  type="email"
                  placeholder="friend@example.com"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRecipient())}
                  data-testid="input-recipient"
                  className="font-mono h-11"
                />
                <Button
                  variant="outline"
                  onClick={handleAddRecipient}
                  disabled={!recipientInput.includes('@')}
                  data-testid="button-add-recipient"
                  className="h-11 w-11 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {recipients.map((email, i) => (
                    <Badge key={i} variant="secondary" className="gap-1" data-testid={`badge-recipient-${i}`}>
                      {email}
                      <X
                        className="h-3 w-3 cursor-pointer hover-elevate"
                        onClick={() => handleRemoveRecipient(i)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="spotify">Attach Music (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="spotify"
                  placeholder="Search for a song..."
                  value={spotifyQuery}
                  onChange={(e) => setSpotifyQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), spotifySearchMutation.mutate(spotifyQuery))}
                  data-testid="input-spotify-search"
                  className="font-mono h-11"
                />
                <Button
                  variant="outline"
                  onClick={() => spotifySearchMutation.mutate(spotifyQuery)}
                  disabled={spotifySearchMutation.isPending || !spotifyQuery}
                  data-testid="button-spotify-search"
                  className="h-11 w-11 p-0"
                >
                  <Music className="h-4 w-4" />
                </Button>
              </div>
              {spotifySearchMutation.data?.tracks && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {spotifySearchMutation.data.tracks.slice(0, 5).map((track: any) => (
                    <div
                      key={track.id}
                      onClick={() => {
                        setSelectedTrack(track);
                        setSpotifyQuery("");
                        spotifySearchMutation.reset();
                      }}
                      className="flex items-center gap-2 p-2 rounded hover-elevate cursor-pointer"
                      data-testid={`spotify-track-${track.id}`}
                    >
                      {track.album?.images?.[2] && (
                        <img src={track.album.images[2].url} alt="" className="h-8 w-8 rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{track.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {track.artists?.map((a: any) => a.name).join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedTrack && (
                <Badge variant="secondary" className="gap-1" data-testid="badge-selected-track">
                  <Music className="h-3 w-3" />
                  {selectedTrack.name} - {selectedTrack.artists?.[0]?.name}
                  <X
                    className="h-3 w-3 cursor-pointer hover-elevate"
                    onClick={() => setSelectedTrack(null)}
                  />
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., Central Park, NYC"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  data-testid="input-location"
                  className="flex-1 font-mono h-11"
                />
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover-elevate min-h-[44px]"
              onClick={() => setSelfDestruct(!selfDestruct)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && setSelfDestruct(!selfDestruct)}
            >
              <div className="flex items-center gap-3">
                <Flame className="h-4 w-4 text-destructive" />
                <div>
                  <Label htmlFor="self-destruct" className="cursor-pointer pointer-events-none">Self-Destruct Mode</Label>
                  <p className="text-xs text-muted-foreground">Capsule deletes after first view</p>
                </div>
              </div>
              <Switch
                id="self-destruct"
                checked={selfDestruct}
                onCheckedChange={setSelfDestruct}
                data-testid="switch-self-destruct"
                className="pointer-events-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
              className="h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              data-testid="button-save-capsule"
              disabled={!title || !content || !deliveryDate}
              className="glow-primary h-11"
            >
              Create Capsule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
