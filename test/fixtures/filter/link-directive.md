# Text directives

Text directive with attributes: :link[Document title]{#id ref="Target 1" key=value}.

Text directive without attributes: :link[Target 2].

Escaped backticks: \`:link[Target 3]\`, \``:link[Target title]{ref=target_4}\``.

	Verbatim block: :link[No text directive].

~~~
Fenced code block: :link[No text directive].
~~~

```
Backtick code block: :link[No text directive].
```

HTML comment: <!-- :link[No text directive] -->.

Verbatim text: `:link[No text directive]`, ``:link[No text directive]``.

A text directive must start with : ::link[No text directive].

A text directive marker must not be escaped: \:link[No text directive].
