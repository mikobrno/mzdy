import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import PayrollDetailModal from '@/components/PayrollDetailModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const GET_SVJ_AND_EMPLOYEES = gql`
  query GetSVJAndEmployees($svjId: ID!, $month: Int!, $year: Int!) {
    svj(id: $svjId) {
      id
      name
      employees {
        id
        name
        baseSalary
        payrolls(where: { month: { _eq: $month }, year: { _eq: $year } }) {
          status
        }
      }
    }
  }
`;

export default function PayrollDetailPage() {
  const { svjId } = useParams();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data, loading, error, refetch } = useQuery(GET_SVJ_AND_EMPLOYEES, {
    variables: { svjId, month: currentMonth, year: currentYear },
  });

  const [calculatePayroll] = useMutation(gql`
    mutation CalculatePayroll($employeeId: ID!, $month: Int!, $year: Int!) {
      calculatePayroll(employeeId: $employeeId, month: $month, year: $year) {
        success
      }
    }
  `);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  const handleOpenModal = (payrollDetails, editable) => {
    setSelectedPayroll(payrollDetails);
    setIsEditable(editable);
    setIsModalOpen(true);
  };

  const handleCreatePayroll = async (employeeId) => {
    try {
      await calculatePayroll({ variables: { employeeId, month: currentMonth, year: currentYear } });
      alert('Mzda byla úspěšně vytvořena.');
      refetch(); // Refetch data to update the UI
    } catch (error) {
      console.error(error);
      alert('Chyba při vytváření mzdy.');
    }
  };

  const handleExportBankOrder = async () => {
    try {
      const response = await axios.post('/api/generate-bank-order', {
        svjId,
        month: currentMonth,
        year: currentYear,
      });

      const blob = new Blob([response.data], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bank-order.xml');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error(error);
      alert('Chyba při generování hromadného příkazu k úhradě.');
    }
  };

  if (loading) return <div>Načítání...</div>;
  if (error) return <div>Chyba při načítání dat: {error.message}</div>;

  const svj = data.svj;
  const employees = svj.employees.map((employee) => {
    const payroll = employee.payrolls[0];
    let payrollStatus = 'Nezpracováno';
    if (payroll) {
      payrollStatus = payroll.status === 'approved' ? 'Schváleno' : 'V přípravě';
    }
    return { ...employee, payrollStatus };
  });

  const allApproved = employees.every((employee) => employee.payrollStatus === 'Schváleno');

  return (
    <div className="p-6 space-y-6">
      {allApproved ? (
        <Card>
          <CardHeader>
            <CardTitle>Souhrn a exporty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={handleExportBankOrder}
              >
                Hromadný příkaz k úhradě (XML)
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Výplatní pásky (ZIP)</button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Přehledy pro pojišťovny (XML)</button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-gray-600">Nejprve je nutné schválit mzdy všech zaměstnanců.</p>
      )}

      <h1 className="text-2xl font-bold mb-4">Detail mezd pro SVJ {svj.name}</h1>

      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Jméno zaměstnance</th>
            <th className="border border-gray-300 px-4 py-2">Základní mzda</th>
            <th className="border border-gray-300 px-4 py-2">Stav mzdy</th>
            <th className="border border-gray-300 px-4 py-2">Akce</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="border border-gray-300 px-4 py-2">{employee.name}</td>
              <td className="border border-gray-300 px-4 py-2">{employee.baseSalary} Kč</td>
              <td className="border border-gray-300 px-4 py-2">{employee.payrollStatus}</td>
              <td className="border border-gray-300 px-4 py-2">
                {employee.payrollStatus === 'Nezpracováno' && (
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => handleCreatePayroll(employee.id)}
                  >
                    Vytvořit mzdu
                  </button>
                )}
                {employee.payrollStatus === 'V přípravě' && (
                  <button
                    className="text-yellow-500 hover:underline"
                    onClick={() => handleOpenModal(employee, true)}
                  >
                    Upravit mzdu
                  </button>
                )}
                {employee.payrollStatus === 'Schváleno' && (
                  <button
                    className="text-green-500 hover:underline"
                    onClick={() => handleOpenModal(employee, false)}
                  >
                    Zobrazit detail
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedPayroll && (
        <PayrollDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          payrollDetails={selectedPayroll}
          isEditable={isEditable}
          refetch={refetch}
        />
      )}
    </div>
  );
}
