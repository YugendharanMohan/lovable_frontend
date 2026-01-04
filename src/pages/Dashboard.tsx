import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Warehouse, Settings2, FileSpreadsheet, ChevronRight, Calendar } from "lucide-react";

// Mock data - replace with API calls
const mockWorkers = [{
  id: 1,
  name: "Rajesh Kumar"
}, {
  id: 2,
  name: "Mohammed Ali"
}, {
  id: 3,
  name: "Suresh Patel"
}, {
  id: 4,
  name: "Anil Sharma"
}];
const mockSheds = [{
  id: 1,
  name: "A",
  looms: [{
    id: 1,
    loom_number: "1"
  }, {
    id: 2,
    loom_number: "2"
  }]
}, {
  id: 2,
  name: "B",
  looms: [{
    id: 3,
    loom_number: "1"
  }, {
    id: 4,
    loom_number: "2"
  }, {
    id: 5,
    loom_number: "3"
  }]
}];
export default function Dashboard() {
  const {
    toast
  } = useToast();
  const [workers, setWorkers] = useState(mockWorkers);
  const [sheds, setSheds] = useState(mockSheds);

  // Form states
  const [workerName, setWorkerName] = useState("");
  const [shedName, setShedName] = useState("");
  const [selectedShed, setSelectedShed] = useState("");
  const [loomNum, setLoomNum] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDay.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const addWorker = () => {
    if (!workerName.trim()) {
      toast({
        title: "Error",
        description: "Enter worker name",
        variant: "destructive"
      });
      return;
    }
    const newWorker = {
      id: Date.now(),
      name: workerName
    };
    setWorkers([...workers, newWorker]);
    setWorkerName("");
    toast({
      title: "Success",
      description: "Worker added successfully"
    });
  };
  const addShed = () => {
    if (!shedName.trim()) {
      toast({
        title: "Error",
        description: "Enter shed name",
        variant: "destructive"
      });
      return;
    }
    const newShed = {
      id: Date.now(),
      name: shedName,
      looms: []
    };
    setSheds([...sheds, newShed]);
    setShedName("");
    toast({
      title: "Success",
      description: "Shed added successfully"
    });
  };
  const addLoom = () => {
    if (!selectedShed || !loomNum.trim()) {
      toast({
        title: "Error",
        description: "Select shed and enter loom number",
        variant: "destructive"
      });
      return;
    }
    setSheds(sheds.map(shed => {
      if (shed.id === parseInt(selectedShed)) {
        return {
          ...shed,
          looms: [...shed.looms, {
            id: Date.now(),
            loom_number: loomNum
          }]
        };
      }
      return shed;
    }));
    setLoomNum("");
    toast({
      title: "Success",
      description: "Loom added to shed"
    });
  };
  return <div className="pt-28 md:pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage workers, sheds, and looms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workers Section */}
        <div className="card-elevated p-6 animate-slide-up" style={{
        animationDelay: "0.1s"
      }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-bold text-lg text-foreground">Workers</h2>
          </div>

          <div className="space-y-3 mb-5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="form-label flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Start Date
                </label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-field text-sm" />
              </div>
              <div>
                <label className="form-label flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> End Date
                </label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-field text-sm" />
              </div>
            </div>

            <div className="flex gap-2">
              <input value={workerName} onChange={e => setWorkerName(e.target.value)} placeholder="New Worker Name" className="form-field flex-grow" onKeyDown={e => e.key === "Enter" && addWorker()} />
              <Button onClick={addWorker} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <ul className="space-y-1 max-h-64 overflow-y-auto">
              {workers.map(w => <li key={w.id} className="flex justify-between items-center py-2.5 px-3 rounded-lg hover:bg-accent cursor-pointer group transition-colors">
                  <span className="font-medium text-foreground">{w.name}</span>
                  <span className="text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    VIEW SLIP <ChevronRight className="w-3 h-3" />
                  </span>
                </li>)}
            </ul>
          </div>
        </div>

        {/* Loom Configuration Section */}
        <div className="card-elevated p-6 animate-slide-up" style={{
        animationDelay: "0.2s"
      }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-secondary-foreground" />
            </div>
            <h2 className="font-bold text-lg text-foreground">Sheds & Looms </h2>
          </div>

          <div className="space-y-4">
            {/* Add Shed */}
            <div>
              <label className="form-label">Add New Shed</label>
              <div className="flex gap-2">
                <input value={shedName} onChange={e => setShedName(e.target.value)} placeholder="Shed Name (A, B...)" className="form-field flex-grow" onKeyDown={e => e.key === "Enter" && addShed()} />
                <Button onClick={addShed} variant="secondary">
                  Add
                </Button>
              </div>
            </div>

            {/* Add Loom to Shed */}
            <div className="border-t pt-4">
              <label className="form-label">Add Loom to Shed</label>
              <select value={selectedShed} onChange={e => setSelectedShed(e.target.value)} className="form-field mb-2">
                <option value="">Select Shed</option>
                {sheds.map(s => <option key={s.id} value={s.id}>
                    Shed {s.name}
                  </option>)}
              </select>
              <input value={loomNum} onChange={e => setLoomNum(e.target.value)} placeholder="Loom Number" className="form-field mb-2" onKeyDown={e => e.key === "Enter" && addLoom()} />
              <Button onClick={addLoom} className="w-full">
                <Warehouse className="w-4 h-4" />
                Add Loom to Shed
              </Button>
            </div>

            {/* Sheds List */}
            <div className="border-t pt-4">
              <p className="form-label mb-2">Current Sheds</p>
              <div className="space-y-2">
                {sheds.map(shed => <div key={shed.id} className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold text-foreground text-sm">Shed {shed.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {shed.looms.length} loom{shed.looms.length !== 1 ? "s" : ""}: {shed.looms.map(l => l.loom_number).join(", ") || "None"}
                    </p>
                  </div>)}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="card-elevated p-6 flex flex-col justify-center animate-slide-up" style={{
        animationDelay: "0.3s"
      }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-success" />
            </div>
            <h2 className="font-bold text-lg text-foreground">Quick Actions</h2>
          </div>

          <Link to="/salary-entry" className="block">
            <Button variant="success" size="lg" className="w-full h-14 text-base">
              <FileSpreadsheet className="w-5 h-5" />
              Daily Meter Entry
            </Button>
          </Link>

          <p className="text-muted-foreground text-xs text-center mt-6 italic">
            Select a worker above to generate their salary slip
          </p>

          {/* Stats preview */}
          <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{workers.length}</p>
              <p className="text-xs text-muted-foreground">Total Workers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {sheds.reduce((acc, s) => acc + s.looms.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Looms</p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}