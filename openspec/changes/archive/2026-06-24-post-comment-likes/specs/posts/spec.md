## MODIFIED Requirements

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
