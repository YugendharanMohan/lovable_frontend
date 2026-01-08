import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface SalaryRecord {
  date: string;
  loom: string;
  meters: number;
  loom_id: string;
}

interface SalarySlipProps {
  isOpen: boolean;
  onClose: () => void;
  workerName: string;
  startDate: string;
  endDate: string;
  details: SalaryRecord[];
  summary: {
    total_meters: number;
    total_salary: number;
  };
}

export const SalarySlipModal = ({
  isOpen,
  onClose,
  workerName,
  startDate,
  endDate,
  details,
  summary
}: SalarySlipProps) => {
  const uniqueDates = [...new Set(details.map(d => d.date))].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const uniqueLooms = [...new Set(details.map(d => d.loom))].sort((a, b) => a.localeCompare(b, undefined, {
    numeric: true
  }));

  // Initialize date map
  const dateMap: Record<string, Record<string, number>> = {};
  uniqueDates.forEach(date => {
    dateMap[date] = {};
    uniqueLooms.forEach(loom => dateMap[date][loom] = 0);
  });

  // Initialize loom totals
  const loomTotals: Record<string, number> = {};
  uniqueLooms.forEach(loom => loomTotals[loom] = 0);

  // Fill values
  details.forEach(rec => {
    const meters = rec.meters || 0;
    if (dateMap[rec.date] && dateMap[rec.date][rec.loom] !== undefined) {
      dateMap[rec.date][rec.loom] += meters;
    }
    if (loomTotals[rec.loom] !== undefined) {
      loomTotals[rec.loom] += meters;
    }
  });

  const totalMeters = summary.total_meters || 0;
  const totalSalary = summary.total_salary || 0;
  const avgRate = totalMeters > 0 ? totalSalary / totalMeters : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Create a printable HTML content
    const printContent = document.getElementById('salary-slip-printable');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary Slip - ${workerName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .header p { font-size: 12px; color: #666; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; background: #f5f5f5; padding: 15px; border-radius: 8px; }
            .info-grid span { font-size: 14px; }
            .info-grid .label { color: #666; }
            .info-grid .value { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background: #f0f0f0; font-weight: bold; }
            .date-cell { font-weight: bold; background: #f9f9f9; }
            .total-row { background: #e0e0e0; font-weight: bold; }
            .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
            .summary-box { padding: 15px; border-radius: 8px; }
            .loom-summary { background: #f5f5f5; }
            .loom-summary table { margin-top: 10px; }
            .grand-total { background: #e8f4e8; }
            .grand-total h3 { margin-bottom: 10px; }
            .grand-total .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .grand-total .total-line { border-top: 2px solid #333; padding-top: 10px; font-size: 18px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ASM BILLING</h1>
            <p>Loom Management System - Salary Slip</p>
          </div>
          
          <div class="info-grid">
            <div><span class="label">Worker:</span> <span class="value">${workerName}</span></div>
            <div><span class="label">Period:</span> <span class="value">${startDate} to ${endDate}</span></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>DATE</th>
                ${uniqueLooms.map(loom => `<th>${loom}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${uniqueDates.map(date => `
                <tr>
                  <td class="date-cell">${new Date(date).getDate()}/${new Date(date).getMonth() + 1}</td>
                  ${uniqueLooms.map(loom => {
                    const val = dateMap[date][loom];
                    return `<td>${val > 0 ? val.toFixed(1) : '-'}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td>TOTAL</td>
                ${uniqueLooms.map(loom => `<td>${loomTotals[loom].toFixed(1)}</td>`).join('')}
              </tr>
            </tfoot>
          </table>

          <div class="summary">
            <div class="summary-box loom-summary">
              <h4>Loom Summary</h4>
              <table>
                <tbody>
                  ${uniqueLooms.map(loom => `
                    <tr>
                      <td style="text-align: left; font-weight: bold;">${loom}</td>
                      <td style="text-align: right;">${loomTotals[loom].toFixed(1)} m</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="summary-box grand-total">
              <h3>Payment Summary</h3>
              <div class="row"><span>Total Meters:</span><span>${totalMeters.toFixed(2)} m</span></div>
              <div class="row"><span>Rate per Meter:</span><span>₹ ${avgRate.toFixed(2)}</span></div>
              <div class="row total-line"><span><strong>Total Salary:</strong></span><span><strong>₹ ${Math.round(totalSalary)}</strong></span></div>
            </div>
          </div>

          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load then trigger print (which allows save as PDF)
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-full print:max-h-full print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center justify-between">
            <span>Salary Slip</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Printable Content */}
        <div id="salary-slip-printable" className="salary-slip-content p-4">
          {/* Header */}
          

          {/* Worker Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 bg-muted/50 p-4 rounded-lg">
            <div>
              
              <span className="ml-2 font-bold text-foreground">{workerName}</span>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">PERIOD:</span>
              <span className="ml-2 font-bold text-foreground">{startDate} to {endDate}</span>
            </div>
          </div>

          {/* Production Grid */}
          <div className="mb-6 overflow-x-auto">
            
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 border border-border bg-muted font-bold">DATE</th>
                  {uniqueLooms.map(loom => <th key={loom} className="p-2 border border-border bg-muted font-bold">
                      {loom}
                    </th>)}
                </tr>
              </thead>
              <tbody>
                {uniqueDates.map(date => <tr key={date}>
                    <td className="p-2 border border-border font-bold bg-muted/50">
                      {formatDate(date)}
                    </td>
                    {uniqueLooms.map(loom => {
                  const val = dateMap[date][loom];
                  return <td key={loom} className="p-2 border border-border text-center">
                          {val > 0 ? val.toFixed(1) : "-"}
                        </td>;
                })}
                  </tr>)}
              </tbody>
              <tfoot>
                <tr className="bg-muted font-bold">
                  <td className="p-2 border border-border">TOTAL</td>
                  {uniqueLooms.map(loom => <td key={loom} className="p-2 border border-border text-center">
                      {loomTotals[loom].toFixed(1)}
                    </td>)}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-2 gap-6">
            {/* Loom Summary */}
            <div>
              
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {uniqueLooms.map(loom => <tr key={loom}>
                      <td className="border border-border p-2 font-bold">{loom}</td>
                      <td className="border border-border p-2 text-right">
                        {loomTotals[loom].toFixed(1)} m
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {/* Grand Totals */}
            <div className="bg-primary/10 p-4 rounded-lg">
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Meters:</span>
                  <span className="font-bold text-foreground">{totalMeters.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate per Meter:</span>
                  <span className="font-bold text-foreground">₹ {avgRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-primary pt-3">
                  <span className="text-lg font-bold text-foreground">Total Salary:</span>
                  <span className="text-lg font-bold text-primary">₹ {Math.round(totalSalary)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};