/*
  Supernova LMS SaaS schema (BusinessName multi-tenant model)
  Run on Microsoft SQL Server.
*/
/* Core multi-tenant tables */
IF OBJECT_ID('dbo.Tenants', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Tenants (
    TenantId            INT IDENTITY(1,1) PRIMARY KEY,
    BusinessName        NVARCHAR(150) NOT NULL,
    Domain              NVARCHAR(255) NOT NULL UNIQUE,
    Status              NVARCHAR(20) NOT NULL DEFAULT 'active',
    SubscriptionPlan    NVARCHAR(50) NOT NULL DEFAULT 'trial',
    PlanTier            NVARCHAR(50) NOT NULL DEFAULT 'starter',
    PlanExpiresAt       DATETIMEOFFSET NULL,
    CreatedAt           DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt           DATETIMEOFFSET NULL
  );

  CREATE INDEX IX_Tenants_Status ON dbo.Tenants (Status);
END;
GO

IF OBJECT_ID('dbo.TenantSettings', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.TenantSettings (
    TenantSettingsId  INT IDENTITY(1,1) PRIMARY KEY,
    TenantId          INT NOT NULL,
    SettingKey        NVARCHAR(100) NOT NULL,
    SettingValue      NVARCHAR(MAX) NULL,
    CreatedAt         DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt         DATETIMEOFFSET NULL,
    CONSTRAINT FK_TenantSettings_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT UQ_Tenant_Settings UNIQUE (TenantId, SettingKey)
  );
END;
GO

/* Identity and access control */
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Users (
    UserId            INT IDENTITY(1,1) PRIMARY KEY,
    TenantId          INT NOT NULL,
    Email             NVARCHAR(150) NOT NULL,
    PasswordHash      NVARCHAR(255) NULL,
    FirstName         NVARCHAR(100) NULL,
    LastName          NVARCHAR(100) NULL,
    Role              NVARCHAR(50) NOT NULL DEFAULT 'learner',
    Status            NVARCHAR(20) NOT NULL DEFAULT 'active',
    LastLoginAt       DATETIMEOFFSET NULL,
    CreatedAt         DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt         DATETIMEOFFSET NULL,
    CONSTRAINT FK_Users_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT UQ_Users_Email_Tenant UNIQUE (TenantId, Email)
  );

  CREATE INDEX IX_Users_Status ON dbo.Users (TenantId, Status);
END;
GO

IF OBJECT_ID('dbo.UserProfiles', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.UserProfiles (
    UserProfileId   INT IDENTITY(1,1) PRIMARY KEY,
    UserId          INT NOT NULL,
    PhoneNumber     NVARCHAR(30) NULL,
    Timezone        NVARCHAR(60) NULL,
    Locale          NVARCHAR(20) NULL,
    AvatarUrl       NVARCHAR(255) NULL,
    CreatedAt       DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt       DATETIMEOFFSET NULL,
    CONSTRAINT FK_UserProfiles_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId) ON DELETE CASCADE
  );
END;
GO

IF OBJECT_ID('dbo.Roles', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Roles (
    RoleId          INT IDENTITY(1,1) PRIMARY KEY,
    TenantId        INT NULL, -- NULL means global role
    RoleName        NVARCHAR(100) NOT NULL,
    Description     NVARCHAR(255) NULL,
    IsSystem        BIT NOT NULL DEFAULT 0,
    CreatedAt       DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT UQ_Roles_Name_Tenant UNIQUE (TenantId, RoleName),
    CONSTRAINT FK_Roles_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE
  );
END;
GO

IF OBJECT_ID('dbo.UserRoles', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.UserRoles (
    UserRoleId      INT IDENTITY(1,1) PRIMARY KEY,
    UserId          INT NOT NULL,
    RoleId          INT NOT NULL,
    CreatedAt       DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT FK_UserRoles_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_Role FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId),
    CONSTRAINT UQ_UserRoles UNIQUE (UserId, RoleId)
  );
END;
GO

/* LMS domain tables */
IF OBJECT_ID('dbo.Courses', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Courses (
    CourseId         INT IDENTITY(1,1) PRIMARY KEY,
    TenantId         INT NOT NULL,
    Title            NVARCHAR(200) NOT NULL,
    Slug             NVARCHAR(200) NOT NULL,
    Status           NVARCHAR(20) NOT NULL DEFAULT 'draft',
    Summary          NVARCHAR(1000) NULL,
    Description      NVARCHAR(MAX) NULL,
    ThumbnailUrl     NVARCHAR(255) NULL,
    Level            NVARCHAR(50) NULL,
    EstimatedHours   DECIMAL(5,2) NULL,
    PriceCents       INT NULL,
    Currency         CHAR(3) NULL,
    CreatedBy        INT NULL,
    PublishedAt      DATETIMEOFFSET NULL,
    CreatedAt        DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt        DATETIMEOFFSET NULL,
    CONSTRAINT FK_Courses_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT FK_Courses_Owner FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId),
    CONSTRAINT UQ_Courses_Slug UNIQUE (TenantId, Slug)
  );

  CREATE INDEX IX_Courses_Status ON dbo.Courses (TenantId, Status);
END;
GO

IF OBJECT_ID('dbo.Modules', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Modules (
    ModuleId         INT IDENTITY(1,1) PRIMARY KEY,
    CourseId         INT NOT NULL,
    Title            NVARCHAR(200) NOT NULL,
    Position         INT NOT NULL DEFAULT 0,
    CreatedAt        DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt        DATETIMEOFFSET NULL,
    CONSTRAINT FK_Modules_Course FOREIGN KEY (CourseId) REFERENCES dbo.Courses(CourseId) ON DELETE CASCADE
  );

  CREATE INDEX IX_Modules_Order ON dbo.Modules (CourseId, Position);
END;
GO

IF OBJECT_ID('dbo.Lessons', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Lessons (
    LessonId        INT IDENTITY(1,1) PRIMARY KEY,
    ModuleId        INT NOT NULL,
    Title           NVARCHAR(200) NOT NULL,
    ContentType     NVARCHAR(50) NOT NULL DEFAULT 'video',
    ContentUrl      NVARCHAR(255) NULL,
    ContentBody     NVARCHAR(MAX) NULL,
    DurationMinutes INT NULL,
    Position        INT NOT NULL DEFAULT 0,
    CreatedAt       DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt       DATETIMEOFFSET NULL,
    CONSTRAINT FK_Lessons_Module FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId) ON DELETE CASCADE
  );

  CREATE INDEX IX_Lessons_Order ON dbo.Lessons (ModuleId, Position);
END;
GO

IF OBJECT_ID('dbo.Enrollments', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Enrollments (
    EnrollmentId     INT IDENTITY(1,1) PRIMARY KEY,
    TenantId         INT NOT NULL,
    CourseId         INT NOT NULL,
    UserId           INT NOT NULL,
    ProgressPercent  DECIMAL(5,2) NOT NULL DEFAULT 0,
    Status           NVARCHAR(20) NOT NULL DEFAULT 'active',
    EnrolledAt       DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CompletedAt      DATETIMEOFFSET NULL,
    CONSTRAINT FK_Enrollments_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT FK_Enrollments_Course FOREIGN KEY (CourseId) REFERENCES dbo.Courses(CourseId),
    CONSTRAINT FK_Enrollments_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT UQ_Enrollments UNIQUE (TenantId, CourseId, UserId)
  );

  CREATE INDEX IX_Enrollments_Status ON dbo.Enrollments (TenantId, Status);
END;
GO

IF OBJECT_ID('dbo.CourseInstructors', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.CourseInstructors (
    CourseInstructorId INT IDENTITY(1,1) PRIMARY KEY,
    CourseId           INT NOT NULL,
    UserId             INT NOT NULL,
    CreatedAt          DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT FK_CourseInstructors_Course FOREIGN KEY (CourseId) REFERENCES dbo.Courses(CourseId) ON DELETE CASCADE,
    CONSTRAINT FK_CourseInstructors_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT UQ_CourseInstructors UNIQUE (CourseId, UserId)
  );
END;
GO

/* Auditing */
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.AuditLogs (
    AuditLogId       BIGINT IDENTITY(1,1) PRIMARY KEY,
    TenantId         INT NULL,
    UserId           INT NULL,
    Action           NVARCHAR(100) NOT NULL,
    EntityType       NVARCHAR(100) NULL,
    EntityId         NVARCHAR(100) NULL,
    Metadata         NVARCHAR(MAX) NULL,
    CreatedAt        DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
  );

  CREATE INDEX IX_AuditLogs ON dbo.AuditLogs (TenantId, CreatedAt DESC);
END;
GO
