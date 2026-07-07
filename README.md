# きょうやる

今日やることに集中する、シンプルで気持ちいいToDo PWA。
単一HTML + Vanilla JS + localStorage。ビルド不要・外部依存なし・オフライン動作。

**▶ 公開版: https://omicreate.github.io/kyou-yaru/**

## ローカルで動かす

```bash
git clone https://github.com/omicreate/kyou-yaru.git
cd kyou-yaru
python3 -m http.server 8000
# → http://localhost:8000
```

Service Worker は http://localhost でも動作します。

## 機能

- タスクの追加 / 完了 / 編集 / 削除（編集はタスクをタップ → ボトムシート）
- 「じぶん／しごと」の切り替え（v1.1〜）。ストリークと日々の実績は両方合算（分けると土日に途切れるため意図的に共通）
- 期限・優先度（低/中/高）・タグ・検索・フィルタ
- 「きょう」トグルで今日ビューに送る（期限が今日のタスクも自動で今日ビューに出る）
- ドラッグ並べ替え（タッチは長押し300msで開始、マウスは ⠿ ハンドル）
- ストリーク（1日1件以上完了で継続）・直近14日グラフ・タグ別集計
- ダークモード（自動 / ライト / ダーク）
- 今日ぜんぶ完了で「済」スタンプ + 紙吹雪

## データ

- localStorage キー `kyouyaru.data`（1 JSON、schemaVersion付き）
- 破損時は `kyouyaru.data.backup` に退避してから初期化（全損防止）
- 完了実績（stats.daily）はタスク本体と別持ち — 完了タスクを削除しても実績は残る

## 検証チェックリスト

- [ ] CRUD: 追加 / 編集 / 完了 / 取り消し / 削除 / 復元 → リロード後も整合
- [ ] 並べ替え: 長押しで開始・スクロールと競合しない・順序が保存される
- [ ] フィルタ × 検索の組み合わせ、タグの付け外し
- [ ] 日付境界: コンソールで `__debugSetToday("2026-07-08")` → 日またぎ・持ち越し・ストリーク途切れを確認（`__debugSetToday(null)` で戻す）
- [ ] ダークモード: 手動切替 + OS設定連動 + theme-color 反映
- [ ] `prefers-reduced-motion` 有効時にアニメーションが消える
- [ ] PWA: DevTools > Application で manifest 認識・SW activated・オフライン切替でリロード動作
- [ ] iOS: ホーム画面に追加 → standalone 起動・アイコン表示
- [ ] SW更新: sw.js の `CACHE_NAME` を上げて再読み込み → 旧キャッシュが消える

## 更新時の注意

アプリを更新したら `sw.js` の `CACHE_NAME` のバージョンを上げること（例: `kyou-yaru-v1.0.1`）。
