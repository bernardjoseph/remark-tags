---
a: >- # Folded style with strip chomping indicator
  &value
  a

b: > # Folded style without chomping indicator
  *value
  b

c: >+ # Folded style with keep chomping indicator
  #value
  c

d: >+ # Folded style with keep chomping indicator
  @value
  d

e:
  - >- # Folded style with strip chomping indicator
    &value
    e1

  - > # Folded style without chomping indicator
    *value
    e2

  - >+ # Folded style with keep chomping indicator
    #value
    e3

nocite: >
  <email@citekey1>;
  [Email](mailto:email@citekey2);
  \@nocitekey;
  @müller
---

# Unit test for a YAML frontmatter with folded block scalars
