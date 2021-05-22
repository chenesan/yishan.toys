---
title: React 的開發者測試
date: '2020-05-14T23:00:00.000Z'
tags: ["React", "programming", "Javascript"]
---

想寫這主題一陣子了，網路上講 component testing 的文章多不勝數，這裡整理筆者所知的幾種概念、做法和工具。各有好壞，讀者可以自行斟酌。
以下的文章會交替使用 component 測試 / UI 測試這兩個用詞。

## 在寫之前：UI 測試的高成本

在寫 UI / component test 之前必須知道，相較於單純的邏輯，UI 測試比起一般的 utility 或 business logic 更難維護，成本也較高，原因如下：

### UI 容易頻繁改變

UI 相較於商業邏輯屬於更細節的部分，更容易有頻繁的改變，而當 UI 改變時，UI 的測試必然也需要修改，增加測試維護的成本。

### UI 測試容易壞掉

通常 UI 的斷言是針對 output 出來的 tree(無論是 DOM 或是 React element tree)，透過 selector 找出想觀察的節點並斷言其狀態或內容。由於 UI 的 tree 很容易就會變得很深，要找到想觀察的節點就會變得困難。而 selector 若沒寫好，就容易因為不相關的 code change 而導致測試壞掉增加維護成本。

### 需要 mock，因此增加測試的複雜度和脆弱度

UI / component test 相較於邏輯需要的 mock 更多。測一個 component，你需要的 mock 可能就有：
- api mock
- date mock
- timer
- 如果是在 node 環境測，則需要用 jsdom 來模擬瀏覽器的執行環境

這些 mock 增加了測試的撰寫和維護成本，例如：
- 需要準備額外的 mock，而不能直接 render component
- 當 api 欄位變化的時候，就得去更新 fixture。
- jsdom 有時缺少真實瀏覽器擁有的 api，只好自己準備或根本不能測。



如上，UI 測試的維護成本很高。因此，在撰寫 UI 測試之前，得先思考這段測試保護的規格(UI)，價值是否真的這麼重要。如果已經有了 e2e 的保護，開發者是否要再撰寫 component test 值得想想。筆者並不是說不要寫 component testing。它當然有好處，例如重構時能夠避免破壞規格、輔助團隊伙伴了解 component 的用途等等，然而不可避的事實是，它的 cost 就是比較貴。

## component test 的兩大流派：shallow & mount

component 的測試方式可以分為兩種：
- shallow rendering
- mount rendering

讓我們以 todo list 為例，假設，我們有 `<TodoList>` 和 `<TodoItem>` 兩個 component，實作如下：

```jsx

function TodoList({ todos }) {
  return (
    <div>
      <h1>Todo List</h1>
      <ul>
        {todos.map(
          todo => (
            <TodoItem key={todo.id} todo={todo} />
          )
        )}
      </ul>
    </div>
  );
}

function TodoItem({ todo }) {
  return (
    <li>
      Todo: {todo.title}
    </li>
  );
}

```

今天我們想測試 `<TodoList>`，在 shallow 和 mount 這兩種測試方式下，測試的目的完全不一樣。

### shallow rendering

shallow rendering 只會執行一層 component 的 render，對 render 回傳的 React element 做斷言。

例如:
```jsx

const todos = [
  { id: '1', title: 'Read book' },
  { id: '2', title: 'Play music' },
];

shallow(
  <TodoList todos={todos}>
);

```

shallow render `<TodoList>` 的結果就會是:

```jsx
<div>
  <h1>Todo List</h1>
  <ul>
    <TodoItem key="1" todo={{ id: '1', title: 'Read book' }} />
    <TodoItem key="2" todo={{ id: '2', title: 'Play Music' }} />
  </ul>
</div>
```

這正是 `<TodoList>` 所回傳的 React element。而我們便可以對這串 React element tree 做一些斷言來測試 `<TodoList>` component 的實作是否正確，例如：
- 裡面有兩個 `<TodoItem />`。
- 第一個 `<TodoItem />` 的 `todo` prop 會是 `todos[0]`。
注意到 shallow rendering 沒有去執行 `<TodoItem>` 的 render，而將它當作執行的結果用來斷言。

shallow rendering 的目的在於確保個別 component 是否正確 render 出 react element，而不關心下一層 component 的 render 邏輯。

#### shallow = mock

某種意義上來說，shallow 即是 mock，想像我們今天要測試 `plusSelf` 這個函數：

```js
// plus.js
function plus(n1, n2) {
  return n1 + n2;
}

// plusSelf.js
function plusSelf(n) {
  return plus(n, n);
}

```

直觀的做法可能是直接對 plusSelf 的結果，也就是數字做斷言，例如：

```js
expect(plusSelf(2)).toEqual(4)
```

而 `shallow` 的測法等同於把 `plus` 這個 function 用 `jest.fn` mock 掉，並斷言 `plusSelf` 正確的把參數代入 `plus` 函數裡：

```js
import plus from 'plus.js';

jest.mock('plus.js', () => jest.fn())

// assert
plusSelf(2);
expect(plus).toBeCalledWith(2, 2);
```

在這個簡單的例子裡，顯然前者的測試方式比較簡單。然而如果 `plus()` 有其它難以準備的依賴(例如需要 api server、 file system)，則後者是一個解法。

### mount(full rendering)

mount 的測法會直接呼叫 React.renderDOM 來 render component，對 render 後得到的 DOM tree 做斷言。

繼續沿用上述的例子，在 mount 的情形，得到的 result 就會是

```html
<div>
  <h1>Todo List</h1>
  <ul>
    <li>Todo: Read book</li>
    <li>Todo: Play Music</li>
  </ul>
</div>
```

注意這裡是 DOM element，而不是 React element，由此你可以斷言 render 出來的 DOM 有兩個 `<li>`，裡面分別是兩個 todo 的內容。

### shallow vs mount

哪個才是較好的做法？筆者覺得可以從幾個地來探討：
- 信心：測試過了，那程式對了嗎？我們得到想要的結果了嗎？

  對前端來說，最終且最重要的結果就是 DOM tree 是否正確。
  mount 在這一點沒有問題，因為我們最後斷言的正是 DOM tree，所以只要測試過了，代表結果就是正確的。

  shallow 則只能確定個別 component 的 render 給出了正確的 react element，但無法確定 child component 的 render 也是對的。要確定 child component 也是對的，必須也對 child component 做 shallow rendering。就理論來說，必須測試所有 component 才能確保最終 render 出來的 DOM 是對的，而且是間接的得知。

  此外，shallow 可能發生測試過了，但實際執行卻失敗的狀況(false positive)。以上面的 `<TodoList>` 為例，若 `<TodoItem>` 的 props 名稱改了，而忘了改 `<TodoList>` 的 render function，此時真的去 render `<TodoList>` 就會因為沒有代到新的 props 而出問題，但 `<TodoList>` 的測試卻還會是正確的。這就使得測試結果即使正確，我們仍然需要用其它方式來確定程式執行正確。

  因此就測試過了=程式對了這點來說，mount 會是好的多的選擇。 

- 撰寫的容易程度

  mount 因為會執行完整的 rendering，SAT(System Under Tesst) 較大，需要的 mock 通常較多。通常 component 越上層，它需要的 mock 就會愈多，準備起來愈花力氣。

  相較之下，shallow render 因為只需要照顧單層 component 的依賴，SAT 小，寫起來較快且容易。

- 可維護性

  兩者都有其難處。
  mount 的困難在於當 child component 的依賴變化時，測試必須跟著更新 mock，增加維護成本。

  shallow 則在於當 component render 的 react element 變更的時候，即使實際上最後 DOM 沒有變，測試還是會壞而需要修改，不利於 refactor。

- 社群與工具

  這點 mount 大勝。

  原因是 React 官方再也不維護 shallow renderer，而 shallow renderer 也未完全支援 hooks，例如 `useEffet` 在 shallow renderer 中是不能正確執行的。而唯一支援 shallow rendering 測試方式的 `enzyme` 更新的速度也緩慢。

  相對來說 mount 的測試工具則有很多選擇，`enzyme` 裡面的 `mount()`、`react-testing-library`、甚至近期的 cypress component testing 等等。相比 `enzyme`，後兩者的專案較常更新，健康程度也較好。
