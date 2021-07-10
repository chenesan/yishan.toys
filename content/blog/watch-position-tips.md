---
title: 我錯了，取使用者定位沒這麼簡單。
date: '2021-07-10T17:30:00.000Z'
tags: ["frontend", "programming"]
excerpt: '聊聊最近用 navigator.geolcation.watchPosition 監聽使用者定位踩到的雷；safari 加油啊。'
---

## 初見 `navigator.geolocation.watchPosition`

最近專案上遇到要在網頁上監聽使用者定位的需求，餵狗一下就找到了 [`navigator.geolocation.watchPosition`](https://developer.mozilla.org/zh-TW/docs/Web/API/Geolocation/watchPosition) 這 api。

初看之下覺得很簡單。呼叫 `watchPosition()` 之後，瀏覽器會跳出詢問使用者是否要授權該網站取得定位資訊的 popup，如果使用者接受，瀏覽器就去抓定位，抓到了就會帶著位置資訊傳進 success 的 callback，後續有使用者位置變更時也會呼叫 success callback；反之如果使用者拒絕，或是使用者雖然接受了但瀏覽器卻抓不到位置，則呼叫 error callback。以 React component 實作大概就像這樣：

```jsx
function CurrentLatLng() {
    const [loading, setLoading] = useState(false);
    const [latlng, setLatLng] = useState(null);

    // watch position on mount
    useEffect(
        () => {
            const options = {
                timeout: 10000,
            };

            setLoading(true);
            const watchId = navigator.geolocation.watchPosition(
                // success callback
                (position) => {
                    console.log('Got position!', position);
                    setLoading(false);
                    setLatLng({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    })
                    // do something with position data,
                },
                // error callback
                (error) => {
                    console.log('error')
                    setLoading(false);
                    setLatLng(null);
                    // show error ui
                },
                options
            );

            return () => {
                navigator.geolocation.clearWatch(watchId);
            }
        }
    );

    if (loading) {
        return <LoadingIcon />;
    }

    if (!latlng) {
        return 'No Data';
    }
    
    return (
        <div>
            user latitude: {latlng.lat},
            user longitude: {latlng.lng},
        </div>
    );
}

```

感覺不難。

## 事情永遠不是你想的那樣

功能做完進測之後，QE 回報在 ios(iphone / ipad，12 / 13 / 14 都會) 上，如果把系統定位關掉，進入頁面時索取定位的 popup 彈不出來，而畫面上等待索取定位的 loading icon 就一直不停的轉轉轉。

我進去看，發現 success 和 error callback 都沒有呼叫，所以程式完全無法判斷現在 loading 可以結束了沒。

登楞。

## 「不對啊，我有在 options 裡帶 timeout 餒！」

這個...此 timeout 非彼 timeout 啊。

[MDN](https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions/timeout) 沒詳細寫，在 StackOverflow 上爬了五六篇文才看到有人說，[options 的 timeout 是指系統取得使用者授權後，取得使用者定位的時間限制](https://stackoverflow.com/questions/3397585/navigator-geolocation-getcurrentposition-sometimes-works-sometimes-doesnt/3885172#comment40751568_3885172)。也就是說，如果使用者看到授權 popup 卻沒有動作，`watchPosition` 的 callback 永遠不會被呼叫，即使你有設這個 timeout。

而在使用者關閉系統定位、載入頁面後索取定位的情況下，android chrome 會自動呼叫 error callback、手邊的桌機(MacOS)也會，所以至少我們還可以隱藏 loading icon。但...就你 ios safari 和別人不一樣，連 error callback 也不呼叫......不愧是新一代 IE 的 safari 啊。

神祕的是，後續如果再重開頁面，或是在使用者點擊按鈕後才索取定位，這時 ios safari 就能正常呼叫 error callback 了，真是遲鈍(？)。我猜測，或許 safari 不鼓勵網頁在未發生使用者互動的狀況下觸發定位授權吧(確實有點擾民)，但有時 application 又的確需要這麼做......

## 我們可以先用 [`navigator.permissions.query`](https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query) 看使用者是否拒絕我們給定位，拒絕的話就不要定位了！

聽起來好像可以！我看看 api 怎麼用！

(After googling around 10 minutes)

不，CanIUse 說有個常見的瀏覽器不支援這個 api，猜猜是誰？你知道的，[safari](https://caniuse.com/permissions-api)。

## 最後的解法

只好自己做 timeout，當 success / error 時清掉 timeout，否則就把 loading 設為 false。

```jsx
function CurrentLatLng() {
    const [loading, setLoading] = useState(false);
    const [latlng, setLatLng] = useState(null);

    // watch position on mount
    useEffect(
        () => {
            let watchPositionTimeoutHandle = null;
            const options = {
                timeout: 10000,
            };

            setLoading(true);
            const watchId = navigator.geolocation.watchPosition(
                // success callback
                (position) => {
                    console.log('Got position!', position);
                    setLoading(false);
                    setLatLng({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    })
                    window.clearTimeout(watchPositionTimeoutHandle);
                    watchPositionTimeoutHandle = null;
                    // do something with position data,
                },
                // error callback
                (error) => {
                    console.log('error')
                    setLoading(false);
                    setLatLng(null);
                    window.clearTimeout(watchPositionTimeoutHandle);
                    watchPositionTimeoutHandle = null
                    // show error ui
                },
                options
            );

            watchPositionTimeoutHandle = window.setTimeout(
                () => {
                    // if watchPositionTimeoutHandle exists, that means callback not fire
                    // clearWatch and loading state by ourselves.
                    navigator.geolocation.clearWatch(watchId);
                    setLoading(false);
                },
                500
            );

            return () => {
                navigator.geolocation.clearWatch(watchId);
            }
        }
    );

    if (loading) {
        return <LoadingIcon />;
    }

    if (!latlng) {
        return 'No Data';
    }
    
    return (
        <div>
            user latitude: {latlng.lat},
            user longitude: {latlng.lng},
        </div>
    );
}
```

## 其它的疑難雜症

### 我在本機開發的時候可以拿得到定位啊，怎麼放到 production 上就不行？

悲劇啊，兄弟，去確認一下你的 production 有沒有 https 吧，出於安全因素[沒有 https 的話瀏覽器不支援 Geolocation api。](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/geolocation)

至於為什麼 localhost 就可以...你從瀏覽器連到本機上，還需要擔心你的位置會被中間人偷走嗎？

### 為什麼我的 callback 這麼慢才回來？

最有可能的是餵給 `navigator.geolocation.watchPosition` 的 `options` 裡多設了 `enableHighAccuracy: true`。顧名思義這會要求瀏覽器取得高精準度的定位，速度就有可能慢到好幾秒。

請設成 `false`，或是不要加這個 key 就好(預設為 `false`)。

也有可能就是 device 比較慢啦。

### 要怎麼讓位置的更新頻率快一點？

如果明明使用者的位置變了但 success callback 沒有立刻拿到新的位置，有可能是你從 StackOverflow 抄來的 code 對 `options` (是的又是 `options`)多設了 `maximumAge`。

`maximumAge` 是用來告訴瀏覽器我們可以接受位置被暫存的時間，例如 `maximumAge` 設為 10000ms，代表我們接受拿到的位置最多會 cache 十秒，所以即使實際位置更新了，瀏覽器也可能在十秒後才傳回來。

如果要確保拿到最新位置，請將 `maximumAge` 設為 0，或是不要加這個 key 就好(預設為 `0`)。

---

感想：即使你以為和 javascript 很熟了(或者沒有)，沒用過的 html5 api 最好還是小心一點啊。
