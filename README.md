# Slack-reminder

Slackのリマインダーコマンドを生成 or 設定してくれるSlack App
ショートカットからGUIでリマインダーを生成できる

# DEMO

![slackremind](https://user-images.githubusercontent.com/52233630/206196122-6afc3168-54ae-44f4-94b7-71d8e539a980.gif)

# Features

Slackのリマインド機能は便利ですが、いちいちコマンドを覚える必要があります
このAppを使うことにより、Slackのリマインドコマンドをいちいち覚える必要がなくなります！
あなたは画面から設定項目を記入するだけでよいのです

# Requirement

* node 16.x
* npm 8.15.x
* serverlessFramework 3.22.x

# Installation

レポジトリのclone、ライブラリインストール以外に、Slack App の作成と aws cli の設定が必要


# 手順

- リポジトリclone ライブラリ追加
```bash
git clone ○○
cd xx
sudo apt update
sudo apt install nodejs
nodejs -v
sudo apt install npm
```

- Slack App 作成

- aws cli 設定

- serverless faramework を用いてデプロイ

- 作成されたエンドポイントを Slack App に設定

# Usage

Slackのshortcutから選択して使用

# Note

* Slack api でチャンネル指定のリマインドが未対応(2022/09/20時点)のため、チャンネル指定だけはコマンドが作成されます
* modalの仕様上、リマインド内容にユーザ名を含めることができません
* 
