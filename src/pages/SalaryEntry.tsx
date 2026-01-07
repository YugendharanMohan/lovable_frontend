import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { workersApi, shedsApi, productionApi, Worker, Shed } from "@/lib/api";
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
} from "lucide-react";

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loomId = e.target.value;
    
    // Find the shed and loom details
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

      // Clear meters for next entry
      setFormData((prev) => ({ ...prev, meters: "" }));
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
    <div className="pt-28 md:pt-20 pb-8 px-4 min-h-screen flex items-start md:items-center justify-center">
      <div className="w-full max-w-lg animate-slide-up">
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
    </div>
  );
}
