---
title: 不 evil 的 eval - Realms
date: '2019-08-29T20:20:00.000Z'
tags: ["javascript", "programming"]
---

前不久看到 [Figma 的文章](https://www.figma.com/blog/how-we-built-the-figma-plugin-system/) 談到他們怎麼打造 plugin system。他們想要讓用戶可以自己寫 javascript 創造 plugin 來打造自己的工作流程。

最直接的當然是 `eval`，可是這明顯不安全。他們一開始想到把 plugin 丟進另一個 iframe 裡面去執行，然而出於 UX 和效能的問題而放棄這個方案。最後他們用了一個叫作 [Realm](https://github.com/tc39/proposal-realms/#ecmascript-spec-proposal-for-realms-api) 的 stage-2 ECMAScript 特性，Realm 可以想成是另一個 sandbox，有自己的 global variable 因此不會污染到原環境的 global variable。用法如下：

```javascript

var g = window
var r = new Realm()
var f = Realm.evaluate('(function() { return 17 })')

f() === 17 // true

Reflect.getPrototypeOf(f) === Reflect.getPrototypeOf(g) // false
Reflect.getPrototypeOf(f) === Reflect.getPrototypeOf(r) // true

```

所以說，你可以安心的執行程式碼而不用擔心會改寫到全局變數。

第二個參數是讓你把變數加到 Realm 的 scope 裡的，像

```javascript

Realm.evaluate('log(1+1)', {log: console.log}) // print 2

```

可以提供 API 給 plugin 的執行環境。

目前要使用 Realm 得透過 [realms-shim](https://github.com/Agoric/realms-shim)。

相關連結：

* [Figma 的文章](https://www.figma.com/blog/how-we-built-the-figma-plugin-system/)
* [realms-shim](https://github.com/Agoric/realms-shim)
* [proposal](https://github.com/tc39/proposal-realms/#ecmascript-spec-proposal-for-realms-api)
