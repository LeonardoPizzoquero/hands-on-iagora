## ADDED Requirements

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
