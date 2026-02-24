// PDF Generator utility for attendance reports
import type { Student, Attendance } from "./types";
import { formatDate } from "@/lib/utils";

interface AttendanceReportData {
  subject: string;
  department: string;
  startDate: string;
  endDate: string;
  students: Student[];
  attendance: Attendance[];
}

export function generateAttendancePDF(data: AttendanceReportData): void {
  const { subject, department, startDate, endDate, students, attendance } = data;

  // Get unique dates from attendance records within the date range
  const dates = [...new Set(attendance.map((a) => a.date))].sort();

  // Build student attendance matrix
  const studentData = students.map((student) => {
    const studentAttendance = attendance.filter((a) => a.studentId === student.id);
    const presentCount = studentAttendance.filter((a) => a.status === "present").length;
    const absentCount = studentAttendance.filter((a) => a.status === "absent").length;
    const lateCount = studentAttendance.filter((a) => a.status === "late").length;
    const total = studentAttendance.length;
    const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

    return {
      name: student.name,
      rollNumber: student.rollNumber,
      semester: student.semester,
      presentCount,
      absentCount,
      lateCount,
      total,
      percentage,
      dailyStatus: dates.map((date) => {
        const record = studentAttendance.find((a) => a.date === date);
        return record ? record.status : "-";
      }),
    };
  });

  const totalPresent = studentData.reduce((sum, s) => sum + s.presentCount, 0);
  const totalAbsent = studentData.reduce((sum, s) => sum + s.absentCount, 0);
  const totalLate = studentData.reduce((sum, s) => sum + s.lateCount, 0);

  // Create printable HTML content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Attendance Report - ${subject}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .header h1 { font-size: 18px; margin-bottom: 5px; color: #1e40af; }
        .header h2 { font-size: 14px; margin-bottom: 3px; }
        .header p { font-size: 11px; color: #666; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
        .info-item { text-align: center; }
        .info-item strong { display: block; font-size: 10px; color: #666; text-transform: uppercase; }
        .info-item span { font-size: 13px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px 4px; text-align: center; font-size: 10px; }
        th { background: #1e40af; color: white; font-weight: bold; }
        .student-name { text-align: left; min-width: 120px; }
        .roll-number { font-family: monospace; font-size: 9px; }
        .present { background: #dcfce7; color: #166534; }
        .absent { background: #fee2e2; color: #991b1b; }
        .late { background: #fef3c7; color: #92400e; }
        .percentage { font-weight: bold; }
        .percentage.high { color: #166534; }
        .percentage.low { color: #991b1b; }
        .summary { margin-top: 20px; display: flex; gap: 20px; justify-content: center; }
        .summary-item { padding: 15px 30px; border-radius: 5px; text-align: center; }
        .summary-item.present-bg { background: #dcfce7; }
        .summary-item.absent-bg { background: #fee2e2; }
        .summary-item.late-bg { background: #fef3c7; }
        .summary-item strong { display: block; font-size: 24px; color: #1e40af; }
        .summary-item span { font-size: 12px; color: #666; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
        @media print {
          body { padding: 10px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>COOCH BEHAR GOVERNMENT ENGINEERING COLLEGE</h1>
        <h2>Subject-wise Attendance Report</h2>
        <p>Generated on ${new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      <div class="info-row">
        <div class="info-item">
          <strong>Period</strong>
          <span>${formatDate(startDate)} - ${formatDate(endDate)}</span>
        </div>
        <div class="info-item">
          <strong>Subject</strong>
          <span>${subject}</span>
        </div>
        <div class="info-item">
          <strong>Department</strong>
          <span>${department}</span>
        </div>
        <div class="info-item">
          <strong>Total Classes</strong>
          <span>${dates.length}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th class="student-name">Student Name</th>
            <th>Roll Number</th>
            <th>Semester</th>
            ${dates.map((d) => `<th>${new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit" })}</th>`).join("")}
            <th>P</th>
            <th>A</th>
            <th>L</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          ${studentData
            .map(
              (s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td class="student-name">${s.name}</td>
              <td class="roll-number">${s.rollNumber}</td>
              <td>${s.semester}</td>
              ${s.dailyStatus.map((status) => `<td class="${status}">${status === "present" ? "P" : status === "absent" ? "A" : status === "late" ? "L" : "-"}</td>`).join("")}
              <td class="present">${s.presentCount}</td>
              <td class="absent">${s.absentCount}</td>
              <td class="late">${s.lateCount}</td>
              <td class="percentage ${s.percentage >= 75 ? "high" : "low"}">${s.percentage}%</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-item present-bg">
          <strong>${totalPresent}</strong>
          <span>Total Present</span>
        </div>
        <div class="summary-item absent-bg">
          <strong>${totalAbsent}</strong>
          <span>Total Absent</span>
        </div>
        <div class="summary-item late-bg">
          <strong>${totalLate}</strong>
          <span>Total Late</span>
        </div>
      </div>

      <div class="footer">
        <p>This is a computer-generated report from CGEC Student Management System</p>
        <p style="margin-top: 30px;">Teacher's Signature: _______________________</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

export function generateDateWiseAttendancePDF(data: {
  date: string;
  subject: string;
  department: string;
  students: Student[];
  attendance: Attendance[];
}): void {
  const { date, subject, department, students, attendance } = data;

  const studentData = students.map((student) => {
    const record = attendance.find((a) => a.studentId === student.id);
    return {
      name: student.name,
      rollNumber: student.rollNumber,
      semester: student.semester,
      status: record?.status || "not-marked",
    };
  });

  const presentCount = studentData.filter((s) => s.status === "present").length;
  const absentCount = studentData.filter((s) => s.status === "absent").length;
  const lateCount = studentData.filter((s) => s.status === "late").length;

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Attendance - ${date} - ${subject}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .header h1 { font-size: 18px; margin-bottom: 5px; color: #1e40af; }
        .header h2 { font-size: 14px; margin-bottom: 3px; }
        .header p { font-size: 11px; color: #666; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
        .info-item { text-align: center; }
        .info-item strong { display: block; font-size: 10px; color: #666; text-transform: uppercase; }
        .info-item span { font-size: 13px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background: #1e40af; color: white; font-weight: bold; }
        .student-name { text-align: left; }
        .roll-number { font-family: monospace; }
        .present { background: #dcfce7; color: #166534; font-weight: bold; }
        .absent { background: #fee2e2; color: #991b1b; font-weight: bold; }
        .late { background: #fef3c7; color: #92400e; font-weight: bold; }
        .summary { margin-top: 20px; display: flex; gap: 20px; justify-content: center; }
        .summary-item { padding: 15px 30px; border-radius: 5px; text-align: center; }
        .summary-item.present-bg { background: #dcfce7; }
        .summary-item.absent-bg { background: #fee2e2; }
        .summary-item.late-bg { background: #fef3c7; }
        .summary-item strong { display: block; font-size: 24px; }
        .summary-item span { font-size: 12px; color: #666; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>COOCH BEHAR GOVERNMENT ENGINEERING COLLEGE</h1>
        <h2>Daily Attendance Sheet</h2>
        <p>Generated on ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}</p>
      </div>
      
      <div class="info-row">
        <div class="info-item">
          <strong>Date</strong>
          <span>${formatDate(date)}</span>
        </div>
        <div class="info-item">
          <strong>Subject</strong>
          <span>${subject}</span>
        </div>
        <div class="info-item">
          <strong>Department</strong>
          <span>${department}</span>
        </div>
        <div class="info-item">
          <strong>Total Students</strong>
          <span>${students.length}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th class="student-name">Student Name</th>
            <th>Roll Number</th>
            <th>Semester</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${studentData
            .map(
              (s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td class="student-name">${s.name}</td>
              <td class="roll-number">${s.rollNumber}</td>
              <td>${s.semester}</td>
              <td class="${s.status}">${s.status.toUpperCase()}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-item present-bg">
          <strong>${presentCount}</strong>
          <span>Present</span>
        </div>
        <div class="summary-item absent-bg">
          <strong>${absentCount}</strong>
          <span>Absent</span>
        </div>
        <div class="summary-item late-bg">
          <strong>${lateCount}</strong>
          <span>Late</span>
        </div>
      </div>

      <div class="footer">
        <p>This is a computer-generated report from CGEC Student Management System</p>
        <p style="margin-top: 30px;">Teacher's Signature: _______________________</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
