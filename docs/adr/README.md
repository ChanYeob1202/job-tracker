# Architecture Decision Records

One file per decision that was not obvious from the code. Numbered, append-only:
once an ADR is written it is not rewritten, it is superseded by a later one
(mark the old file `Status: Superseded by NNN`).

Worth an ADR: a decision someone could reasonably reverse without knowing why it
was made — schema types, auth strategy, what gets stored vs derived, a library
chosen over an obvious alternative.

Not worth one: anything the code already states plainly.

| # | Decision |
|---|---|
| [001](001-applied-at-is-a-date.md) | `applied_at` is a `DATE`, not a timestamp |
