---
title: React 的開發者測試
date: '2020-05-14T23:00:00.000Z'
tags: ["React", "programming", "Javascript"]
---

想寫 component testing 一陣子了，這裡整理筆者所知的概念和工具。各有好壞，讀者可以自行斟酌。

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

如上，UI 測試的維護成本很高。因此，在撰寫 UI 測試之前，得先思考這段測試保護的 UI 規格，價值是否這麼重要。

## component test 的兩大流派：shallow & mount

component 的測試方式可以分為兩種：
- shallow rendering(或簡稱 shallow)
- full rendering(或簡稱 mount)

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

shallow rendering 只會執行一層 component 的 render，斷言該層 render 回傳的 React element 或發生的行為。

以上面的例子，假設我們想要測試 `<TodoList>` 是否在傳入 todos 的時候，有 render 出同樣數量的 `<TodoItem>`，就會寫出如下的測試程式碼(以 [enzyme](https://github.com/enzymejs/enzyme) 測試函式庫為例)：
```jsx
import React from 'react';
import { shallow } from 'enzyme';
import TodoList from '../TodoList';
import TodoItem from '../TodoItem';

it('Givent two todos, <TodoList> should render two <TodoItem>', () => {
  const todos = [
    { id: '1', title: 'Read book' },
    { id: '2', title: 'Play music' },
  ];

  const wrapper = shallow(
    <TodoList todos={todos} />
  );

  expect(wrapper.find(TodoItem)).toHaveLength(2);
});
```

而因為它只執行一層 render，`<TodoItem>` 的 render 不會被執行，因此 render 的結果不會包含 `<TodoItem>` 的 `<li>`，下面的斷言會失敗：

```jsx
expect(wrapper.find('li')).toHaveLength(2);
```

shallow rendering 只關心個別 component 的 render 是否正確，而不關心下一層 component 的 render 邏輯。

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

而 `shallow` 的測法等同於把 `plus` 這個 function 用 `jest.fn` mock 掉，並斷言 `plusSelf` 正確的把參數代入 `plus` 函數呼叫：

```js
import plus from './plus';
import plusSelf from './plusSelf';

jest.mock('./plus.js', () => jest.fn())

// assert
plusSelf(2);
expect(plus).toBeCalledWith(2, 2);
```

顯然前者的測試方式比較簡單。然而如果 `plus()` 有難以準備的依賴(例如需要 api server、 file system)，後者是一個解法。

#### 支援的測試函式庫

早期 React 官方有提供 shallow renderer 支援用 shallow rendering 的方式測試，但隨著時間經過，[React 官方已經在 2020 年將 shallow renderer 移出 React repo](https://github.com/facebook/react/pull/18144)，而鼓勵 React 的使用者採用 mount 的方式測試，測 render 出的 DOM 結果。

目前，只有 `enzyme` 能支援 shallow rendering 的測試方式，其背後也是使用被移出的 [`react-shallow-renderer`](https://github.com/enzymejs/react-shallow-renderer)。

### full rendering

full rendering 的測法會直接呼叫 `React.renderDOM` 來 render component，對 render 後得到的 DOM tree 做斷言。

沿用上述的例子，採用 full rendering 的測試方式時，我們不再斷言 `<TodoList>` 會 render `<TodoItem>`；而是 斷言 render 出來的 DOM element。

同樣以 enzyme 為例，會得到下列的測試程式碼：

```jsx
import React from 'react';
import { mount } from 'enzyme';
import TodoList from '../TodoList';

it('Givent two todos, <TodoList> should render two <li>', () => {
  const todos = [
    { id: '1', title: 'Read book' },
    { id: '2', title: 'Play music' },
  ];

  const wrapper = mount(
    <TodoList todos={todos} />
  );

  expect(wrapper.find('li')).toHaveLength(2);
});
```

(實際上用 enzyme 時，用 `mount` 得到的 wrapper 同樣可以用來尋找 `<TodoItem>`，但這裡為了介紹測試的概念就不多談。)

另一個現在流行的 React 測試函式庫 [`react-testing-library`](https://testing-library.com/docs/react-testing-library/intro) 則會像這樣：

```jsx
import React from 'react';
import { screen, render } from '@testing-library/react';

it('Givent two todos, <TodoList> should render two <li>', () => {
  const todos = [
    { id: '1', title: 'Read book' },
    { id: '2', title: 'Play music' },
  ];

  render(<TodoList todos={todos} />)

  expect(screen.getAllByRole('listitem')).toHaveLength(2);
});
```

#### 支援的測試函式庫

相較 shallow rendering，支援 full rendering 的測試函式庫就多得多，包含：
- [enzyme](https://enzymejs.github.io/enzyme/)
- [react-testing-library](https://testing-library.com/docs/react-testing-library/intro)
- [cypress component testing](https://docs.cypress.io/guides/component-testing/introduction#What-is-Component-Testing)

三者各有擅場。enzyme 提供大量的 query function(類似 jQuery)查找元素；react-testing-library 則透過文字內容、role 等貼近使用者的方式 query 元素；cypress component testing 則是可以在瀏覽器原生環境下 render component，並用 cypress 的測試框架寫測試。

### shallow vs mount

哪個才是較好的做法？筆者覺得可以從幾個點來探討：

- 目的

  我們為 component 寫測試可能有幾種目的，不同目的下適用的程度也不同：
  - 想要確保最終 render 出來的 DOM tree 是否正確。
    mount 在這一點沒有問題，因為 mount 的結果正是 DOM tree，所以只要測試過了，代表結果就是正確的。

    shallow 則只能確定個別 component 的 render 給出了正確的 react element，但無法確定 child component 的 render 也是對的。要確定下一層 child component 的 rener 正確，必須也對 child component 做 shallow rendering。就理論來說，必須測試所有 component 才能確保最終 render 出來的 DOM 是對的，可能會非常費工且難以維護。

    就這個目的來說 mount 是正確的工具。

  - 只想確定這一個 component 的邏輯正確
    mount 在 component 下面 child component 不多的情況下沒有問題，但若 component 下有很深的 component tree 則可能因為 child component 的依賴需要造 mock、寫起來較困難。

    shallow 不必考慮 child component 所以可以省掉這個麻煩，寫起來較快。

- 可維護性

  兩者都有其難處。

  mount 的困難在於當 child component 的依賴變化時，測試必須跟著更新 mock，增加維護成本。

  shallow 則在於當 component 的實作變更的時候(e.g. 把 child component 拆掉)，即使實際上最後 DOM 沒有變，測試還是會壞而需要修改，不利於 refactor。

  shallow 還可能發生測試過了，但實際執行卻失敗的狀況(false positive)。以上面的 `<TodoList>` 為例，若 `<TodoItem>` 的 props 名稱改了，而忘了改 `<TodoList>` 的 render function，此時真的去 render `<TodoList>` 就會因為沒有代到新的 props 而出問題，但 `<TodoList>` 的測試卻還會是正確的。

- 社群與工具

  這點 mount 大勝。

  原因是 React 官方再也不維護 shallow renderer，而 shallow renderer 也未完全支援 hooks，例如 [`useEffet` 在 shallow renderer 中不能正確執行](https://github.com/facebook/react/issues/15275)。而唯一支援 shallow rendering 測試方式的 `enzyme` 更新的速度最近也趨緩。

  相對來說 mount 的測試工具則有很多選擇，`enzyme` 裡面的 `mount()`、`react-testing-library`、甚至近期的 cypress component testing 等等。


