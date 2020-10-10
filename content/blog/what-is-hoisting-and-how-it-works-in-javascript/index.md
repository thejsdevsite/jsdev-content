---
uid: 7wlkfi8ae1e
title: What is hoisting and how it works in JavaScript
date: "2020-09-25T17:56"
description: "Hoisting is a term you won't find anywhere, but it describes a mechanism in JavaScript to provide early-access to declarations."
published: true
publishedDate: "2020-09-25T19:45:00Z"
updatedDate: "2020-09-26T12:15:00Z"
posttags: ["javascript"]
authors: ["jmitchell"]
primaryAuthor: "Justin Mitchell"
hero: ./hero.png
---

The famed and often confusing term, certainly for any JavaScript developer, and it leaves many scratching their heads; what exactly is hoisting?

Hoisting is a term that describes a mechanism in JavaScript to provide early-access to declarations.

> Hoisting is a JavaScript mechanism where variables and function declarations are moved to the top of their scope before code execution.

Ever wondered why in JavaScript you can interact with your variables and functions before they've been declared? Then read on!

##### tl;dr
Conceptually speaking, hoisting is the movement of declaractions - variables and functions - to the top of their scope, while assignments are left in place. What really happens, is that during compile time, the declarations are put into memory _first_, but physically remain in place in your code.

The benefit of doing this is that you get access to functions and variables _before_ they're declared in code. This only applies to _declarations_, not to expressions, and not to initializing an undeclared variable.

```javascript
foo("bar");
function foo(bar) {
  // do something
}
```

It's important to remember that _only_ declarations are hoisted into memory during compile time, _not_ assignments.

## Only declarations are hoisted
JavaScript only hoists the declarations of functions and variables into memory during compile time, _not_ the assignments. This means that if a variable is declared and initialized after using it, the value will be `undefined`.

```javascript
console.log(foo) // prints 'undefined' as only the _declaration_ was hoisted
var foo; // declaration
foo = "bar"; // initialization
```

The following is an example of initialization returning a `ReferenceError`. In this case, a variable is only initialized, not declared; in order to declare something to be hoisted in JavaScript, it must either be explicitly declared as a [var or function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements), as implicit declaractions (initialization only) wont be hoisted.

```javascript
console.log(foo); // prints 'ReferenceError: foo is not defined'
foo = "bar"; // only initialization, no declaration, value did not follow var
```

It's important to remember that only the _declaration_ is hoisted, even if a value is assigned.
```javascript
console.log(foo); // prints 'undefined'
var foo = "bar";
```

### Hoisting variables
JavaScript allows us to declare and initialize our variables simultaneously. However, the engine separates the declaration and initialization of variables, and executes it as separate steps, thus allowing the engine to hoist declarations above initializations.

All function and variable _declarations_ are hoisted to the top of their scope, while variable declarations are processed ahead of function declarations; which is why you can call functions with yet-to-be-declared variables, and get an `undefined` error.

However, there is a caveat. When _initializing_ a variable, that hasn't yet been declared yet, the variable is hoisted to the global scope when it is executed, rather than hoisted to its scope, like the function it's being initialized in. This _only_ happens on execution, not at compile time.

```javascript
function doSomething() {
  doing = "something";
}

console.log(doing); // ReferenceError: doing is not defined
doSomething();
console.log(doing); // something
```

This is distinctly different to scoped variable declarations, which only exist within their scope. 

```javascript
function doSomething() {
  var doing = "something";
}

console.log(doing); // ReferenceError: doing is not defined
doSomething();
console.log(doing); // ReferenceError: doing is not defined
```

The take-away is, that _declared_ variables are hoisted to the top of their scope at **compiled time**, while _undeclared_ variables are hoised to the global scope **during execution**.

### Declarations using `let` and `const` are not hoisted to global space
`let` and `const` were introduced in ES6 for scope-based operations, but unlike `var`, do not get hoisted to global space during compile time. Variables declared with `let` are block scoped and not function scoped. This is significant, because unlike `var`, there's no risk of variable leakage outside of the scope of execution.

The downside is that `const` and `let` do not get hoisted, in local or global scope. Read more about [var, const and let][const-var-let].

```javascript
console.log(foo); // prints 'ReferenceError: foo is not defined'
const foo = "bar";

console.log(bar); // prints 'ReferenceError: bar is not defined'
let bar = "bar";
```

### Strict mode prevents sloppy hoisting
Introduced as a utility in ES5, [strict-mode][strict-mode] is a way to _opt in_ to a restricted variant of JavaScript, implicitly opting-out of [sloppy mode][sloppy-mode]. It introduces different semantics, such as eliminating some silent errors, improves some optimizations and prohibits some syntax, such as accessing variables before they've been declared.

You can opt-in to strict-mode by pre-facing your file, or function with `use strict` at the top of the scope, before any code is declared:

```javascript
'use strict';
// or
"use strict";
```

We can test if we can access initializations ahead of time with strict-mode enabled:

```javascript
"use strict";
function doSomething() {
  foo = 20;
}
doSomething();
console.log(foo); // prints 'ReferenceError: foo is not defined'
```

### Not all functions are hoisted alike
Function are classified as either function declarations, or function expressions. The important difference between the two, when discussing hoisting, is _declaration_. A declared function _will be hoisted_, while a function created through an expression _will not_ be hoisted. 

```javascript
console.log(typeof hoistedFunction); // prints 'function'
console.log(typeof unhoistedFunction); // prints 'undefined'

function hoistedFunction() {
  // This function _will_ hoisted, because it is *declared* as a function
}

var unhoistedFunction = function() {
  // This function _will not_ be hoisted because it is declared through an expression of a variable, and therefore will be undefined 
}
```

### Order of hoisting precedence matters
There are two rules you have to keep in mind when working with hoisted functions and variables:

1. Function declaration takes precedence over variable declarations
1. Variable assignment takes precedence over expression function 

```javascript
console.log(typeof myVar); // prints 'undefined'
console.log(typeof myFunc); // prints 'function'
var myVar = "foo"; // declaration and initialization
function myFunc(){} // declaration
console.log(typeof myVar); // prints 'string'
```

We can take a deeper look at the steps during the compilation and execution cycle to see what's happening with our declaration and initializations:

```javascript
function myFunc(){...}
var myVar;
console.log(typeof myVar);
console.log(typeof myFunc);
myVar = "foo";
console.log(typeof myVar);
```

### Classes are not hoisted
Classes in JavaScript are in fact special functions, and just as you can define functions with declaration and expression, the class syntax has the same two components: [class expressions and class declarations][function-class].

Unlike functions and variables, classes _do not_ get hoisted, either through declaration or expression. You need to declare your class before you can use it.

```javascript
const p = new Rectangle(); // ReferenceError
console.log(typeof Rectangle); // ReferenceError

class Rectangle {}
```

### Conclusion
Let's summarise what we've learned:

1. Hoisting is a mechanism that inserts variable and function declaractions into memory ahead of assignment and initialization within the given scope of execution
1. `const`, `let`, function expressions and classes _do not_ get hoisted, and cannot be read or accessed before their declaration
1. `safe-mode` prevents sloppy hoisting of initialized undeclared variables onto the global scope

To avoid hoisting confusion and issues in the longterm, it's better to declare your variables and functions ahead of initialization and access. You'll avoid a whole set of potentially nasty bugs and `undefined` warnings polluting your console.


[const-var-let]: https://thejs.dev/jmitchell/const-let-var-javascript-variables-and-immutability-00b
[strict-mode]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
[sloppy-mode]: https://developer.mozilla.org/docs/Glossary/Sloppy_mode
[function-class]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
