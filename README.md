# scats
Useful scala classes in typescript


# Install
```shell
npm i scats
```

# Monads
## Collection
Represents the collection of items of some type.

## Option
Represents a possibly empty value.

```typescript
import {option} from "scats";

const a = null;
const b = option(a); // b = none;

const c = 1;
const d = option(c); // d = some(1);
```

## Try
Represents the result of error prone block.


```typescript
import {Try} from "scats";

const a = Try(() => 1); // a = success(1);
const b = Try(() => { throw new Error(2) }); // a = error(2);
```

Also works with promises:

```typescript
import {Try} from "scats";

const a = await Try.promise(() => Promise.resolve(1)); // a = success(1);
```



## Either
Represents the value, marked as left or right.
