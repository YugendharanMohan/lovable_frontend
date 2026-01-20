import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  workersApi, shedsApi, productionApi, 
  Worker, Shed, ProductionHistoryItem, ProductionUpdateEntry 
} from "@/lib/api";
import { ProductionEditModal } from "@/components/ProductionEditModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import {
  ArrowLeft,
  Calendar,
  Sun,
  Moon,
  User,
  Gauge,
  Ruler,
  IndianRupee,
  Loader2,
  CheckCircle2,
  Edit2,
  Trash2,
  Clock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FormData {
  date: string;
  shift: "Day" | "Night";
  worker_id: string;
  loom_id: string;
  shed_name: string;
  loom_number: string;
  meters: string;
  rate: string;
}

export default function SalaryEntry() {
  const { toast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [sheds, setSheds] = useState<Shed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recent entries state
  const [recentEntries, setRecentEntries] = useState<ProductionHistoryItem[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  // Edit/Delete modal state
  const [editEntry, setEditEntry] = useState<ProductionHistoryItem | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<ProductionHistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    shift: "Day",
    worker_id: "",
    loom_id: "",
    shed_name: "",
    loom_number: "",
    meters: "",
    rate: "",
  });

  // Fetch workers and sheds on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [workersData, shedsData] = await Promise.all([
          workersApi.getAll(),
          shedsApi.getHierarchy(),
        ]);
        setWorkers(workersData);
        setSheds(shedsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Check your connection.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Fetch recent entries for today
  const fetchRecentEntries = async () => {
    try {
      setIsLoadingRecent(true);
      const today = formData.date;
      const entries = await productionApi.getHistory(today, today);
      setRecentEntries(entries);
    } catch (error) {
      console.error("Failed to fetch recent entries:", error);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchRecentEntries();
    }
  }, [isLoading, formData.date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loomId = e.target.value;
    
    let shedName = "";
    let loomNumber = "";
    
    for (const shed of sheds) {
      const loom = shed.looms.find((l) => l.id === loomId);
      if (loom) {
        shedName = shed.name;
        loomNumber = loom.loom_number;
        break;
      }
    }

    setFormData((prev) => ({
      ...prev,
      loom_id: loomId,
      shed_name: shedName,
      loom_number: loomNumber,
    }));
  };

  const submitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.worker_id || !formData.loom_id || !formData.meters || !formData.rate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await productionApi.add({
        worker_id: formData.worker_id,
        loom_id: formData.loom_id,
        shed_name: formData.shed_name,
        loom_number: formData.loom_number,
        date: formData.date,
        shift: formData.shift,
        meters: parseFloat(formData.meters),
        rate: parseFloat(formData.rate),
      });

      toast({
        title: "Entry Saved Successfully!",
        description: `${formData.meters} meters recorded for the ${formData.shift} shift.`,
      });

      // Clear meters for next entry and refresh recent entries
      setFormData((prev) => ({ ...prev, meters: "" }));
      fetchRecentEntries();
    } catch (error) {
      console.error("Failed to submit entry:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save entry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSave = async (id: string, data: ProductionUpdateEntry) => {
    try {
      await productionApi.update(id, data);
      toast({
        title: "Entry Updated",
        description: "Production entry has been updated successfully.",
      });
      fetchRecentEntries();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update entry.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteEntry) return;
    
    try {
      setIsDeleting(true);
      await productionApi.delete(deleteEntry.id);
      toast({
        title: "Entry Deleted",
        description: "Production entry has been deleted.",
      });
      setDeleteEntry(null);
      fetchRecentEntries();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete entry.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const calculateTotal = () => {
    const meters = parseFloat(formData.meters) || 0;
    const rate = parseFloat(formData.rate) || 0;
    return (meters * rate).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="pt-28 md:pt-20 pb-8 px-4 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-20 pb-8 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entry Form */}
          <div className="animate-slide-up">
            <div className="card-elevated p-6 sm:p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Daily Production</h1>
                  <p className="text-muted-foreground text-sm mt-1">Enter meter readings</p>
                </div>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                </Link>
              </div>

              {/* Form */}
              <form onSubmit={submitEntry} className="space-y-5">
                {/* Date & Shift Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="form-field"
                    />
                  </div>
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      {formData.shift === "Day" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />} Shift
                    </label>
                    <select
                      id="shift"
                      value={formData.shift}
                      onChange={handleInputChange}
                      className="form-field"
                    >
                      <option value="Day">Day Shift</option>
                      <option value="Night">Night Shift</option>
                    </select>
                  </div>
                </div>

                {/* Worker Selection */}
                <div>
                  <label className="form-label flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Worker
                  </label>
                  <select
                    id="worker_id"
                    value={formData.worker_id}
                    onChange={handleInputChange}
                    required
                    className="form-field"
                  >
                    <option value="">Select Worker</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Loom Selection */}
                <div>
                  <label className="form-label flex items-center gap-1.5">
                    <Gauge className="w-3 h-3" /> Loom
                  </label>
                  <select
                    id="loom_id"
                    value={formData.loom_id}
                    onChange={handleLoomChange}
                    required
                    className="form-field"
                  >
                    <option value="">Select Loom</option>
                    {sheds.map((shed) => (
                      <optgroup key={shed.id} label={`Shed ${shed.name}`}>
                        {shed.looms.map((loom) => (
                          <option key={loom.id} value={loom.id}>
                            Loom {shed.name}{loom.loom_number}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Meters & Rate Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <Ruler className="w-3 h-3" /> Meters
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      id="meters"
                      value={formData.meters}
                      onChange={handleInputChange}
                      required
                      className="form-field"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="form-label flex items-center gap-1.5">
                      <IndianRupee className="w-3 h-3" /> Rate (₹/m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      id="rate"
                      value={formData.rate}
                      onChange={handleInputChange}
                      required
                      className="form-field"
                      placeholder="12.50"
                    />
                  </div>
                </div>

                {/* Total Preview */}
                {formData.meters && formData.rate && (
                  <div className="p-4 bg-accent rounded-lg border border-primary/20 animate-scale-in">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Calculated Amount</span>
                      <span className="text-xl font-bold text-primary">₹{calculateTotal()}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Entry...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Production Entry
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Recent Entries */}
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="card-elevated overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Today's Entries</h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  {recentEntries.length} records
                </span>
              </div>

              {isLoadingRecent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : recentEntries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No entries for {formData.date}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Worker</TableHead>
                        <TableHead>Loom</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead className="text-right">Meters</TableHead>
                        <TableHead className="text-right">₹</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.worker_name}</TableCell>
                          <TableCell>{entry.shed_name}{entry.loom_number}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                entry.shift === "Day"
                                  ? "bg-warning/20 text-warning"
                                  : "bg-secondary text-secondary-foreground"
                              }`}
                            >
                              {entry.shift}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{entry.meters}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{entry.earnings.toFixed(0)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditEntry(entry)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteEntry(entry)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ProductionEditModal
        entry={editEntry}
        open={!!editEntry}
        onClose={() => setEditEntry(null)}
        onSave={handleEditSave}
        workers={workers}
        sheds={sheds}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteEntry}
        onClose={() => setDeleteEntry(null)}
        onConfirm={handleDelete}
        title="Delete Production Entry"
        description={`Are you sure you want to delete this entry for ${deleteEntry?.worker_name}? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
