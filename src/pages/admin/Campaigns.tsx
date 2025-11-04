import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const AdminCampaigns = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    messages: [""],
    start_date: "",
    end_date: "",
    is_active: true,
  });

  useEffect(() => {
    checkAdminAccess();
    fetchCampaigns();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin/auth");
      return;
    }

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
      _user_id: user.id
    });

    if (!isSuperAdmin) {
      navigate("/");
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const campaignData = {
        ...formData,
        created_by: user?.id,
        messages: formData.messages.filter(m => m.trim() !== ""),
      };

      if (editingCampaign) {
        const { error } = await supabase
          .from("campaigns")
          .update(campaignData)
          .eq("id", editingCampaign.id);

        if (error) throw error;
        toast({ title: "Campaign updated successfully" });
      } else {
        const { error } = await supabase.from("campaigns").insert([campaignData]);
        if (error) throw error;
        toast({ title: "Campaign created successfully" });
      }

      setShowForm(false);
      setEditingCampaign(null);
      setFormData({ title: "", messages: [""], start_date: "", end_date: "", is_active: true });
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast({ title: `Campaign ${!currentStatus ? "activated" : "deactivated"}` });
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Campaign deleted successfully" });
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (campaign: any) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      messages: campaign.messages || [""],
      start_date: campaign.start_date?.split('T')[0] || "",
      end_date: campaign.end_date?.split('T')[0] || "",
      is_active: campaign.is_active,
    });
    setShowForm(true);
  };

  const addMessage = () => {
    setFormData({ ...formData, messages: [...formData.messages, ""] });
  };

  const updateMessage = (index: number, value: string) => {
    const newMessages = [...formData.messages];
    newMessages[index] = value;
    setFormData({ ...formData, messages: newMessages });
  };

  const removeMessage = (index: number) => {
    const newMessages = formData.messages.filter((_, i) => i !== index);
    setFormData({ ...formData, messages: newMessages });
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">Manage Campaigns</h1>
            <p className="text-muted-foreground">{campaigns.length} total campaigns</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingCampaign(null);
              setFormData({ title: "", messages: [""], start_date: "", end_date: "", is_active: true });
            }}
            className="bg-secondary hover:bg-secondary/90 text-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-serif font-bold mb-4">
              {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Campaign Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Messages</Label>
                {formData.messages.map((message, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={message}
                      onChange={(e) => updateMessage(index, e.target.value)}
                      placeholder={`Message ${index + 1}`}
                      rows={2}
                    />
                    {formData.messages.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMessage(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addMessage}>
                  Add Another Message
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label>Active Campaign</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-primary">
                  {editingCampaign ? "Update" : "Create"} Campaign
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCampaign(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-serif font-bold">{campaign.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${campaign.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {campaign.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {campaign.messages?.map((msg: string, idx: number) => (
                      <p key={idx} className="text-sm text-muted-foreground">• {msg}</p>
                    ))}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <p>
                      <span className="font-semibold">Start:</span>{" "}
                      {new Date(campaign.start_date).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-semibold">End:</span>{" "}
                      {new Date(campaign.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(campaign.id, campaign.is_active)}
                  >
                    {campaign.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(campaign)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(campaign.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCampaigns;
