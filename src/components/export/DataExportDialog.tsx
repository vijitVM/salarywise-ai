
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Database } from 'lucide-react';
import { exportToCSV, exportToJSON, exportReport, ExportData } from '@/utils/dataExport';
import { useToast } from '@/hooks/use-toast';

interface DataExportDialogProps {
  data: ExportData;
}

export const DataExportDialog = ({ data }: DataExportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = (type: 'csv' | 'json' | 'report') => {
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `salary_tracker_${timestamp}`;

      switch (type) {
        case 'csv':
          exportToCSV(data.salaryRecords, `${filename}_salary_records`);
          if (data.monthlyExpectedSalaries?.length > 0) {
            exportToCSV(data.monthlyExpectedSalaries, `${filename}_expected_salaries`);
          }
          break;
        case 'json':
          exportToJSON(data, filename);
          break;
        case 'report':
          exportReport(data, filename);
          break;
      }

      toast({
        title: "Export Successful",
        description: `Your data has been exported successfully.`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Your Data</DialogTitle>
          <DialogDescription>
            Choose a format to export your salary and financial data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="cursor-pointer hover:bg-accent" onClick={() => handleExport('csv')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4" />
                CSV Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Export as CSV files for use in Excel or other spreadsheet applications.
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => handleExport('json')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                JSON Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Export as JSON for backup or importing into other applications.
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => handleExport('report')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                Financial Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate a comprehensive financial summary report.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
