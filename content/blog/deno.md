---
title: Deno 試玩小心得：比較好的 Node，但好的不夠多
date: '2022-02-15T10:00:00.000Z'
tags: ["Javascript", "programming"]
hidden: true
---

最近趁手上的小 side project 試玩了一下 deno。覺得比 Node.js 好的地方雖有，但沒有好到讓人想換，細述如下。
- Deno 的 binary 既是 runtime 也是 cli，cli 提供了開發所需的各項指令，包含 linter / formatter / test 等等。開發者不再需要裝 eslint / jest / prettier 等開發工具。語言本身提供開發工具的想法應該是來自 Go / Rust 等語言。個人是蠻喜歡的，省去在不同專案間要適應不同工具的問題。但也有反對者覺得這破壞了開發工具的多樣性。

- Deno 沒有 package.json 也沒有 node_modules。套件是透過 url 來引用，在 runtime 時 Deno 會去安裝套件。可以說 Deno 沒有太多套件管理的概念。我是覺得不太方便。

- Deno 有所謂的權限控管。是個進步，但只能控制整個 process，就實用上大概也是開很多東西所以用途感覺有限。

- Deno 的第三方套件和日本製的壓縮機一樣稀少，如果要從 node 那邊拿來用就要開 node-compatible mode，目前還不穩定。

綜上所述，就是有趣且算容易上手但好處不太多的東西。