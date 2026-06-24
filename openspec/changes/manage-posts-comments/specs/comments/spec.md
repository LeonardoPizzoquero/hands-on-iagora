## ADDED Requirements

### Requirement: Comment data model
The system SHALL persist comments with `id`, `content` (plain text, NO markdown), `post_id` (references a post), `author_id`, `created_at`, and `updated_at`. `author_id` MUST equal the authenticated user that created the row and MUST NOT be settable to another user.

#### Scenario: Comment created with server-set author
- **WHEN** an authenticated user submits a comment on a post
- **THEN** `author_id` is set to the current user by the server and timestamps are set

#### Scenario: updated_at changes on edit
- **WHEN** the author edits their comment
- **THEN** `updated_at` is refreshed and `created_at` is unchanged

### Requirement: Comment list on post detail
The system SHALL display, on the post detail page, a flat list of that post's comments ordered oldest-to-newest. Each comment SHALL show the author's name (from `profiles`) and the date.

#### Scenario: Comments shown oldest first
- **WHEN** a post has multiple comments
- **THEN** they appear in ascending `created_at` order, each with author name and date

#### Scenario: Empty comments state
- **WHEN** a post has no comments
- **THEN** the message "seja o primeiro a comentar" is shown

### Requirement: Comment count on post
The system SHALL show the number of comments for a post wherever the post is presented in detail.

#### Scenario: Count reflects comments
- **WHEN** a post has N comments
- **THEN** the displayed comment count equals N

### Requirement: Create, edit and delete comments
The system SHALL allow authenticated users to create comments, and SHALL allow only the author to edit or delete their own comment. Mutations MUST run as Server Actions with input validated and sanitized.

#### Scenario: Authenticated user comments
- **WHEN** an authenticated user submits valid comment text
- **THEN** the comment is created with them as author and appears in the list

#### Scenario: Submit shows loading state
- **WHEN** a comment is being submitted
- **THEN** a loading state is shown until the operation resolves

#### Scenario: Author edits own comment
- **WHEN** the author edits their comment
- **THEN** the change is saved

#### Scenario: Non-author cannot edit or delete
- **WHEN** a user who is not the author attempts to edit or delete a comment
- **THEN** the operation is rejected by RLS and no change occurs

#### Scenario: Delete requires confirmation
- **WHEN** the author triggers delete on a comment
- **THEN** a confirmation is required before removal

### Requirement: Comment text validation
The system SHALL require non-empty `content` of at most 1000 characters, sanitized to prevent XSS, on create and edit. Invalid input MUST be rejected with a clear message and MUST NOT be persisted.

#### Scenario: Empty comment rejected
- **WHEN** a user submits empty comment text
- **THEN** the submission is rejected with a clear validation message

#### Scenario: Over-limit comment rejected
- **WHEN** a user submits text longer than 1000 characters
- **THEN** the submission is rejected with a clear validation message

#### Scenario: Markup is neutralized
- **WHEN** comment text contains HTML/script markup
- **THEN** it is stored/rendered as inert plain text with no executable content

### Requirement: Comments row-level security per operation
The system SHALL enforce RLS on `comments` covering each operation explicitly: SELECT for any authenticated user; INSERT for any authenticated user only when `author_id` equals the current user; UPDATE only by the author; DELETE only by the author.

#### Scenario: Read requires authentication
- **WHEN** an unauthenticated request reads comments
- **THEN** access is denied

#### Scenario: Insert forces self as author
- **WHEN** an authenticated user inserts a comment with `author_id` set to another user
- **THEN** the insert is rejected by RLS

#### Scenario: Update/delete restricted to author
- **WHEN** a non-author attempts UPDATE or DELETE on a comment
- **THEN** RLS blocks the operation
