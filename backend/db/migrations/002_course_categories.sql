IF OBJECT_ID('dbo.CourseCategories', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.CourseCategories (
    CategoryId     INT IDENTITY(1,1) PRIMARY KEY,
    TenantId       INT NOT NULL,
    Name           NVARCHAR(150) NOT NULL,
    Slug           NVARCHAR(150) NOT NULL,
    Description    NVARCHAR(600) NULL,
    Icon           NVARCHAR(100) NULL,
    Color          NVARCHAR(30) NULL,
    DisplayOrder   INT NOT NULL DEFAULT 0,
    CreatedAt      DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt      DATETIMEOFFSET NULL,
    CONSTRAINT FK_CourseCategories_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT UQ_CourseCategories_Name UNIQUE (TenantId, Name),
    CONSTRAINT UQ_CourseCategories_Slug UNIQUE (TenantId, Slug)
  );

  CREATE INDEX IX_CourseCategories_Order ON dbo.CourseCategories (TenantId, DisplayOrder);
END;
GO

IF COL_LENGTH('dbo.Courses', 'CategoryId') IS NULL
BEGIN
  ALTER TABLE dbo.Courses
  ADD CategoryId INT NULL;

  ALTER TABLE dbo.Courses
  ADD CONSTRAINT FK_Courses_Category FOREIGN KEY (CategoryId) REFERENCES dbo.CourseCategories(CategoryId);

  CREATE INDEX IX_Courses_Category ON dbo.Courses (TenantId, CategoryId);
END;
GO
