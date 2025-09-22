# LMS Admin Portal Architecture

## Navigation Structure
- Dashboard overview: metrics for users, courses, engagements, payments.
- User Management: list, filter, create/edit Instructor, Student, Teacher roles.
- Course Management: categories, course CRUD, status toggles.
- Lesson Library: per course asset management (video, image, PDF uploads with metadata).
- Enrollment & Payments: manual approvals via receipt screenshot, enrollment status tracking.
- Progress Tracking: completion analytics per learner and course.
- Assessments: question banks, results review, approval workflows.
- Certification: request queue, certificate generation, issuance log.
- Promotions: banner/newsletter management.
- About Page: content blocks for mission, team, timeline.
- Contact Page: contact channels, FAQ blocks, message logs.
- Referral Program: referral codes, stats, reward settings.

## Layout Components
- AppShell with sidebar navigation, topbar quick actions, responsive collapse.
- Resource tables using data table component with mass actions.
- Drawer/Sheet forms for create/edit to keep context.
- Stats cards and charts on dashboard using shadcn cards and chart primitives.
- File upload widgets integrated with storage service abstraction.

## Data Modules
- Users: fields (name, role, email, status, createdAt).
- Courses: title, category, difficulty, status, instructors, enrollment count.
- Lessons: type, associated course, duration, assets (file references).
- Enrollments: user, course, paymentProof, status, progress.
- Assessments: course, question set, passCriteria, submissions.
- Certificates: issuedTo, course, assessmentId, status, issuedAt.
- Promotions: title, activeRange, audience, content.
- Site Content: sections for About, Contact, Referral configuration.

## Roadmap Notes
- Phase 1: deliver CRUD flows for Users, Courses, Lessons with placeholder back-end adapters.
- Phase 2: add enrollment/payments, progress, assessments sections, integrate dashboards.
- Phase 3: extend with certificate flows and marketing pages management.
