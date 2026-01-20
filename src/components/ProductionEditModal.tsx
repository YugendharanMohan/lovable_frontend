import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductionHistoryItem, ProductionUpdateEntry, Worker, Shed } from "@/lib/api";
import { Loader2, Calendar, Sun, Moon, Ruler, IndianRupee } from "lucide-react";

interface ProductionEditModalProps {
  entry: ProductionHistoryItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: ProductionUpdateEntry) => Promise<void>;
  workers: Worker[];
  sheds: Shed[];
}

export function ProductionEditModal({
  entry,
  open,
  onClose,
  onSave,
  workers,
  sheds,
}: ProductionEditModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    shift: "Day" as "Day" | "Night",
    worker_id: "",
    loom_id: "",
    shed_name: "",
    loom_number: "",
    meters: "",
    rate: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setFormData({
        date: entry.date,
        shift: entry.shift,
        worker_id: entry.worker_id,
        loom_id: entry.loom_id,
        shed_name: entry.shed_name,
        loom_number: entry.loom_number,
        meters: entry.meters.toString(),
        rate: entry.rate.toString(),
      });
    }
  }, [entry]);

  const handleLoomChange = (loomId: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;

    setIsSaving(true);
    try {
      await onSave(entry.id, {
        date: formData.date,
        shift: formData.shift,
        worker_id: formData.worker_id,
        loom_id: formData.loom_id,
        shed_name: formData.shed_name,
        loom_number: formData.loom_number,
        meters: parseFloat(formData.meters),
        rate: parseFloat(formData.rate),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const calculateTotal = () => {
    const meters = parseFloat(formData.meters) || 0;
    const rate = parseFloat(formData.rate) || 0;
    return (meters * rate).toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Production Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date & Shift */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
                className="form-field"
              />
            </div>
            <div>
              <label className="form-label flex items-center gap-1.5">
                {formData.shift === "Day" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />} Shift
              </label>
              <Select
                value={formData.shift}
                onValueChange={(value: "Day" | "Night") =>
                  setFormData((prev) => ({ ...prev, shift: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Day">Day Shift</SelectItem>
                  <SelectItem value="Night">Night Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Worker */}
          <div>
            <label className="form-label">Worker</label>
            <Select
              value={formData.worker_id}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, worker_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Worker" />
              </SelectTrigger>
              <SelectContent>
                {workers.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loom */}
          <div>
            <label className="form-label">Loom</label>
            <Select value={formData.loom_id} onValueChange={handleLoomChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Loom" />
              </SelectTrigger>
              <SelectContent>
                {sheds.map((shed) =>
                  shed.looms.map((loom) => (
                    <SelectItem key={loom.id} value={loom.id}>
                      Shed {shed.name} - Loom {loom.loom_number}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Meters & Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label flex items-center gap-1.5">
                <Ruler className="w-3 h-3" /> Meters
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.meters}
                onChange={(e) => setFormData((prev) => ({ ...prev, meters: e.target.value }))}
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
                value={formData.rate}
                onChange={(e) => setFormData((prev) => ({ ...prev, rate: e.target.value }))}
                required
                className="form-field"
                placeholder="12.50"
              />
            </div>
          </div>

          {/* Total Preview */}
          {formData.meters && formData.rate && (
            <div className="p-3 bg-accent rounded-lg border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Calculated Amount</span>
                <span className="text-lg font-bold text-primary">₹{calculateTotal()}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
