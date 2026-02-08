import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Comprehensive Line Release Report Generator
 * Creates detailed PDF report with all cleaning data, verifications, photos, and damage reports
 */
export class ComprehensiveReportGenerator {
  constructor(state, lineName, leadName, signature) {
    this.state = state;
    this.lineName = lineName;
    this.leadName = leadName;
    this.signature = signature;
    this.doc = new jsPDF();
    this.currentY = 20;
  }

  generate() {
    this.addHeader();
    this.addSummarySection();
    this.addStageDetails();
    this.addDamageReports();
    this.addHandoverTasks();
    this.addVerificationDetails();
    this.addSignature();
    
    const filename = `${this.lineName.replace(/\s+/g, '_')}_Complete_Report_${Date.now()}.pdf`;
    this.doc.save(filename);
    
    return filename;
  }

  addHeader() {
    const timestamp = new Date().toLocaleString();
    
    this.doc.setFontSize(18);
    this.doc.text("COMPREHENSIVE LINE RELEASE REPORT", 105, this.currentY, { align: "center" });
    
    this.doc.setFontSize(12);
    this.currentY += 10;
    this.doc.text(`${this.lineName} - Give & Go Facility`, 105, this.currentY, { align: "center" });
    
    this.doc.setFontSize(10);
    this.currentY += 8;
    this.doc.text(`Generated: ${timestamp}`, 105, this.currentY, { align: "center" });
    this.doc.text(`Released by: ${this.leadName}`, 105, this.currentY + 5, { align: "center" });
    
    this.currentY += 20;
  }

  addSummarySection() {
    this.doc.setFontSize(14);
    this.doc.text("EXECUTIVE SUMMARY", 14, this.currentY);
    this.currentY += 10;
    
    const completionRate = Object.values(this.state.stages).filter(Boolean).length;
    const totalStages = 4;
    const completionPercent = Math.round((completionRate / totalStages) * 100);
    
    const summaryData = [
      ["Line Status", "Released for Production"],
      ["Completion Rate", `${completionPercent}% (${completionRate}/${totalStages} stages)`],
      ["Total Duration", this.calculateTotalDuration()],
      ["Bags Processed", `Covered: ${this.state.bagCounts.covered || 0}, Retrieved: ${this.state.bagCounts.retrieved || 0}`],
      ["Damage Reports", `${this.state.damageReports.length} total (${this.state.damageReports.filter(r => r.status === "Open").length} open)`],
      ["Quality Status", this.getQualityStatus()],
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
    });

    this.currentY = this.doc.lastAutoTable.finalY + 15;
  }

  addStageDetails() {
    this.doc.setFontSize(14);
    this.doc.text("DETAILED STAGE BREAKDOWN", 14, this.currentY);
    this.currentY += 10;

    const stageData = [
      [
        "Pre-Cleaning",
        this.state.stages.preClean ? "✓ Completed" : "✗ Incomplete",
        this.state.bagCounts.covered || "0",
        this.getStageUser("preClean"),
        this.formatTimestamp(this.state.stageTimes.preCleanAt),
        this.getStageNotes("preClean")
      ],
      [
        "Post-Cleaning", 
        this.state.stages.postClean ? "✓ Completed" : "✗ Incomplete",
        this.state.bagCounts.retrieved || "0",
        this.getStageUser("postClean"),
        this.formatTimestamp(this.state.stageTimes.postCleanAt),
        this.getStageNotes("postClean")
      ],
      [
        "Handover",
        this.state.stages.handover ? "✓ Completed" : this.state.handoverRequired === false ? "Not Required" : "✗ Incomplete",
        `${this.state.handoverTasks.filter(t => t.status === "completed").length}/${this.state.handoverTasks.length} tasks`,
        this.getStageUser("handover"),
        this.formatTimestamp(this.state.stageTimes.handoverAt),
        "See Handover Tasks section"
      ],
      [
        "Lead Verification",
        this.state.stages.lead ? "✓ Released" : "✗ Pending",
        `${this.state.leadChecklist.length} items verified`,
        this.leadName,
        this.formatTimestamp(this.state.stageTimes.leadAt),
        "Lead signature provided"
      ],
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      head: [["Stage", "Status", "Metrics", "Performed By", "Timestamp", "Notes"]],
      body: stageData,
      theme: 'striped',
      headStyles: { fillColor: [45, 212, 191] },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { cellWidth: 25 },
        5: { cellWidth: 35 }
      }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 15;
  }

  addDamageReports() {
    this.doc.setFontSize(14);
    this.doc.text("DAMAGE REPORTS & MAINTENANCE ISSUES", 14, this.currentY);
    this.currentY += 10;

    if (this.state.damageReports.length === 0) {
      this.doc.setFontSize(10);
      this.doc.text("✓ No damage reports - Line is in optimal condition", 14, this.currentY);
      this.currentY += 15;
      return;
    }

    // Group damage reports by severity
    const highSeverity = this.state.damageReports.filter(r => r.severity === "High");
    const mediumSeverity = this.state.damageReports.filter(r => r.severity === "Medium");
    const lowSeverity = this.state.damageReports.filter(r => r.severity === "Low");

    // Add severity breakdown
    this.doc.setFontSize(10);
    this.doc.text(`Total Reports: ${this.state.damageReports.length} | High: ${highSeverity.length} | Medium: ${mediumSeverity.length} | Low: ${lowSeverity.length}`, 14, this.currentY);
    this.currentY += 10;

    const damageData = this.state.damageReports.map(report => [
      report.severity,
      report.equipmentArea || "General",
      report.description || "No description",
      report.status,
      report.reportedBy || "Unknown",
      this.formatTimestamp(report.createdAt),
      report.fixedBy || "-",
      this.formatTimestamp(report.closedAt),
    ]);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [["Severity", "Equipment/Area", "Description", "Status", "Reported By", "Report Date", "Fixed By", "Closed Date"]],
      body: damageData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        2: { cellWidth: 50 }, // Description column wider
        0: { 
          cellWidth: 15,
          fontStyle: 'bold'
        }
      },
      didParseCell: (data) => {
        // Color code severity cells
        if (data.column.index === 0) {
          if (data.cell.text[0] === "High") {
            data.cell.styles.fillColor = [239, 68, 68, 0.2];
            data.cell.styles.textColor = [239, 68, 68];
          } else if (data.cell.text[0] === "Medium") {
            data.cell.styles.fillColor = [245, 158, 11, 0.2];
            data.cell.styles.textColor = [245, 158, 11];
          } else {
            data.cell.styles.fillColor = [34, 197, 94, 0.2];
            data.cell.styles.textColor = [34, 197, 94];
          }
        }
      }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 15;
  }

  addHandoverTasks() {
    if (this.state.handoverRequired === false) {
      this.doc.setFontSize(12);
      this.doc.text("HANDOVER STATUS: Not Required", 14, this.currentY);
      this.currentY += 15;
      return;
    }

    this.doc.setFontSize(14);
    this.doc.text("HANDOVER TASKS & VERIFICATION", 14, this.currentY);
    this.currentY += 10;

    const completedTasks = this.state.handoverTasks.filter(t => t.status === "completed");
    const pendingTasks = this.state.handoverTasks.filter(t => t.status === "pending");
    
    this.doc.setFontSize(10);
    this.doc.text(`Completed: ${completedTasks.length}/${this.state.handoverTasks.length} tasks`, 14, this.currentY);
    this.currentY += 8;

    const taskData = this.state.handoverTasks.map(task => [
      task.text,
      task.status === "completed" ? "✓ Done" : "✗ Pending",
      task.description || "No additional notes",
      task.response || "-",
      this.formatTimestamp(task.createdAt),
    ]);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [["Task Description", "Status", "Notes", "Response", "Timestamp"]],
      body: taskData,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60 }, // Task description wider
        2: { cellWidth: 40 }, // Notes column
      }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 15;
  }

  addVerificationDetails() {
    // Pre-Clean Verification Details
    this.doc.setFontSize(14);
    this.doc.text("PRE-CLEANING VERIFICATION DETAILS", 14, this.currentY);
    this.currentY += 10;

    if (Object.keys(this.state.verificationData.preClean).length > 0) {
      const preCleanData = Object.entries(this.state.verificationData.preClean).map(([index, data]) => [
        data.question || `Question ${parseInt(index) + 1}`,
        data.response || "No response",
        data.description || "No description",
        data.verifiedBy || "Unknown",
        this.formatTimestamp(data.timestamp),
        data.photo ? "✓ Photo Evidence" : "✗ No photo"
      ]);

      autoTable(this.doc, {
        startY: this.currentY,
        head: [["Question", "Response", "Description", "Verified By", "Timestamp", "Photo"]],
        body: preCleanData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 50 },
          2: { cellWidth: 40 },
        }
      });
      this.currentY = this.doc.lastAutoTable.finalY + 15;
    }

    // Post-Clean Verification Details  
    this.doc.setFontSize(14);
    this.doc.text("POST-CLEANING VERIFICATION DETAILS", 14, this.currentY);
    this.currentY += 10;

    if (Object.keys(this.state.verificationData.postClean).length > 0) {
      const postCleanData = Object.entries(this.state.verificationData.postClean).map(([index, data]) => [
        data.question || `Question ${parseInt(index) + 1}`,
        data.response || "No response", 
        data.description || "No description",
        data.verifiedBy || "Unknown",
        this.formatTimestamp(data.timestamp),
        data.photo ? "✓ Photo Evidence" : "✗ No photo"
      ]);

      autoTable(this.doc, {
        startY: this.currentY,
        head: [["Question", "Response", "Description", "Verified By", "Timestamp", "Photo"]],
        body: postCleanData,
        theme: 'striped', 
        headStyles: { fillColor: [34, 197, 94] },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 50 },
          2: { cellWidth: 40 },
        }
      });
      this.currentY = this.doc.lastAutoTable.finalY + 15;
    }

    // Lead Verification Checklist
    this.doc.setFontSize(14);
    this.doc.text("LEAD VERIFICATION CHECKLIST", 14, this.currentY);
    this.currentY += 10;

    if (this.state.leadChecklist.length === 0) {
      this.doc.setFontSize(10);
      this.doc.text("No lead verification checklist completed", 14, this.currentY);
      this.currentY += 15;
      return;
    }

    const verificationData = this.state.leadChecklist.map(item => [
      item.task,
      item.response || "No response",
      item.description || "No additional notes", 
      item.photo ? "✓ Photo attached" : "✗ No photo",
    ]);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [["Verification Item", "Response", "Description/Notes", "Photo Evidence"]],
      body: verificationData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      columnStyles: {
        0: { cellWidth: 70 }, 
        2: { cellWidth: 50 },
      }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 15;
  }

  addSignature() {
    if (this.signature) {
      // Add new page if needed
      if (this.currentY > 250) {
        this.doc.addPage();
        this.currentY = 20;
      }

      this.doc.setFontSize(12);
      this.doc.text("LEAD AUTHORIZATION SIGNATURE", 14, this.currentY);
      this.currentY += 10;
      
      this.doc.setFontSize(10);
      this.doc.text(`Authorized by: ${this.leadName}`, 14, this.currentY);
      this.doc.text(`Date & Time: ${new Date().toLocaleString()}`, 14, this.currentY + 5);
      this.currentY += 15;
      
      // Add signature image
      try {
        this.doc.addImage(this.signature, "PNG", 14, this.currentY, 80, 25);
        this.currentY += 30;
      } catch (error) {
        this.doc.text("Signature: [Digital signature attached]", 14, this.currentY);
        this.currentY += 10;
      }
    }
  }

  // Helper methods
  calculateTotalDuration() {
    const start = this.state.stageTimes.preCleanAt;
    const end = this.state.stageTimes.leadAt;
    
    if (!start || !end) return "N/A";
    
    const duration = new Date(end) - new Date(start);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  getQualityStatus() {
    const openHighSeverity = this.state.damageReports.filter(r => 
      r.severity === "High" && r.status === "Open"
    ).length;
    
    const allStagesComplete = Object.values(this.state.stages).every(Boolean);
    
    if (openHighSeverity > 0) return "⚠️ High severity issues open";
    if (!allStagesComplete) return "⚠️ Incomplete stages";
    return "✅ All requirements met";
  }

  getStageUser(stageKey) {
    // Get the user who completed this stage
    const stageMapping = {
      preClean: "preCleanBy",
      postClean: "postCleanBy"
    };
    
    return this.state.stageInProgress[stageMapping[stageKey]] || 
           this.state.lineStatus.macy.submittedBy || 
           "Unknown";
  }

  getStageNotes(stageKey) {
    if (stageKey === "preClean") {
      return `Bags covered: ${this.state.bagCounts.covered || 0}`;
    }
    if (stageKey === "postClean") {
      return `Bags retrieved: ${this.state.bagCounts.retrieved || 0}, Handover required: ${this.state.handoverRequired ? "Yes" : "No"}`;
    }
    return "-";
  }

  formatTimestamp(timestamp) {
    return timestamp ? new Date(timestamp).toLocaleString() : "-";
  }
}

/**
 * Enhanced report generation function
 */
export function generateComprehensiveReport(state, lineName, leadName, signature) {
  const generator = new ComprehensiveReportGenerator(state, lineName, leadName, signature);
  return generator.generate();
}

/**
 * Quick report validation - check if all requirements are met
 */
export function validateReportRequirements(state) {
  const errors = [];
  
  // Check all stages are complete
  if (!state.stages.preClean) errors.push("Pre-cleaning not completed");
  if (!state.stages.postClean) errors.push("Post-cleaning not completed");
  if (state.handoverRequired && !state.stages.handover) errors.push("Required handover not completed");
  if (!state.stages.lead) errors.push("Lead verification not completed");
  
  // Check for open high-severity damage reports
  const openHighSeverity = state.damageReports.filter(r => 
    r.severity === "High" && r.status === "Open"
  );
  if (openHighSeverity.length > 0) {
    errors.push(`${openHighSeverity.length} high-severity damage report(s) still open`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    requirements: {
      allStagesComplete: Object.values(state.stages).every(Boolean),
      noOpenHighSeverityIssues: openHighSeverity.length === 0,
      handoverCompleteIfRequired: !state.handoverRequired || state.stages.handover,
    }
  };
}