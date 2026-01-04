import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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

// Mock data - replace with API calls
const mockWorkers = [
  { id: 1, name: "Rajesh Kumar" },
  { id: 2, name: "Mohammed Ali" },
  { id: 3, name: "Suresh Patel" },
  { id: 4, name: "Anil Sharma" },
];

const mockSheds = [
  { id: 1, name: "A", looms: [{ id: 1, loom_number: "1" }, { id: 2, loom_number: "2" }] },
  { id: 2, name: "B", looms: [{ id: 3, loom_number: "1" }, { id: 4, loom_number: "2" }, { id: 5, loom_number: "3" }] },
];

interface FormData {
  date: string;
  shift: "Day" | "Night";
  worker_id: string;
  loom_id: string;
  meters: string;
  rate: string;
}

export default function SalaryEntry() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    shift: "Day",
    worker_id: "",
    loom_id: "",
    meters: "",
    rate: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const submitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Entry Saved Successfully!",
      description: `${formData.meters} meters recorded for the ${formData.shift} shift.`,
    });

    // Clear meters for next entry
    setFormData((prev) => ({ ...prev, meters: "" }));
    setIsSubmitting(false);
  };

  const calculateTotal = () => {
    const meters = parseFloat(formData.meters) || 0;
    const rate = parseFloat(formData.rate) || 0;
    return (meters * rate).toFixed(2);
  };

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
                {mockWorkers.map((w) => (
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
                onChange={handleInputChange}
                required
                className="form-field"
              >
                <option value="">Select Loom</option>
                {mockSheds.map((shed) => (
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
                  <span className="text-xl font-bold text-primary">
                    ₹{calculateTotal()}
                  </span>
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
