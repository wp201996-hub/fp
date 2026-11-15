# リンクページ(Netlify用)

## 公開の手順
1. このフォルダ全体を GitHub の新しいリポジトリに入れる
2. Netlify で「Add new site → Import an existing project」からそのリポジトリを選ぶ(設定は自動で読み込まれます)
3. 「Environment variables」に EDIT_PASSWORD を追加して、編集用パスワードを入れる(未設定だと「changeme」になります)
4. Deploy を押す

## 使い方
- ページのURLの末尾に #edit を付けて開くと、「編集する」ボタンが出ます(例: https://xxxx.netlify.app/#edit)
- 編集内容は自動で保存され、Netlify Blobs に入ります
- パスワードは、編集画面の「編集用パスワードを変更」から変えられます(6文字以上)。変えると、環境変数より変更後が優先されます
