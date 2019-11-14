---
title: Mozilla 宣佈 bytecode alliance
date: '2019-11-14T09:50:00.000Z'
tags: ["WebAssembly", "programming"]
---

[Mozilla 宣佈將和 Fastly、Intel 和 Red Hat 一起合作打造 WebAssembly 的生態系](https://hacks.mozilla.org/2019/11/announcing-the-bytecode-alliance/)，除了 Webassembly 的標準和實作，還特別提到他們怎麼打造安全的 package system。

每個 Webassembly module 會跑在獨自的 nanoprocess 內，這個 nanoprocess 會由 WebAssembly runtime 提供，每個 nanoprocess 有各自的 memory，不仰賴 shared memory 傳遞資料，而只能透過 function call；module 預設狀態下沒辦法取得 system call / API 和所有的 shared resource 權限，必須由依賴它的 module 來提供。

不知道實作出來 preformance 和原生的 code 會差多少就是了。
