/*
  Invitation tracking for user onboarding
*/
IF OBJECT_ID('dbo.UserInvites', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.UserInvites (
    InviteId        INT IDENTITY(1,1) PRIMARY KEY,
    TenantId        INT NOT NULL,
    UserId          INT NOT NULL,
    Token           NVARCHAR(128) NOT NULL UNIQUE,
    ExpiresAt       DATETIMEOFFSET NOT NULL,
    ConsumedAt      DATETIMEOFFSET NULL,
    CreatedAt       DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT FK_UserInvites_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT FK_UserInvites_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
  );

  CREATE INDEX IX_UserInvites_Token ON dbo.UserInvites (Token);
  CREATE INDEX IX_UserInvites_Status ON dbo.UserInvites (TenantId, ExpiresAt, ConsumedAt);
END;
GO
