---
!!map {
  ? !!str "a"
  : !!str "value a",
  ? !!str "b"
  : !!seq [
      !!str "value b1",
      !!str "value b2"
    ]
}
---

# Unit test for a YAML frontmatter with tags
