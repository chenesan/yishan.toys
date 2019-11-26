---
title: 2025 年的前端技術會是什麼樣子？
date: '2019-11-26T11:30:00.000Z'
tags: ["frontend", "programming"]
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/24tQRwIRP_w" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

這是 Richard Feldman ([Elm In Action](https://www.manning.com/books/elm-in-action)的作者)對 2020 - 2025 年 Web 技術(但大部分是前端啦)發展的預測，語速超快幾乎沒有停頓(感謝 Youtube 字幕)，講者提出四個預測：

* TypeScript 會越來越熱門。2025年時寫 TypeScript 的人會比寫 JavaScript 的人多。

雖然很多人(包括我)會抱怨 TypeScript 的型別容易變得很長、常常有奇怪的 Type Error、有些純 JavaScript package 沒有 typed 不能用等一堆麻煩事，但畢竟這些都是個人開發經驗的麻煩。對於大型團隊來說，有了靜態型別錯誤能夠減少非常多，也方便看懂別人的 code。所以講者預測，到了 2025 年商業開發大部分都會用 TypeScript。但我想對於小型的 App 或團隊來說，JavaScript 就很足夠了。

* WebAssembly 在 2025 年會佔據開發技術的一部分，特別是那些需要大量計算的 App。

這幾年 Mozilla 一直在推 WebAssembly。它讓我們能夠用其它語言(C、C++、Rust...)來寫需要大量運算的邏輯，編譯成 WebAssembly 在瀏覽器上執行，對繪圖或是遊戲等領域會有很大的影響(甚至還可以讓你[在上面跑 Windows2000](https://bellard.org/jslinux/vm.html?url=https://bellard.org/jslinux/win2k.cfg&mem=192&graphic=1&w=1024&h=768)！)。但雖然 WebAssembly 跑得比 JS 快得多，並不代表 JS 會被取代，畢竟在一般的使用情境下 JS 已經足夠快了。

* npm 會在眾多安全性問題之後繼續活下去。

雖然有像 event-stream、left-pad 等等的安全性事件，講者猜測 npm 的 ecosystem 還是會存活下去，因為太方便了。他也提到如果要安全的使用 npm 可以下 `npm config set ignore-scripts true`，這會忽略 package.json 裡面的 script，如此可以迴避掉一些危險的 pre/post-install scripts，但也會不能跑 package.json 的指令就是了，很不方便。

* Elm、ReasonML、ClojureScript 等 compile-to-JS 的語言不會替代 JavaScript 變成大熱門，但仍然會有一部分人使用它。

一直以來這一類語言受到部分函數式信徒的青睞，也(號稱)有許多優點(Type Safety、沒有 Runtime Error、效能較快...)，然而對大部分人來說 TypeScript 似乎就足夠了，因此講者預測這些語言會持續有一部分人使用，但不會變得熱門。

