import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { apiService } from '@/services/api'

// GraphQL mutations removed — using Supabase via apiService

export default function PayrollDetailModal({ isOpen, onClose, payrollDetails, isEditable, refetch }) {
  // Use apiService methods instead of Apollo mutations

  const handleSaveChanges = async () => {
    try {
      await apiService.updatePayroll(payrollDetails.id, {
        deductions: payrollDetails.deductions,
        bonuses: payrollDetails.bonuses
      })
      alert('Změny byly úspěšně uloženy.');
      onClose();
      refetch();
    } catch (error) {
      console.error(error);
      alert('Chyba při ukládání změn.');
    }
  };

  const handleApprovePayroll = async () => {
    try {
  await apiService.updatePayrollStatus(payrollDetails.id, 'approved')
      alert('Mzda byla úspěšně schválena.');
      onClose();
      refetch();
    } catch (error) {
      console.error(error);
      alert('Chyba při schvalování mzdy.');
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader title={"Detail mzdy"} />
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Hrubá mzda</label>
            <input
              type="text"
              value={payrollDetails.grossSalary}
              readOnly
              placeholder="Hrubá mzda"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Bonusy</label>
            <input
              type="text"
              value={payrollDetails.bonuses}
              onChange={(e) => (payrollDetails.bonuses = e.target.value)}
              readOnly={!isEditable}
              placeholder="Bonusy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Srážky (exekuce)</label>
            <input
              type="text"
              value={payrollDetails.deductions}
              onChange={(e) => (payrollDetails.deductions = e.target.value)}
              readOnly={!isEditable}
              placeholder="Srážky (exekuce)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Čistá mzda</label>
            <input
              type="text"
              value={payrollDetails.netSalary}
              readOnly
              placeholder="Čistá mzda"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
  <DialogFooter>
          {isEditable && (
            <button
              className="px-4 py-2 bg-gray-200 rounded-md"
              onClick={onClose}
            >
              Zrušit
            </button>
          )}
          {isEditable && (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={handleSaveChanges}
            >
              Uložit změny
            </button>
          )}
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md"
            onClick={handleApprovePayroll}
          >
            Schválit mzdu
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
