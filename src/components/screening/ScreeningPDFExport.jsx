import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function sanitizeFilePart(value) {
  return (value || 'student').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function readRiskSummary(data) {
  const quizPct = data?.quiz?.pct ?? 0;
  const words = data?.emotionWords?.score ?? 0;
  const mood = data?.moodColor?.score ?? 0;
  const reaction = data?.reactionTime?.score ?? 0;
  const memory = data?.memoryPattern?.score ?? 0;

  return [
    `Quiz concern index: ${quizPct}%`,
    `Emotion words score: ${words}/10`,
    `Mood color score: ${mood}/10`,
    `Reaction score: ${reaction}`,
    `Memory score: ${memory}`,
  ];
}

export async function exportScreeningToPdf({ reportElement, userInfo, data, risk, recommendation }) {
  if (!reportElement) {
    throw new Error('Report element was not found for PDF export.');
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  let cursorY = 14;

  pdf.setFontSize(16);
  pdf.text('Mental Health Screening Report', margin, cursorY);
  cursorY += 7;

  pdf.setFontSize(10);
  pdf.text(`Name: ${userInfo?.name || 'N/A'}`, margin, cursorY);
  cursorY += 5;
  pdf.text(`Email: ${userInfo?.email || 'N/A'}`, margin, cursorY);
  cursorY += 5;
  pdf.text(`University ID: ${userInfo?.universityId || 'N/A'}`, margin, cursorY);
  cursorY += 5;
  pdf.text(`Date: ${new Date().toLocaleString()}`, margin, cursorY);
  cursorY += 8;

  pdf.setFontSize(11);
  pdf.text(`Overall risk: ${risk?.level || 'N/A'} (${risk?.pct ?? 0}%)`, margin, cursorY);
  cursorY += 6;

  const summaryLines = readRiskSummary(data);
  pdf.setFontSize(10);
  summaryLines.forEach((line) => {
    pdf.text(`- ${line}`, margin, cursorY);
    cursorY += 5;
  });

  if (recommendation) {
    const split = pdf.splitTextToSize(`Recommendation: ${recommendation}`, pageWidth - margin * 2);
    if (cursorY + split.length * 5 > pageHeight - margin) {
      pdf.addPage();
      cursorY = margin;
    }
    pdf.text(split, margin, cursorY);
    cursorY += split.length * 5 + 4;
  }

  const canvas = await html2canvas(reportElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });
  const imgData = canvas.toDataURL('image/png');

  const availableWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * availableWidth) / canvas.width;
  let heightLeft = imgHeight;
  let imgY = cursorY;

  if (imgY + imgHeight <= pageHeight - margin) {
    pdf.addImage(imgData, 'PNG', margin, imgY, availableWidth, imgHeight, undefined, 'FAST');
  } else {
    let position = 0;
    pdf.addPage();
    while (heightLeft > 0) {
      const drawY = margin - position;
      pdf.addImage(imgData, 'PNG', margin, drawY, availableWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight - margin * 2;
      position += pageHeight - margin * 2;
      if (heightLeft > 0) {
        pdf.addPage();
      }
    }
  }

  const fileName = `screening_${sanitizeFilePart(userInfo?.name)}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(fileName);
}
