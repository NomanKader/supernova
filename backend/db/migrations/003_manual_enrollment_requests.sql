/*
  Manual enrollment submissions for storing learner payment proofs.
*/
IF OBJECT_ID('dbo.ManualEnrollmentRequests', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ManualEnrollmentRequests (
    RequestId             INT IDENTITY(1,1) PRIMARY KEY,
    TenantId              INT NOT NULL,
    CourseId              NVARCHAR(100) NOT NULL,
    CourseTitle           NVARCHAR(255) NOT NULL,
    CoursePriceCents      INT NULL,
    Currency              NVARCHAR(10) NULL,
    AmountLabel           NVARCHAR(100) NULL,
    UserId                INT NULL,
    LearnerName           NVARCHAR(150) NOT NULL,
    LearnerEmail          NVARCHAR(150) NOT NULL,
    PaymentMethod         NVARCHAR(50) NOT NULL,
    TransactionReference  NVARCHAR(120) NULL,
    Notes                 NVARCHAR(1000) NULL,
    ProofUrl              NVARCHAR(255) NULL,
    ProofFilename         NVARCHAR(255) NULL,
    Status                NVARCHAR(20) NOT NULL DEFAULT 'pending',
    ReviewerId            INT NULL,
    ReviewerName          NVARCHAR(150) NULL,
    ReviewNotes           NVARCHAR(1000) NULL,
    SubmittedAt           DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    ReviewedAt            DATETIMEOFFSET NULL,
    CONSTRAINT FK_ManualEnrollmentRequests_Tenant FOREIGN KEY (TenantId)
      REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT FK_ManualEnrollmentRequests_User FOREIGN KEY (UserId)
      REFERENCES dbo.Users(UserId)
  );

  CREATE INDEX IX_ManualEnrollmentRequests_TenantStatus
    ON dbo.ManualEnrollmentRequests (TenantId, Status);

  CREATE INDEX IX_ManualEnrollmentRequests_SubmittedAt
    ON dbo.ManualEnrollmentRequests (SubmittedAt DESC);
END;
GO
