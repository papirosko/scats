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


## HashMap
```typescript
import {HashMap} from "scats";

const map = HashMap.of(['1', 1], ['2', 3]);
map.toMap; // Map('1' -> 1, '2' -> 2)
map.toArray; // [['1', 1], ['2', 2]]
map.size; // 1
map.isEmpty; // false
HashMap.empty.isEmpty; // true
map.nonEmpty; // true
map.nonEmpty; // true
map.get('1'); // some(1)
map.get('5'); // none
map.getOrElse('1', () => 5); // 1
map.getOrElse('5', () => 5); // 5
map.keySet; // HashSet.of('1', '2')
map.keys; // Collection.of('1', '2')
map.values; // Collection.of(1, 2)
map.entries; // Collection.of(['1', 1], ['2', 2])
map.appendedAll(HashMap.of(['3', 3])); // HashMap.of(['1', 1], ['2', 2], ['3', 3])
map.set('2', 3); // HashMap.of(['1', 1], ['2', 3])
map.remove('2'); // HashMap.of(['1', 1])
map.updated('2', 4); // HashMap.of(['1', 1], ['2', 4])
```

## HashSet

```typescript
import {HashSet} from "scats";

const set1 = HashSet.of(1, 2);
const set2 = HashSet.of(2, 3);
set1.size; // 2
set1.isEmpty; // false
set1.nonEmpty; // true
set1.filter(x => x > 1); // HashSet.of(2)
set1.filterNot(x => x > 1); // HashSet.of(1)
set1.map(x => x + 1); // HashSet.of(2, 3)
set1.toCollection(); // Collection.of(2, 3) - order may be different
set1.toMap(x => [x, x]); // HashMap.of([1, 1], [2, 2])
set1.contains(1); // true
set1.appended(2); // HashSet.of(1, 2)
set1.appendedAll(HashSet.of(1, 2)); // HashSet.of(1, 2)
set1.removed(1); // HashSet.empty
set1.removedAll(HashSet.of(1, 2)); // HashSet.empty
set1.intersect(set2); // HashSet.of(2)
set1.union(set2); // HashSet.of(1, 2, 3)
```

## forComprehension

```typescript
import {forComprehension, step} from "./util";

function toNum(x: string) {
    return Try(() => {
        const res = parseInt(x);
        if (isNaN(res)) {
            throw new Error(`${x} is not a number`);
        } else {
            return res;
        }
    });
}


forComprehension(
    step('num1', () => toNum('1')),
    step('num2', () => toNum('2')),
    step('num3', () => toNum('3')),
).yield(state => state.num1 + state.num2 + state.num3); // success(6)


forComprehension(
    step('num1', () => toNum('1')),
    step('num2', () => toNum('s2')),
    step('num3', () => toNum('3')),
).yield(state => state.num1 + state.num2 + state.num3); // failure(new Error('s2 is not a number')
```
