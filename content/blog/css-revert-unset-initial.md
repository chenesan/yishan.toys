---
title: 如何重設 CSS 的 property
date: '2019-11-15T10:00:00.000Z'
tags: ["CSS", "programming"]
---

寫 CSS 偶爾會遇到需要重設 property 值的時候。這裡介紹三個看起來很像但又不一樣的關鍵字：`initial`、`unset`、`revert`。

## `initial`

會依照 property 在 [CSS Spec](https://www.w3.org/TR/CSS2/propidx.html) 裡面的初始值。例如 `margin-left` 的初始值是 0。

常見的錯誤是把 `div` 的 `display` 設成 `initial` 以為能夠讓它回到 `block`(一般瀏覽器的 User Agent Style 都會把 `div` 的 `display` 設為 `block`)。但其實 `display` 的初始值是 `inline`。

## `unset`

和 `initial` 類似，但如果該 property 是一個繼承屬性(inherited property) 就會按照繼承值計算，否則採用初始值。
例如 `color` 就是一個繼承屬性。

## `revert`

`revert` 則又比 `unset` 進一步，他會依照樣式所在的地方而定：

* 如果我們在網站上設定屬性為 `revert`，則會將屬性回滾到用戶自定義的屬性；否則就回滾到 User Agent Style (i.e. 瀏覽器的初始樣式)。

* 如果我們在用戶自定義的樣式(例如 plugin/extension)設定屬性為 `revert`，則回滾到 User Agent Style。

* 如果 User Agent Style 設定屬性為 `revert` 則行為和 `unset` 一模一樣。

`revert` 的出現讓我們能夠重設屬性到瀏覽器樣式。例如讓已經設成 `display: inline` 的 `div` 能夠回到 `block`。

如果你想看看實際用起來的效果如何，下面有一個簡單的範例：

<iframe height="265" style="width: 100%;" scrolling="no" title="css initial, unset, revert comparison" src="https://codepen.io/chenesan-1471587799/embed/abbReqx?height=265&theme-id=default&default-tab=html,result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/chenesan-1471587799/pen/abbReqx'>css initial, unset, revert comparison</a> by Yi-Shan, Chen
  (<a href='https://codepen.io/chenesan-1471587799'>@chenesan-1471587799</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

甚至你可以這樣做：

```css
.content-by-wysiwyg-editor * {
  all: revert;
}
```

來重設所有的 property 回到 User Agent Style(假設用戶沒有自定義樣式的話)。

可惜的是 `revert` 目前只有在 Firefox 67、Safari 9.1 以上才有實作，等待 Chrome 和 Edge(本質上是 Chromium) 跟上吧。


參考資料：

[MDN 上的 `revert` 介紹](https://developer.mozilla.org/en-US/docs/Web/CSS/revert)
