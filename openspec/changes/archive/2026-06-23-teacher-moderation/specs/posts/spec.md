## MODIFIED Requirements

### Requirement: Posts row-level security per operation
The system SHALL enforce RLS on `posts` covering each operation explicitly: SELECT for any authenticated user; INSERT for any authenticated user only when `author_id` equals the current user; UPDATE only by the author; DELETE by the author OR a user whose profile role is `teacher`.

#### Scenario: Read requires authentication
- **WHEN** an unauthenticated request reads posts
- **THEN** access is denied

#### Scenario: Insert forces self as author
- **WHEN** an authenticated user inserts a post with `author_id` set to another user
- **THEN** the insert is rejected by RLS

#### Scenario: Update restricted to author
- **WHEN** a non-author attempts UPDATE on a post
- **THEN** RLS blocks the operation

#### Scenario: Delete by author
- **WHEN** the author deletes their own post
- **THEN** RLS allows the operation

#### Scenario: Delete by teacher (moderation)
- **WHEN** a user with role `teacher` deletes a post they do not own
- **THEN** RLS allows the operation

#### Scenario: Delete denied to non-author student
- **WHEN** a student who is not the author attempts to DELETE a post
- **THEN** RLS blocks the operation

## ADDED Requirements

### Requirement: Teacher post moderation
The system SHALL allow a user with role `teacher` to delete any post regardless of authorship. Moderation controls (the delete action on posts the user does not own) SHALL be shown in the UI only to teachers, and SHALL require confirmation before deleting another person's content. Authorization MUST be enforced at the database (RLS), not only in the UI.

#### Scenario: Teacher sees delete on others' post
- **WHEN** a teacher views a post authored by someone else
- **THEN** a delete (moderation) control is visible

#### Scenario: Student does not see moderation control
- **WHEN** a student views a post authored by someone else
- **THEN** no delete control is shown

#### Scenario: Confirmation before moderating
- **WHEN** a teacher triggers delete on another person's post
- **THEN** a confirmation is required before removal

#### Scenario: UI bypass still blocked by RLS
- **WHEN** a student bypasses the UI and issues a DELETE on a post they do not own
- **THEN** RLS rejects the operation
