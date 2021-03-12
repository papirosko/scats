# scats
Useful scala classes in typescript


# Install
```shell
npm i scats
```

# Monads
## Collection
Represents the collection of items of some type.

```typescript
import {Collection, Nil} from "scats";

const empty = Collection.empty; // empty collection
const empty2 = Nil; // empty collection
const example = new Collection([1, 2, 3]); // create instance from arrau
const example2 = Collection.fill(3)(idx => idx + 1); // Collection.of(1, 2, 3)
const c = Collection.of(1, 2, 3);
for (let el of c) {
    console.log(el); // 1, 2, 3
}
c.slice(2, 5); // Collection.of(3)
c.map(e => e + 1); // Collection.of(2, 3, 4)
Collection.of(1, 2).flatMap(x => Collection.of(x, x + 1)); // Collection.of(1, 2, 2, 3)
Collection.of(1, Collection.of(2, 3), 4).flatten<number>(); // Collection.of(1, 2, 3, 4)    
Collection.of(1, 2, 3).get(1); // 2    
Collection.of(1, 2, 3).toArray; // [1, 2, 3]    
Collection.of(1, 2, 3).reverse; // Collection.of(3, 2, 1)    
Collection.of(2, 3, 1).sort((a, b) => a - b); // Collection.of(1, 2, 3)    
Collection.of({x: 2}, {x: 1}, {x: 3}).sortBy(el => el.x); // Collection.of(1, 2, 3)
Collection.of(1, 2).appended(3); // Collection.of(1, 2, 3)
Collection.of(1, 2).appendedAll(Collection.of(3, 4)); // Collection.of(1, 2, 3, 4)
Collection.of(1, 2).prepended(0); // Collection.of(0, 1, 2)
Collection.of(1, 2).prependedAll(Collection.of(-1, 0)); // Collection.of(-1, 0, 1, 2)
Collection.of(1, 2).concat(Collection.of(3, 4)); // Collection.of(1, 2, 3, 4)
Collection.of(1, 2, 2).toSet; // HashSet.of(1, 2)
Collection.of(1, 2, 2).distinct; // Collection.of(1, 2)
Collection.of({x: 2}, {x: 1}, {x: 2}).distinctBy(el => el.x); // Collection.of({x: 2}, {x: 1})
Collection.of({id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}).toMap(el => [el.id, el.name]); // HashMap(1 -> 'Alice', 2 -> 'Bob')
c.sum(identity); // 6. We have to provide identity to convert element to number
c.take(2); // Collection.of(1, 2)
c.drop(1); // Collection.of(2, 3);
c.head; // 1
```


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
import {Try} from 'scats';

const okResult = Try(() => 1); // a = success(1);
const failedResult = Try(() => { throw new Error(2) }); // b = failure(new Error(2));

okResult.toOption; // some(1)
failedResult.toOption; // none

okResult.toEither; // right(1)
failedResult.toEither; // left(new Error(2))
okResult.toEitherMapLeft(error => 3); // right(1)
failedResult.toEitherMapLeft(error => 3); // left(3)

okResult.map(value => value + 1); // success(2);
failedResult.map(value => value + 1); // failure(new Error(2));

okResult.isSuccess; // true
okResult.isFailure; // false
failedResult.isSuccess; // false
failedResult.isFailure; // true

okResult.match({
    success: value => 100,
    failure: error => 200
}); // 100
failedResult.match({
    success: value => 100,
    failure: error => 200
}); // 200


okResult.foreach(value => console.log(value)); // prints 1
failedResult.foreach(value => console.log(value)); // prints nothing

okResult.tapFailure(error => console.log(error.message)); // prints nothing
failedResult.tapFailure(error => console.log(error.message)); // prints 2

okResult.recover(error => 2); // success(1)
failedResult.recover(error => 2); // success(2)
failedResult.recover(error => { throw new Error('fallback'); }); // failure(new Error('fallback'));

okResult.recoverWith(error => success(2)); // success(1)
failedResult.recoverWith(error => success(2)); // success(2)
failedResult.recoverWith(error => failure(new Error('fallback'))); // failure(new Error('fallback'));
```

Also works with promises:

```typescript
import {Try} from 'scats';

const a = await Try.promise(() => Promise.resolve(1)); // a = success(1);
await a.mapPromise(x => Promise.resolve(x)); // success(1)


```



## Either
Represents the value, marked as left or right. Either is right-biased.

```typescript
import {left, right, forComprehension} from 'scats';

const r = right('123'); // Right('123');
const l = left('left value'); // Left('123');
right(123).isRight; // true
right(123).isLeft; // false
left('left value').isRight; // false
left('left value').isLeft; // true

right(123).match({
    right: () => 'right',
    left: () => 'left'
}); // 'right'
left('left value').match({
    right: () => 'right',
    left: () => 'left'
}); // 'left'

right(123).fold(
    leftValue => console.log(`left: ${leftValue}`),
    rightValue => console.log(`right: ${rightValue}`)
); // 'right: 123'

left('left value').fold(
    leftValue => console.log(`left: ${leftValue}`),
    rightValue => console.log(`right: ${rightValue}`)
); // 'left: left value'

right(123).swap; // left(123);

right(123).foreach(x => console.log(x)); // 123
left(123).foreach(x => console.log(x)); // prints nothing

right(123).getOrElse(() => 1); // 123
right(123).getOrElseValue(1); // 123
left(123).getOrElse(() => 1); // 1
left(123).getOrElseValue(1); // 1

right(123).orElse(() => right(444)); // right(123)
right(123).orElseValue(right(444)); // right(123)
left(123).orElse(() => right(444)); // right(444)
left(123).orElseValue(right(444)); // right(444)

right(123).contains(123); // true
right(123).contains(124); // false
left(123).contains(123); // false
left(123).contains(124); // false

right(123).forall(x => x >= 10); // true
right(123).forall(x => x < 10); // false
left(123).forall(x => x >= 10); // false
left(123).forall(x => x < 10); // fales

right(123).exists(x => x >= 10); // true
right(123).exists(x => x < 10); // false
left(123).exists(x => x >= 10); // false
left(123).exists(x => x < 10); // fales

right(123).map(x => x + 1); // right(124)
right(123).left.map(x => x + 1); // right(123)
left(123).map(x => x + 1); // right(123)
left(123).left.map(x => x + 1); // right(124)

right(123).toCollection; // Collection.of(123)
left(123).toCollection; // Collection.empty
right(123).toOption; // Some(123)
left(123).toOption; // None
right(123).toTry; // Success(123)
left(123).toTry; // Failure(new Error(123))

right(123).left; // left-biased Either

forComprehension(
    step('s', () => left('flower').left),
    step('m', () => left('bird').left),
).yield(({s, m}) => s.length + m.length); // left(10)

```

## HashMap
```typescript
import {HashMap} from 'scats';

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
import {HashSet} from 'scats';

const set1 = HashSet.of(1, 2);
const set2 = HashSet.of(2, 3);
set1.size; // 2
set1.isEmpty; // false
set1.nonEmpty; // true
set1.filter(x => x > 1); // HashSet.of(2)
set1.filterNot(x => x > 1); // HashSet.of(1)
set1.map(x => x + 1); // HashSet.of(2, 3)
set1.toCollection; // Collection.of(2, 3) - order may be different
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
import {forComprehension, step} from 'scats';

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
).yield(({num1, num2, num3}) => num1 + num2 + num3); // success(6)


forComprehension(
    step('num1', () => toNum('1')),
    step('num2', () => toNum('s2')),
    step('num3', () => toNum('3')),
).yield(({num1, num2, num3}) => num1 + num2 + num3); // failure(new Error('s2 is not a number')


// with collections:
forComprehension(
    step('i', () => Collection.of(1, 2)),
    step('j', () => Collection.of(4, 3))
).yield(({i, j}) => [i, j]); // Collection.of([1, 4], [1, 3], [2, 4], [2, 3])

forComprehension(
    step('i', () => Collection.of(1, 2)),
    step('j', () => Collection.of(2, 1)).if(({i, j}) => i + j === 3)
).yield(({i, j}) => [i, j]); // Collection.of([1, 2], [2, 1])

// with promises

function toNumPromise(x: string): Promise<TryLike<number>> {
    return Promise.resolve(Try(() => {
        const res = parseInt(x);
        if (isNaN(res)) {
            throw new Error(`${x} is not a number`);
        } else {
            return res;
        }
    }));
}


await forComprehension.promise(
    task('num1', () => toNumPromise('1')),
    task('num2', () => toNumPromise('2')),
    task('num3', () => toNumPromise('3')),
).yield(({num1, num2, num3}) => num1 + num2 + num3); // success(6)


await forComprehension.promise(
    task('num1', () => toNumPromise('1')),
    task('num2', () => toNumPromise('s2')),
    task('num3', () => toNumPromise('3')),
).yield(({num1, num2, num3}) => num1 + num2 + num3); // failure(new Error('s2 is not a number')

await forComprehension.promise(
    task('num1', () => toNumPromise('1')),
    task('num2', () => toNumPromise('2')).if(({num2}) => num2 > 10),
    task('num3', () => toNumPromise('3')),
).yield(({num1, num2, num3}) => num1 + num2 + num3); // failure(new Error("Predicate does not hold for '2'")

await forComprehension.promise(
    task('num1', () => toNumPromise('1')),
    task('num2', () => { throw new Error('Error in task'); }),
    task('num3', () => toNumPromise('3')),
).yield(({num1, num2, num3}) => num1 + num2 + num3); // throws Error('Error in task')

```
