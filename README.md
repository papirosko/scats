# scats
Useful scala classes in typescript


# Monads
## Collection
Represents the collection of items of some type.

## Option
Represents a possibly empty value.

```typescript
import {option} from "./option";

const a = null;
const b = option(a); // b = none;

const c = 1;
const d = option(c); // d = some(1);
```

## Try
Represents the result of error prone block.

## Either
Represents the value, marked as left or right.
