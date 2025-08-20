// @ts-ignore
import { gql } from 'graphql-request';
import { nhost } from '@/lib/nhost';

export default async function handler(req, res) {
  const { svjId, month, year } = req.body;

  if (!svjId || !month || !year) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const GET_APPROVED_PAYROLLS = gql`
    query GetApprovedPayrolls($svjId: ID!, $month: Int!, $year: Int!) {
      payrolls(where: { svjId: { _eq: $svjId }, month: { _eq: $month }, year: { _eq: $year }, status: { _eq: "approved" } }) {
        employee {
          name
          bankAccount
        }
        netSalary
      }
    }
  `;

  try {
    const response: any = await nhost.graphql.request(GET_APPROVED_PAYROLLS, {
      svjId,
      month,
      year,
    });
    const payrolls = response.data?.payrolls;

    if (!payrolls || payrolls.length === 0) {
      return res.status(404).json({ error: 'No approved payrolls found for the given parameters' });
    }

    // Generate XML content
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += '<Payments>\n';

    payrolls.forEach((payroll) => {
      xmlContent += `  <Payment>\n`;
      xmlContent += `    <Name>${payroll.employee.name}</Name>\n`;
      xmlContent += `    <BankAccount>${payroll.employee.bankAccount}</BankAccount>\n`;
      xmlContent += `    <Amount>${payroll.netSalary}</Amount>\n`;
      xmlContent += `  </Payment>\n`;
    });

    xmlContent += '</Payments>';

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="bank-order.xml"');
    res.status(200).send(xmlContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while generating the bank order' });
  }
}
