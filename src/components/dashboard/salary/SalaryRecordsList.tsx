
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { SalaryRecord } from './types';
import { AddSalaryRecordDialog } from './AddSalaryRecordDialog';

interface SalaryRecordsListProps {
  salaryRecords: SalaryRecord[];
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  amount: string;
  setAmount: (amount: string) => void;
  payPeriod: string;
  setPayPeriod: (period: string) => void;
  receivedDate: string;
  setReceivedDate: (date: string) => void;
  salaryMonth: string;
  setSalaryMonth: (month: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isBonus: boolean;
  setIsBonus: (isBonus: boolean) => void;
  onAddRecord: (e: React.FormEvent) => void;
}

export const SalaryRecordsList = ({
  salaryRecords,
  isDialogOpen,
  setIsDialogOpen,
  amount,
  setAmount,
  payPeriod,
  setPayPeriod,
  receivedDate,
  setReceivedDate,
  salaryMonth,
  setSalaryMonth,
  description,
  setDescription,
  isBonus,
  setIsBonus,
  onAddRecord
}: SalaryRecordsListProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Salary Records</CardTitle>
            <CardDescription>Track your salary and bonus payments with proper month mapping</CardDescription>
          </div>
          <AddSalaryRecordDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            amount={amount}
            setAmount={setAmount}
            payPeriod={payPeriod}
            setPayPeriod={setPayPeriod}
            receivedDate={receivedDate}
            setReceivedDate={setReceivedDate}
            salaryMonth={salaryMonth}
            setSalaryMonth={setSalaryMonth}
            description={description}
            setDescription={setDescription}
            isBonus={isBonus}
            setIsBonus={setIsBonus}
            onSubmit={onAddRecord}
          />
        </div>
      </CardHeader>
      <CardContent>
        {salaryRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No salary records yet. Add your first record to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {salaryRecords.map((record) => {
              const recordDate = parseISO(record.received_date);
              
              return (
                <div key={record.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">₹{record.amount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">
                      {record.pay_period} • Received: {format(recordDate, 'MMM dd, yyyy')}
                      {record.is_bonus && ' • Bonus'}
                    </div>
                    {!record.is_bonus && record.salary_month && (
                      <div className="text-sm text-blue-600">
                        Salary for: {format(parseISO(record.salary_month + '-01'), 'MMM yyyy')}
                      </div>
                    )}
                    {record.description && (
                      <div className="text-sm text-gray-600">{record.description}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
