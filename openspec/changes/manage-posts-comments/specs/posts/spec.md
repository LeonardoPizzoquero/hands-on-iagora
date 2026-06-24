## ADDED Requirements

### Requirement: Post data model
The system SHALL persist posts with `id`, `title`, `content` (markdown), `author_id` (references the profile/user), `created_at`, and `updated_at`. `author_id` MUST equal the authenticated user that created the row and MUST NOT be settable to another user.

#### Scenario: Post is created with server-set author and timestamps
- **WHEN** an authenticated user creates a post
- **THEN** `author_id` is set to the current user's id by the server (not from client input)
- **AND** `created_at` and `updated_at` are set to the current time

#### Scenario: updated_at changes on edit
- **WHEN** the author edits an existing post
- **THEN** `updated_at` is refreshed and `created_at` is unchanged

### Requirement: Feed with cursor pagination
The system SHALL display a feed of posts ordered by `created_at` descending, paginated by a cursor over `created_at` (with `id` as tiebreaker). Each feed item SHALL show the author's name (from `profiles`) and the post date.

#### Scenario: First page loads most recent posts
- **WHEN** an authenticated user opens the feed
- **THEN** the most recent posts are shown newest-first, limited to the page size

#### Scenario: Loading more via cursor
- **WHEN** the user requests the next page with the last item's cursor
- **THEN** the system returns the next older batch with no duplicates or gaps

#### Scenario: Empty feed state
- **WHEN** there are no posts
- **THEN** the feed shows the empty message "ainda não há posts"

### Requirement: Post detail page
The system SHALL provide a detail page for a single post showing its rendered content, author name (from `profiles`), date, and comment count.

#### Scenario: View a post
- **WHEN** an authenticated user opens a post detail page by id
- **THEN** the title, safely rendered markdown content, author name, date, and comment count are displayed

#### Scenario: Non-existent post
- **WHEN** the requested post id does not exist
- **THEN** a not-found state is shown

### Requirement: Create, edit and delete posts
The system SHALL allow authenticated users to create posts, and SHALL allow only the author to edit or delete their own post. Mutations MUST run as Server Actions with input validated and sanitized before touching the database.

#### Scenario: Authenticated user creates a post
- **WHEN** an authenticated user submits a valid title and content
- **THEN** the post is created with them as author and they are redirected to its detail page

#### Scenario: Author edits own post
- **WHEN** the author submits edits to their post
- **THEN** the changes are saved

#### Scenario: Non-author cannot edit or delete
- **WHEN** a user who is not the author attempts to edit or delete a post
- **THEN** the operation is rejected by RLS and no change occurs

#### Scenario: Delete requires confirmation
- **WHEN** the author triggers delete
- **THEN** a confirmation is required before the post is removed

### Requirement: Title and content validation
The system SHALL require a non-empty `title` of at most 200 characters and a non-empty `content`, both sanitized, on create and edit. Invalid input MUST be rejected with a clear message and MUST NOT be persisted.

#### Scenario: Missing title rejected
- **WHEN** a user submits a post with empty title
- **THEN** the submission is rejected with a clear validation message

#### Scenario: Title over limit rejected
- **WHEN** a user submits a title longer than 200 characters
- **THEN** the submission is rejected with a clear validation message

#### Scenario: Empty content rejected
- **WHEN** a user submits empty content
- **THEN** the submission is rejected with a clear validation message

### Requirement: Safe markdown rendering
The system SHALL render post content as a safe subset of GFM markdown (headings, bold, italic, links, lists, code, images) and MUST sanitize output to prevent XSS. Raw/embedded HTML MUST NOT be rendered.

#### Scenario: Script injection is neutralized
- **WHEN** post content contains a `<script>` tag or `javascript:` URL
- **THEN** the rendered output contains no executable script and no dangerous link

#### Scenario: Supported markdown renders
- **WHEN** content uses headings, bold, lists, links, code blocks, and images
- **THEN** they render with their expected formatting

### Requirement: Image upload to Storage with signed URL
The system SHALL allow authenticated users to upload images for post content to Supabase Storage, accepting only `image/jpeg`, `image/png`, `image/webp` up to 5MB, and SHALL serve them via signed URLs. Uploads violating type or size MUST be rejected with a clear error.

#### Scenario: Valid image uploaded and served
- **WHEN** an author uploads a 3MB PNG
- **THEN** the image is stored and a signed URL is returned for use in the content

#### Scenario: Oversized file rejected
- **WHEN** an author uploads a file larger than 5MB
- **THEN** the upload is rejected with a clear size error

#### Scenario: Disallowed type rejected
- **WHEN** an author uploads a file whose type is not jpg/png/webp
- **THEN** the upload is rejected with a clear type error

### Requirement: Posts row-level security per operation
The system SHALL enforce RLS on `posts` covering each operation explicitly: SELECT for any authenticated user; INSERT for any authenticated user only when `author_id` equals the current user; UPDATE only by the author; DELETE only by the author.

#### Scenario: Read requires authentication
- **WHEN** an unauthenticated request reads posts
- **THEN** access is denied

#### Scenario: Insert forces self as author
- **WHEN** an authenticated user inserts a post with `author_id` set to another user
- **THEN** the insert is rejected by RLS

#### Scenario: Update/delete restricted to author
- **WHEN** a non-author attempts UPDATE or DELETE on a post
- **THEN** RLS blocks the operation
