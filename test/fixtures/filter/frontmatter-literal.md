---
a: |- # Literal style with strip chomping indicator
  &value
  a

b: | # Literal style without chomping indicator
  *value
  b

c: |+ # Literal style with keep chomping indicator
  #value
  c

d: |+ # Literal style with keep chomping indicator
  @value
  d

e:
  - |- # Literal style with strip chomping indicator
    &value
    e1

  - | # Literal style without chomping indicator
    *value
    e2

  - |+ # Literal style with keep chomping indicator
    #value
    e3

nocite: |
  <email@citekey1>;
  [Email](mailto:email@citekey2);
  \@nocitekey;
  @müller
---

# Unit test for a YAML frontmatter with literal block scalars
