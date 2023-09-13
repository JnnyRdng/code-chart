# Unnamed flowchart experiment.

Mermaid is great but readability sucks. What if we could have Mermaid but it's actually javascript but not quite?

Write javascript-like statements and get a Mermaid flowchart right back at you. Which _incredibly_ limited functionality[^1]

[^1]: May improve in future.

```sh
> npm i

# runs the live editor in browser
> npm run dev 

# run the tests
> npm run test[:watch][:coverage] 
```


## Example:
```
((' '));
i like flowcharts;
(flowcharts are great);
if (i'm hungry) {
  eat;
} else {
  sleep;
}
good bye;
```

becomes:
```mermaid
flowchart TD;
  1((" "))
  2["i like flowcharts"]
  3("flowcharts are great")
  4{"i'm hungry"}:::condition
  7["eat"]
  8["sleep"]
  9["good bye"]
  1-->2
  2-->3
  3-->4
  4-->|True|7
  4-->|False|8
  7 & 8-->9

classDef condition fill:#c3516b
```