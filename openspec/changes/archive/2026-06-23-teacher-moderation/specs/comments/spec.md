## MODIFIED Requirements

### Requirement: Comments row-level security per operation
The system SHALL enforce RLS on `comments` covering each operation explicitly: SELECT for any authenticated user; INSERT for any authenticated user only when `author_id` equals the current user; UPDATE only by the author; DELETE by the author OR a user whose profile role is `teacher`.

#### Scenario: Read requires authentication
- **WHEN** an unauthenticated request reads comments
- **THEN** access is denied

#### Scenario: Insert forces self as author
- **WHEN** an authenticated user inserts a comment with `author_id` set to another user
- **THEN** the insert is rejected by RLS

#### Scenario: Update restricted to author
- **WHEN** a non-author attempts UPDATE on a comment
- **THEN** RLS blocks the operation

#### Scenario: Delete by author
- **WHEN** the author deletes their own comment
- **THEN** RLS allows the operation

#### Scenario: Delete by teacher (moderation)
- **WHEN** a user with role `teacher` deletes a comment they do not own
- **THEN** RLS allows the operation

#### Scenario: Delete denied to non-author student
- **WHEN** a student who is not the author attempts to DELETE a comment
- **THEN** RLS blocks the operation

## ADDED Requirements

### Requirement: Teacher comment moderation
The system SHALL allow a user with role `teacher` to delete any comment regardless of authorship. The delete control on comments the user does not own SHALL be shown only to teachers and SHALL require confirmation. Authorization MUST be enforced at the database (RLS), not only in the UI.

#### Scenario: Teacher sees delete on others' comment
- **WHEN** a teacher views a comment authored by someone else
- **THEN** a delete (moderation) control is visible

#### Scenario: Student does not see moderation control
- **WHEN** a student views a comment authored by someone else
- **THEN** no delete control is shown

#### Scenario: Confirmation before moderating a comment
- **WHEN** a teacher triggers delete on another person's comment
- **THEN** a confirmation is required before removal

### Requirement: Teacher comment visual highlight
The system SHALL visually distinguish comments authored by a `teacher` using the neubrutalism design system, so readers can identify professor responses.

#### Scenario: Teacher comment is highlighted
- **WHEN** a comment whose author has role `teacher` is displayed
- **THEN** it is rendered with a distinct teacher highlight (e.g. badge/contrast) different from student comments

#### Scenario: Student comment not highlighted
- **WHEN** a comment whose author is a student is displayed
- **THEN** it uses the default comment styling
