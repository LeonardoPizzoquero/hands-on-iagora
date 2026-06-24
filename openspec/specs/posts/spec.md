# posts Specification

## Purpose

Define o modelo de dados de posts, o feed com paginação por cursor, a página de detalhe, o CRUD restrito ao autor, validação e renderização segura de markdown, upload de imagens para o Storage com URL assinada, e as policies de RLS por operação.

## Requirements

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
The system SHALL display a feed of posts paginated by a cursor. The default order SHALL be `created_at` descending (with `id` as tiebreaker). The feed SHALL also support ordering by most-liked via `?sort=top` (by like count descending, with `created_at`/`id` as tiebreaker); when `sort` is absent or not `top`, the default most-recent order is used. Each feed item SHALL show the author's name (from `profiles`), the post date, and its like count.

#### Scenario: First page loads most recent posts
- **WHEN** an authenticated user opens the feed
- **THEN** the most recent posts are shown newest-first, limited to the page size

#### Scenario: Loading more via cursor
- **WHEN** the user requests the next page with the last item's cursor
- **THEN** the system returns the next batch with no duplicates or gaps

#### Scenario: Sort by most liked
- **WHEN** an authenticated user opens `/feed?sort=top`
- **THEN** posts are ordered by like count descending

#### Scenario: Default order unchanged
- **WHEN** the feed is opened without `sort` (or a value other than `top`)
- **THEN** posts are ordered most-recent-first

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

### Requirement: Full-text search of posts
The system SHALL provide full-text search over posts by `title` and `content` using Postgres full-text search (a generated `tsvector` column with a GIN index, config `portuguese`, accent-insensitive via `unaccent`) — not `LIKE`. Results SHALL be ordered by relevance (`ts_rank`) and SHALL include the author's name (from `profiles`) and the post date. The search term MUST be sanitized (parsed via `websearch_to_tsquery`) so user input cannot inject query operators or SQL.

#### Scenario: Match by title
- **WHEN** an authenticated user searches a term present in a post's title
- **THEN** that post appears in the results

#### Scenario: Match by content
- **WHEN** an authenticated user searches a term present only in a post's content
- **THEN** that post appears in the results

#### Scenario: Accent-insensitive match
- **WHEN** a user searches without accents (e.g. "duvida") for a post containing "dúvida"
- **THEN** the post is found

#### Scenario: Ordered by relevance
- **WHEN** multiple posts match a query
- **THEN** they are returned ordered by `ts_rank` relevance (most relevant first)

#### Scenario: Results show author and date
- **WHEN** search results are displayed
- **THEN** each result shows the author's name (from `profiles`) and the post date

#### Scenario: Empty results state
- **WHEN** a search matches no posts
- **THEN** a clear empty message "nenhum post encontrado para «X»" is shown

#### Scenario: Search does not bypass RLS
- **WHEN** an unauthenticated request attempts to search posts
- **THEN** access is denied (RLS SELECT requires authentication), exposing nothing beyond what the feed shows

### Requirement: Shareable search via URL query
The feed SHALL read the search term from the URL query parameter `q`. When `q` is present and non-empty, the feed SHALL show search results for that term; when absent or empty, the feed SHALL show the normal paginated feed. The search input SHALL keep `q` in the URL so a search is shareable and navigable.

#### Scenario: Query param drives results
- **WHEN** a user opens `/feed?q=deploy`
- **THEN** the feed shows search results for "deploy"

#### Scenario: No query shows normal feed
- **WHEN** a user opens `/feed` without `q` (or with empty `q`)
- **THEN** the normal most-recent-first paginated feed is shown

#### Scenario: Searching updates the URL
- **WHEN** a user submits a term in the search field
- **THEN** the URL updates to include `?q=<term>` (shareable)
