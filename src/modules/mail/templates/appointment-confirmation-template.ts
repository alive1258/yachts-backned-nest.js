interface AppointmentConfirmationData {
  patientName: string;
  status: string;
  service: string;
  appointmentDate: string;
  estimatedTime: string;
  serialNumber: number;
  chamberName: string;
  chamberAddress?: string;
  fee: number;
}

export function AppointmentConfirmationTemplate({
  patientName,
  status,
  service,
  appointmentDate,
  estimatedTime,
  serialNumber,
  chamberName,
  chamberAddress,
  fee,
}: AppointmentConfirmationData): string {
  const rows: Array<[string, string]> = [
    ['Status', status],
    ['Reason for Visit', service],
    ['Date', appointmentDate],
    ['Serial Number', `#${serialNumber}`],
    ['Estimated Time', estimatedTime],
    ['Chamber', chamberAddress ? `${chamberName} — ${chamberAddress}` : chamberName],
    ['Consultation Fee', `৳${fee} (payable at the chamber)`],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;">${label}</td>
          <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${value}</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appointment Confirmation</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:#2AA7FF;padding:24px 32px;">
                <h1 style="margin:0;color:#ffffff;font-size:20px;">Appointment Request Received</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <p style="margin:0 0 16px;color:#111827;font-size:15px;">
                  Hi ${patientName}, thanks for booking with Dr. Anarul Islam. Here are your appointment details:
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;">
                  ${rowsHtml}
                </table>
                <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">
                  Please arrive a few minutes before your estimated time. Times are approximate and may shift
                  depending on how earlier consultations run. The consultation fee is paid at the chamber, not online.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
