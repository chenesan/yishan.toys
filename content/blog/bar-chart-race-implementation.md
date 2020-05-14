---
title: Bar Chart Race in React
date: '2020-05-14T22:00:00.000Z'
tags: ["React", "programming", "Javascript"]
---

(前言：這篇文是今年一月的時候寫的，原本想再多寫一些東西，但現在看來這樣也足夠完整了。

在實作時 react-spring v9 已經喊了好一陣子了，至今還在 rc 版本中，大家只好慢慢等了。)

前一陣子 [bar chart race](https://app.flourish.studio/@flourish/bar-chart-race) 正夯，趁著有閒的時候也用 [react-spring](https://www.react-spring.io/) 和 [vx](https://vx-demo.now.sh) 做了一個。

Demo: https://bar-chart-race.yishan.toys/

Source: https://github.com/chenesan/bar-chart-race

來聊聊一些實作的心得吧！

## bar-chart-race

這個實作是基於 [Mike Bostock 用 d3 實作的版本](https://observablehq.com/@d3/bar-chart-race)。一樣的資料，但使用 react-spring 來處理動畫。



## react-spring

這次是我第一次使用 react-spring 做動畫，以往寫 react 碰到 transition 都是用 css 或是 react-transition-group。之所以用 react-spring，沒為什麼，單純只是想試試看XD

react-spring 最大的特色在於它不採用一般的 time-based 的設定，以往如果想調整 transition 的動畫，必須自己去調位置對時間的曲線，調出來的結果往往不太真實，因為它不一定符合我們在真實世界中看到的物體移動的樣子。而相對的，react-spring 的 transition 設定是基於物理學，之所以叫作 spring 就是因為它用彈簧受力位移的方式來模擬動畫，所以我們使用時輸入的不是 x-t 曲線，而是物理學的參數：質量、摩擦力、拉力，透過調整這三個參數，react-spring 會模擬物體在真實世界跑起來的樣子，動畫看起來就會像真實世界的運動。

react-spring 的 api 有 hooks 和 render props 兩種版本，實際上用起來像什麼樣呢？比方說我們想要有一個區塊，toggle on 時展開，toggle off 時收起來，react-spring 下可以這樣寫：

```javascript
import { useSpring, animated } from 'react-spring';

function BlockAnimation(show) {
  const props = useSpring({ height: show ? 300 : 0 });
  return <animated.div style={props}>
    {/* any content inside */}
  </animated.div>;
}

```

`useSpring` 是一個 react hook，接收一組你希望動畫的值，回傳一組 animation props，丟到 `animated.div` 裡面，就會 render 出一個 div，它的 style 是按照動畫變化的。更詳細的 api 可以看 https://www.react-spring.io/docs/hooks/use-spring。個人覺得 react-spring 的 api 算是蠻簡單易用的。

講完這些，要來講點壞話啦......

### 我要怎麼停止我的 transition？

`useSpring` 可以透過傳 updater function 進去，得到一個 `stop` 來停止動畫，但 `useTransition` 沒有這樣的機制。文件裡面也完全沒有提到。

嘗試去看它的 source code，發現可以透過傳 `ref` 進去來拿到一組 `stop()` 和 `start()` 控制暫停和播放，但實際上用起來有點彆扭。第一，`start()` 不能只在開始時呼叫，你必須每次 render 時在 `useLayoutEffect` 呼叫它:

```javascript
useLayoutEffect() {
  if (playing) {
    start();
  }
}
```

第二，如果注意看上面的 demo 的話，`stop` 本身並不會馬上停住，而是 transition 完全結束的時候才停止。在 v9 版本中新增了一個 `pause` 和 `resume` 的機制才讓它能夠真正的在 transition 到一半的時候暫停。

### 效能？

react-spring 號稱有兼顧效能，可是實作出來跑在中階手機的 firefox mobile 上明顯卡頓，而在原本 d3 版本的實作上看起來卻很順。用 react profiler 看起來主要的 loading 都在 useTransition 的計算身上。或者可能不能怪 react-spring，而是 react 本身就有的效能上限...如果真的要驗證的話，或許用不同的 library(react-motion, animated, react-transition-group)實作一次就知道了。
