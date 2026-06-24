## ADDED Requirements

### Requirement: Like data model
The system SHALL store likes in two tables, `post_likes` and `comment_likes`, each with `user_id` (references the profile/user), the target id (`post_id` / `comment_id`), and `created_at`. Each table SHALL enforce a UNIQUE constraint on `(user_id, post_id)` / `(user_id, comment_id)` so a user has at most one like per item. Foreign keys SHALL cascade on deletion of the user or the target.

#### Scenario: One like per user per item
- **WHEN** a user who already liked an item likes it again at the database level
- **THEN** the UNIQUE constraint prevents a duplicate row

#### Scenario: Like removed when target is deleted
- **WHEN** a post or comment is deleted
- **THEN** its like rows are removed by cascade

### Requirement: Toggle like
The system SHALL let an authenticated user toggle a like on a post or comment via a Server Action: if not yet liked, it creates the like; if already liked, it removes it. The action MUST set `user_id` to the current user server-side.

#### Scenario: Like then unlike
- **WHEN** an authenticated user toggles a like on an item they have not liked
- **THEN** the like is created and the count increases by one
- **WHEN** they toggle again
- **THEN** their like is removed and the count decreases by one

### Requirement: Like count and liked-by-me state
The system SHALL expose, for each post and comment, the total like count and whether the current user has liked it ("liked by me"), and SHALL display both wherever the item appears.

#### Scenario: Count and state shown
- **WHEN** an authenticated user views a post or comment
- **THEN** the like count and their own liked/not-liked state are shown

### Requirement: No self-like
The system SHALL prevent a user from liking their own post or comment, enforced at the database (RLS), not only the UI.

#### Scenario: Self-like rejected by database
- **WHEN** a user attempts to like a post or comment they authored
- **THEN** the database rejects the insert

#### Scenario: Self-like control hidden
- **WHEN** a user views their own post or comment
- **THEN** no like control is offered for it

### Requirement: Likes row-level security per operation
The system SHALL enforce RLS on `post_likes` and `comment_likes` covering each operation explicitly: SELECT for any authenticated user; INSERT for any authenticated user only when `user_id` equals the current user AND the current user is not the author of the target; DELETE only of the user's own like (`user_id = auth.uid()`).

#### Scenario: Read requires authentication
- **WHEN** an unauthenticated request reads likes/counts
- **THEN** access is denied

#### Scenario: Insert forces self as liker
- **WHEN** an authenticated user inserts a like with `user_id` set to another user
- **THEN** the insert is rejected by RLS

#### Scenario: Delete restricted to own like
- **WHEN** a user attempts to delete another user's like
- **THEN** RLS blocks the operation
