function mapManualEnrollmentRequestEntity(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.RequestId,
    tenantId: row.TenantId,
    businessName: row.BusinessName || null,
    courseId: row.CourseId,
    courseTitle: row.CourseTitle,
    coursePriceCents: row.CoursePriceCents,
    currency: row.Currency,
    amountLabel: row.AmountLabel,
    userId: row.UserId,
    learnerName: row.LearnerName,
    learnerEmail: row.LearnerEmail,
    paymentMethod: row.PaymentMethod,
    transactionReference: row.TransactionReference,
    notes: row.Notes,
    proofUrl: row.ProofUrl,
    proofFilename: row.ProofFilename,
    status: row.Status,
    reviewerId: row.ReviewerId,
    reviewerName: row.ReviewerName,
    reviewNotes: row.ReviewNotes,
    submittedAt: row.SubmittedAt,
    reviewedAt: row.ReviewedAt,
  };
}

module.exports = {
  mapManualEnrollmentRequestEntity,
};
