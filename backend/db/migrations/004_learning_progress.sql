/*
  Lesson progress tracking + assessment attempt storage.
*/
IF OBJECT_ID('dbo.LessonProgress', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.LessonProgress (
    ProgressId        INT IDENTITY(1,1) PRIMARY KEY,
    TenantId          INT NOT NULL,
    CourseId          NVARCHAR(100) NOT NULL,
    LessonId          NVARCHAR(150) NOT NULL,
    LessonTitle       NVARCHAR(255) NULL,
    UserId            INT NULL,
    LearnerEmail      NVARCHAR(150) NULL,
    PlaybackSeconds   INT NULL,
    DurationSeconds   INT NULL,
    CompletedAt       DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME(),
    CreatedAt         DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME()
  );

  ALTER TABLE dbo.LessonProgress
    ADD CONSTRAINT FK_LessonProgress_Tenant FOREIGN KEY (TenantId)
      REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE;

  ALTER TABLE dbo.LessonProgress
    ADD CONSTRAINT FK_LessonProgress_User FOREIGN KEY (UserId)
      REFERENCES dbo.Users(UserId);

  CREATE INDEX IX_LessonProgress_Learner
    ON dbo.LessonProgress (TenantId, CourseId, UserId, LearnerEmail);

  CREATE INDEX IX_LessonProgress_Lesson
    ON dbo.LessonProgress (TenantId, CourseId, LessonId);
END;
GO

IF OBJECT_ID('dbo.AssessmentAttempts', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.AssessmentAttempts (
    AttemptId      INT IDENTITY(1,1) PRIMARY KEY,
    TenantId       INT NOT NULL,
    CourseId       NVARCHAR(100) NOT NULL,
    UserId         INT NULL,
    LearnerEmail   NVARCHAR(150) NULL,
    QuestionCount  INT NOT NULL,
    CorrectCount   INT NOT NULL,
    ScorePercent   DECIMAL(5,2) NOT NULL,
    Answers        NVARCHAR(MAX) NULL,
    SubmittedAt    DATETIMEOFFSET NOT NULL DEFAULT SYSUTCDATETIME()
  );

  ALTER TABLE dbo.AssessmentAttempts
    ADD CONSTRAINT FK_AssessmentAttempts_Tenant FOREIGN KEY (TenantId)
      REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE;

  ALTER TABLE dbo.AssessmentAttempts
    ADD CONSTRAINT FK_AssessmentAttempts_User FOREIGN KEY (UserId)
      REFERENCES dbo.Users(UserId);

  CREATE INDEX IX_AssessmentAttempts_Learner
    ON dbo.AssessmentAttempts (TenantId, CourseId, UserId, LearnerEmail, SubmittedAt DESC);
END;
GO
