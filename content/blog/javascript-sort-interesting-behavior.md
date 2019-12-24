---
title: Array.prototype.sort 的無用雜談
date: '2019-12-24T15:30:00.000Z'
tags: ["Javascript"]
---

`Array.prototype.sort` 應該大家再常用不過了吧？那麼你知道下面這行的結果是什麼嗎？

```javascript

[1,3,2].sort((a,b) => a - b > 0)

```

丟到 Firefox，console 會『正常的』得出 `[1, 2, 3]`。
然而丟到 Chrome(>= v70)，會得到 `[1, 3, 2]`...的『錯誤』結果。
再丟到 node 裡面，會發現直到 v10 之前的結果都是 `[1, 2, 3]`，但到了 v12 就變成了 `[1, 3, 2]`。

難不成瀏覽器 / node 有 bug？仔細一瞧，比較函數的回傳值怪怪的，應該是：

```javascript

[1,3,2].sort((a,b) => a - b)

```

才對。重新丟回去執行，一切都回歸正常的 `[1, 2, 3]`了！

出錯的原因在於當我們的比較函數回傳的是 `a - b > 0`，那麼在 a 比 b 小時，則會回傳 `false` 而被轉型成 0，而不是負數，違背了 spec 的要求。

顯然這是開發者自己寫出來的 bug，可是為什麼剛好 Firefox / 舊版的 Chrome / node 在錯誤的比較函數下會得到正確的結果呢？我不明白 `Array.prototype.sort` 背後的實作細節，但已知 Chrome v70 / V8 v7.0 為了穩定排序結果，[把 QuickSort 的實作換成了 TimSort](https://twitter.com/mathias/status/1036626116654637057?s=19)，連帶的修正了這個問題。希望 Firefox 也能早日跟上。

題外話，IE / Edge 倒是一開始就做對了，真難得(？)